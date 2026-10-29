import { generateKeyPairSync } from "node:crypto";
import { expect, it } from "vitest";
import { validateServerConfig } from "@/lib/config";

// Ephemeral test credentials; never read the developer's environment or contact Google.
const key = generateKeyPairSync("rsa", { modulusLength: 2048, privateKeyEncoding: { type: "pkcs8", format: "pem" }, publicKeyEncoding: { type: "spki", format: "pem" } }).privateKey;
const valid = {
  GOOGLE_OAUTH_CLIENT_ID: "test-client", GOOGLE_OAUTH_CLIENT_SECRET: "test-client-secret",
  GOOGLE_OAUTH_ALLOWED_EMAILS: "owner@example.com", NEXTAUTH_SECRET: "a".repeat(32), NEXTAUTH_URL: "http://localhost:3000",
  SERVICE_SHEET_ID: "test-sheet", GOOGLE_SERVICE_ACCOUNT_EMAIL: "test@example.com", GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: key,
};
it("accepts complete settings and normalizes literal or escaped newlines", () => {
  expect(validateServerConfig(valid).GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY).toBe(key);
  expect(validateServerConfig({ ...valid, GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: key.replace(/\n/g, "\\n") }).GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY).toBe(key);
  expect(validateServerConfig({ ...valid, GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: key.replace(/\n/g, "\r\n") }).GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY).toBe(key);
});
it("reports only setting names, without reflecting secrets or malformed values", () => {
  const malformed = { ...valid, GOOGLE_SERVICE_ACCOUNT_EMAIL: "sensitive-invalid-value", NEXTAUTH_SECRET: "private" };
  expect(() => validateServerConfig(malformed)).toThrow(/GOOGLE_SERVICE_ACCOUNT_EMAIL/);
  try { validateServerConfig(malformed); } catch (error) {
    expect(String(error)).not.toContain("sensitive-invalid-value");
    expect(String(error)).not.toContain("private");
  }
  expect(() => validateServerConfig({})).toThrow(/GOOGLE_OAUTH_CLIENT_ID/);
  expect(() => validateServerConfig({ ...valid, GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: "bad-secret" })).toThrow("must contain a valid RSA private key");
  try { validateServerConfig({ ...valid, NEXTAUTH_URL: "private-invalid-origin" }); } catch (error) {
    expect(String(error)).toContain("NEXTAUTH_URL");
    expect(String(error)).not.toContain("private-invalid-origin");
  }
});
it("requires a public production HTTPS origin but permits local smoke checks", () => {
  expect(() => validateServerConfig({ ...valid, NODE_ENV: "production", NEXTAUTH_URL: "http://public.example.com" })).toThrow(/HTTPS/);
  expect(() => validateServerConfig({ ...valid, NODE_ENV: "production" })).not.toThrow();
  expect(() => validateServerConfig({ ...valid, NODE_ENV: "production", NEXTAUTH_URL: "https://public.example.com" })).not.toThrow();
  expect(() => validateServerConfig({ ...valid, NEXTAUTH_URL: "https://public.example.com/path" })).toThrow(/NEXTAUTH_URL/);
});
it("accepts an intentionally empty allowlist and rejects malformed entries", () => {
  expect(() => validateServerConfig({ ...valid, GOOGLE_OAUTH_ALLOWED_EMAILS: "" })).not.toThrow();
  expect(() => validateServerConfig({ ...valid, GOOGLE_OAUTH_ALLOWED_EMAILS: "not-an-email" })).toThrow(/GOOGLE_OAUTH_ALLOWED_EMAILS/);
});
