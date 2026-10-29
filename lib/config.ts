import "server-only";
import { createPrivateKey } from "node:crypto";
import { z } from "zod";
import { LedgerError } from "./ledgerErrors";

const required = z.string().trim().min(1);
const schema = z.object({
  GOOGLE_OAUTH_CLIENT_ID: required,
  GOOGLE_OAUTH_CLIENT_SECRET: required,
  GOOGLE_OAUTH_ALLOWED_EMAILS: z.string().refine((value) => value.split(",").map((email) => email.trim()).filter(Boolean).every((email) => z.email().safeParse(email).success)),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.url().refine((value) => {
    try {
      const url = new URL(value);
      return ["http:", "https:"].includes(url.protocol) && url.pathname === "/" && !url.search && !url.hash && !url.username && !url.password;
    } catch {
      return false;
    }
  }),
  SERVICE_SHEET_ID: required.regex(/^[a-zA-Z0-9_-]+$/),
  GOOGLE_SERVICE_ACCOUNT_EMAIL: z.email(),
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: required,
});

export function validateServerConfig(env: Record<string, string | undefined>) {
  const parsed = schema.safeParse(env);
  if (!parsed.success) {
    const keys = [...new Set(parsed.error.issues.map((issue) => String(issue.path[0])))];
    throw new LedgerError("CONFIGURATION", `Invalid or missing server settings: ${keys.join(", ")}. Check the deployment environment.`);
  }
  const config = parsed.data;
  const url = new URL(config.NEXTAUTH_URL);
  const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (env.NODE_ENV === "production" && url.protocol !== "https:" && !loopback) {
    throw new LedgerError("CONFIGURATION", "NEXTAUTH_URL must use HTTPS for a public production deployment.");
  }
  const key = config.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n").replace(/\r\n/g, "\n").trim() + "\n";
  try {
    if (createPrivateKey(key).asymmetricKeyType !== "rsa") throw new Error("Expected RSA key");
  } catch {
    throw new LedgerError("CONFIGURATION", "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY must contain a valid RSA private key.");
  }
  return { ...config, GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: key };
}

export function getServerConfig() {
  return validateServerConfig(process.env);
}
