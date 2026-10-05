import "server-only";
import { OAuth2Client } from "google-auth-library";
import { cookies } from "next/headers";
import { readSession } from "@/redis/sessions";

export const SESSION_COOKIE = "buckets_session";
export const STATE_COOKIE = "buckets_oauth_state";
export const cookieOptions = () => ({ httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" });
export class AuthError extends Error {
  constructor(public readonly code: "configuration" | "denied" | "failed" | "state" | "cancelled") { super(code); }
}
export function authConfig() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const callback = process.env.GOOGLE_OAUTH_CALLBACK_URL;
  const allowedEmails = new Set((process.env.GOOGLE_OAUTH_ALLOWED_EMAILS ?? "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean));
  if (!clientId || !clientSecret || !callback || !allowedEmails.size) throw new AuthError("configuration");
  try {
    const url = new URL(callback);
    if (url.pathname !== "/auth/google/callback" || url.search || url.hash || url.username || url.password || (url.protocol !== "https:" && !(url.protocol === "http:" && process.env.NODE_ENV !== "production" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)))) throw new Error();
  } catch { throw new AuthError("configuration"); }
  return { clientId, clientSecret, callback, allowedEmails };
}
export async function verifyIdentity(code: string, nonce: string) {
  const config = authConfig();
  const client = new OAuth2Client({ clientId: config.clientId, clientSecret: config.clientSecret, redirectUri: config.callback, transporterOptions: { timeout: 10000, retry: false } });
  try {
    const { tokens } = await client.getToken(code);
    if (!tokens.id_token) throw new AuthError("failed");
    const ticket = await client.verifyIdToken({ idToken: tokens.id_token, audience: config.clientId });
    const identity = ticket.getPayload();
    if (!identity || !("nonce" in identity) || identity.nonce !== nonce || !identity.sub?.trim() || identity.email_verified !== true || !identity.email) throw new AuthError("failed");
    if (!config.allowedEmails.has(identity.email.trim().toLowerCase())) throw new AuthError("denied");
    return identity.sub;
  } catch (error) {
    if (error instanceof AuthError) throw error;
    throw new AuthError("failed");
  }
}
export async function currentSession() {
  const jar = await cookies();
  return readSession(jar.get(SESSION_COOKIE)?.value);
}
