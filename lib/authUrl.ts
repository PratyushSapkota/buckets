type Environment = Record<string, string | undefined>;

// Keep the fallback aligned with NextAuth v4's Vercel URL detection.
// This module also runs in next.config.ts, so it must not import server-only code.
export function resolveAuthUrl(env: Environment): string | undefined {
  if (env.NEXTAUTH_URL !== undefined) return env.NEXTAUTH_URL;
  if (env.VERCEL !== "1" || !env.VERCEL_URL) return undefined;

  const hostname = env.VERCEL_URL;
  const domain = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;
  if (hostname.length > 253 || hostname.trim() !== hostname || !domain.test(hostname)) return undefined;
  return `https://${hostname}`;
}
