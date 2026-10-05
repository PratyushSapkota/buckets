import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { renderToStaticMarkup as renderMarkup } from "react-dom/server";
import { createElement, type ReactNode } from "react";
import { MantineProvider } from "@mantine/core";

const renderToStaticMarkup = (node: ReactNode) => renderMarkup(createElement(MantineProvider, { env: "test" }, node));

const mocks = vi.hoisted(() => {
  const values = new Map<string, { value: string; expires: number }>();
  const get = vi.fn(async (key: string) => {
    const item = values.get(key);
    if (!item || item.expires <= Date.now()) { values.delete(key); return null; }
    return item.value;
  });
  const client = {
    isReady: true, isOpen: true, on: vi.fn(), connect: vi.fn(), destroy: vi.fn(),
    set: vi.fn(async (key: string, value: string, options: { EX: number }) => { values.set(key, { value, expires: Date.now() + options.EX * 1000 }); return "OK"; }),
    get,
    getDel: vi.fn(async (key: string) => { const value = await get(key); values.delete(key); return value; }),
    del: vi.fn(async (key: string) => Number(values.delete(key))),
  };
  return { values, client, getToken: vi.fn(), verifyIdToken: vi.fn(), cookies: vi.fn() };
});
vi.mock("server-only", () => ({}));
vi.mock("redis", () => ({ createClient: () => mocks.client }));
vi.mock("google-auth-library", () => ({
  OAuth2Client: class { getToken = mocks.getToken; verifyIdToken = mocks.verifyIdToken; },
}));
vi.mock("next/headers", () => ({ cookies: mocks.cookies }));
vi.mock("next/navigation", () => ({ redirect: (path: string) => { throw new Error("REDIRECT:" + path); } }));

import { GET as start } from "@/app/auth/google/route";
import { GET as callback } from "@/app/auth/google/callback/route";
import { POST as logout } from "@/app/logout/route";
import Home from "@/app/page";
import Login from "@/app/login/page";
import { AuthError, authConfig, cookieOptions, SESSION_COOKIE, STATE_COOKIE, verifyIdentity } from "@/auth/service";
import { createSession, readSession, SESSION_TTL, HANDSHAKE_TTL } from "@/redis/sessions";

const origin = "http://localhost:3000";
const identity = { sub: "google-sub", email: " APPROVED@example.com ", email_verified: true, nonce: "" };
function request(path: string, cookie = "", method = "GET", requestOrigin?: string) {
  return new NextRequest(origin + path, { method, headers: { cookie, ...(requestOrigin ? { origin: requestOrigin } : {}) } });
}
async function handshake() {
  const response = await start(request("/auth/google"));
  const params = new URL(response.headers.get("location")!).searchParams;
  const state = params.get("state")!;
  identity.nonce = params.get("nonce")!;
  return { response, state, cookie: STATE_COOKIE + "=" + state };
}
async function finish() {
  const flow = await handshake();
  return callback(request("/auth/google/callback?code=code&state=" + flow.state, flow.cookie));
}
beforeEach(() => {
  vi.stubEnv("NODE_ENV", "test");
  vi.stubEnv("REDIS_URL", "redis://localhost:6379");
  vi.stubEnv("GOOGLE_OAUTH_CLIENT_ID", "client-id");
  vi.stubEnv("GOOGLE_OAUTH_CLIENT_SECRET", "secret");
  vi.stubEnv("GOOGLE_OAUTH_CALLBACK_URL", origin + "/auth/google/callback");
  vi.stubEnv("GOOGLE_OAUTH_ALLOWED_EMAILS", "approved@example.com");
  mocks.values.clear();
  mocks.client.set.mockClear();
  mocks.client.get.mockReset();
  mocks.client.get.mockImplementation(async (key: string) => {
    const item = mocks.values.get(key);
    if (!item || item.expires <= Date.now()) { mocks.values.delete(key); return null; }
    return item.value;
  });
  mocks.client.del.mockReset();
  mocks.client.del.mockImplementation(async (key: string) => Number(mocks.values.delete(key)));
  identity.sub = "google-sub"; identity.email = " APPROVED@example.com "; identity.email_verified = true;
  mocks.getToken.mockReset();
  mocks.getToken.mockResolvedValue({ tokens: { id_token: "private-id-token", access_token: "private-access-token" } });
  mocks.verifyIdToken.mockReset();
  mocks.verifyIdToken.mockResolvedValue({ getPayload: () => ({ ...identity }) });
  mocks.cookies.mockResolvedValue({ get: () => undefined });
});
afterEach(() => { vi.unstubAllEnvs(); vi.useRealTimers(); });

describe("OAuth", () => {
  it("starts identity-only OAuth with state, nonce and a ten-minute HttpOnly cookie", async () => {
    const { response, state } = await handshake();
    const url = new URL(response.headers.get("location")!);
    expect(url.searchParams.get("scope")).toBe("openid email profile");
    expect(url.searchParams.has("access_type")).toBe(false);
    expect(state).toMatch(/^[a-f0-9]{64}$/);
    expect(mocks.client.set).toHaveBeenCalledWith("oauth:" + state, identity.nonce, { EX: HANDSHAKE_TTL });
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
    expect(response.headers.get("set-cookie")).toContain("SameSite=lax");
    expect(response.headers.get("set-cookie")).toContain("Max-Age=600");
  });
  it("creates only a sub session, redirects home, and never returns Google tokens", async () => {
    const response = await finish();
    const id = response.cookies.get(SESSION_COOKIE)!.value;
    expect(response.headers.get("location")).toBe(origin + "/");
    expect(mocks.client.set).toHaveBeenCalledWith("session:" + id, "google-sub", { EX: SESSION_TTL });
    expect(mocks.verifyIdToken).toHaveBeenCalledWith({ idToken: "private-id-token", audience: "client-id" });
    expect(response.cookies.get(STATE_COOKIE)?.value).toBe("");
    expect(response.headers.get("set-cookie")).toContain("Max-Age=2592000");
    expect(await response.text()).not.toContain("private");
    expect(JSON.stringify([...mocks.values])).not.toContain("private");
  });
  it.each(["missing", "mismatch", "expired", "replayed"])("rejects %s state", async (kind) => {
    const flow = await handshake();
    let path = "/auth/google/callback?code=code&state=" + flow.state;
    let cookie = flow.cookie;
    if (kind === "missing") path = "/auth/google/callback?code=code";
    if (kind === "mismatch") cookie = STATE_COOKIE + "=" + "b".repeat(64);
    if (kind === "expired") { vi.useFakeTimers(); vi.setSystemTime(Date.now() + HANDSHAKE_TTL * 1000 + 1); }
    if (kind === "replayed") await callback(request(path, cookie));
    const count = mocks.getToken.mock.calls.length;
    const response = await callback(request(path, cookie));
    expect(response.headers.get("location")).toBe(origin + "/login?error=state");
    expect(mocks.getToken.mock.calls.length).toBe(count);
  });
  it("handles provider cancellation and consumes the handshake", async () => {
    const flow = await handshake();
    const response = await callback(request("/auth/google/callback?error=access_denied&state=" + flow.state, flow.cookie));
    expect(response.headers.get("location")).toBe(origin + "/login?error=cancelled");
    expect(mocks.values.has("oauth:" + flow.state)).toBe(false);
    expect(mocks.getToken).not.toHaveBeenCalled();
  });
  it("handles missing authorization code", async () => {
    const flow = await handshake();
    const response = await callback(request("/auth/google/callback?state=" + flow.state, flow.cookie));
    expect(response.headers.get("location")).toBe(origin + "/login?error=failed");
  });
  it("denies non-whitelisted email without creating a session", async () => {
    identity.email = "other@example.com";
    expect((await finish()).headers.get("location")).toBe(origin + "/login?error=denied");
    expect([...mocks.values.keys()].filter((key) => key.startsWith("session:"))).toHaveLength(0);
  });
  it.each(["nonce", "sub", "email_verified", "email"])("rejects invalid %s", async (claim) => {
    const flow = await handshake();
    mocks.verifyIdToken.mockResolvedValue({ getPayload: () => ({ ...identity, [claim]: claim === "email_verified" ? false : "" }) });
    const response = await callback(request("/auth/google/callback?code=code&state=" + flow.state, flow.cookie));
    expect(response.headers.get("location")).toBe(origin + "/login?error=failed");
  });
  it.each(["signature", "issuer", "audience", "expiration"])("handles verifier rejection for %s", async () => {
    mocks.verifyIdToken.mockRejectedValue(new Error("verification failure"));
    expect((await finish()).headers.get("location")).toBe(origin + "/login?error=failed");
  });
  it("handles token-exchange failure", async () => {
    mocks.getToken.mockRejectedValue(new Error("upstream secret"));
    expect((await finish()).headers.get("location")).toBe(origin + "/login?error=failed");
  });
  it("rejects missing ID token", async () => {
    mocks.getToken.mockResolvedValue({ tokens: {} });
    await expect(verifyIdentity("code", "nonce")).rejects.toMatchObject({ code: "failed" });
  });
  it("fails closed when Redis cannot store a session", async () => {
    const flow = await handshake();
    mocks.client.set.mockRejectedValueOnce(new Error("connection details"));
    const response = await callback(request("/auth/google/callback?code=code&state=" + flow.state, flow.cookie));
    expect(response.headers.get("location")).toBe(origin + "/login?error=unavailable");
    expect(response.cookies.get(SESSION_COOKIE)).toBeUndefined();
  });
});

describe("configuration, sessions and pages", () => {
  it("requires a whitelist and the retained callback path", () => {
    vi.stubEnv("GOOGLE_OAUTH_ALLOWED_EMAILS", "");
    expect(authConfig).toThrow(AuthError);
    vi.stubEnv("GOOGLE_OAUTH_ALLOWED_EMAILS", "approved@example.com");
    vi.stubEnv("GOOGLE_OAUTH_CALLBACK_URL", origin + "/wrong");
    expect(authConfig).toThrow(AuthError);
  });
  it("uses Secure cookies in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(cookieOptions()).toEqual({ httpOnly: true, secure: true, sameSite: "lax", path: "/" });
  });
  it("looks up sessions without renewing their expiry", async () => {
    const id = await createSession("sub");
    const initial = mocks.values.get("session:" + id)!.expires;
    expect(await readSession(id)).toBe("sub");
    expect(mocks.values.get("session:" + id)!.expires).toBe(initial);
    vi.useFakeTimers(); vi.setSystemTime(initial);
    expect(await readSession(id)).toBeNull();
    expect(await readSession("bad")).toBeNull();
  });
  it("redirects unauthenticated home to login", async () => {
    await expect(Home()).rejects.toThrow("REDIRECT:/login");
  });
  it("redirects authenticated login home and renders authenticated home", async () => {
    const id = await createSession("sub");
    mocks.cookies.mockResolvedValue({ get: () => ({ value: id }) });
    await expect(Login({ searchParams: Promise.resolve({}) })).rejects.toThrow("REDIRECT:/");
    const html = renderToStaticMarkup(await Home());
    expect(html).toContain("Sign out");
    expect(html).toContain('action="/logout"');
  });
  it("renders only safe known login messages", async () => {
    const html = renderToStaticMarkup(await Login({ searchParams: Promise.resolve({ error: "<script>secret</script>" }) }));
    expect(html).toContain("Continue with Google");
    expect(html).not.toContain("secret");
    expect(renderToStaticMarkup(await Login({ searchParams: Promise.resolve({ error: "denied" }) }))).toContain("not approved");
  });
  it("renders retryable home and login when Redis lookup fails", async () => {
    mocks.cookies.mockResolvedValue({ get: () => ({ value: "a".repeat(64) }) });
    mocks.client.get.mockRejectedValue(new Error("private connection details"));
    const home = renderToStaticMarkup(await Home());
    expect(home).toContain("Temporarily unavailable");
    expect(home).not.toContain('action="/logout"');
    expect(renderToStaticMarkup(await Login({ searchParams: Promise.resolve({}) }))).toContain("temporarily unavailable");
  });
});

describe("logout", () => {
  it("deletes the session and clears cookies", async () => {
    const id = await createSession("sub");
    const response = await logout(request("/logout", SESSION_COOKIE + "=" + id, "POST", origin));
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(origin + "/login");
    expect(await readSession(id)).toBeNull();
    expect(response.cookies.get(SESSION_COOKIE)?.value).toBe("");
    expect(response.cookies.get(STATE_COOKIE)?.value).toBe("");
  });
  it.each(["https://evil.example", undefined])("rejects cross-origin or missing origin %s", async (source) => {
    const response = await logout(request("/logout", "", "POST", source));
    expect(response.status).toBe(403);
    expect(mocks.client.del).not.toHaveBeenCalled();
  });
  it("keeps cookies and offers retry when invalidation fails", async () => {
    mocks.client.del.mockRejectedValue(new Error("private"));
    const response = await logout(request("/logout", SESSION_COOKIE + "=" + "a".repeat(64), "POST", origin));
    expect(response.status).toBe(503);
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(await response.text()).toContain("Retry sign out");
  });
});
