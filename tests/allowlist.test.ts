import { afterEach, expect, it, vi } from "vitest";
import { isAllowedEmail } from "@/lib/allowlist";
import { authOptions } from "@/lib/auth";

afterEach(() => vi.unstubAllEnvs());
it("normalizes allowlist entries and fails closed for an empty list", () => {
  vi.stubEnv("GOOGLE_OAUTH_ALLOWED_EMAILS", " Owner@Example.com ,other@example.com,");
  expect(isAllowedEmail(" owner@EXAMPLE.com ")).toBe(true);
  expect(isAllowedEmail("unknown@example.com")).toBe(false);
  vi.stubEnv("GOOGLE_OAUTH_ALLOWED_EMAILS", "");
  expect(isAllowedEmail("owner@example.com")).toBe(false);
});
it("requires Google to verify an allowed email at sign-in", async () => {
  vi.stubEnv("GOOGLE_OAUTH_ALLOWED_EMAILS", "owner@example.com");
  const signIn = authOptions.callbacks!.signIn!;
  const input = { user: { id: "test" }, account: { provider: "google", type: "oauth" as const, providerAccountId: "test" }, profile: { email: "owner@example.com", email_verified: true } };
  expect(await signIn(input)).toBe(true);
  const unverified = { ...input, profile: { ...input.profile, email_verified: false } };
  expect(await signIn(unverified)).toBe(false);
  expect(await signIn({ ...input, account: { ...input.account, provider: "other" } })).toBe(false);
});
