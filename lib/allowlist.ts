import "server-only";

export function isAllowedEmail(email: string): boolean {
  const allowed = (process.env.GOOGLE_OAUTH_ALLOWED_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.trim().toLowerCase());
}
