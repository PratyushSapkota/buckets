import { afterEach, expect, it, vi } from "vitest";
import { resolveAuthUrl } from "@/lib/authUrl";
import nextConfig from "@/next.config";

afterEach(() => vi.unstubAllEnvs());

it("uses the explicit origin before Vercel's deployment hostname", () => {
  expect(resolveAuthUrl({ NEXTAUTH_URL: "https://buckets.example.com", VERCEL: "1", VERCEL_URL: "buckets-preview.vercel.app" })).toBe("https://buckets.example.com");
  expect(resolveAuthUrl({ NEXTAUTH_URL: "", VERCEL: "1", VERCEL_URL: "buckets.vercel.app" })).toBe("");
});

it("uses the deployment domain rather than an unrelated production-domain variable", () => {
  expect(resolveAuthUrl({ VERCEL: "1", VERCEL_URL: "buckets-preview.vercel.app", VERCEL_PROJECT_PRODUCTION_URL: "buckets.example.com" })).toBe("https://buckets-preview.vercel.app");
});

it("enables production HSTS using Vercel's resolved HTTPS origin", async () => {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("NEXTAUTH_URL", undefined);
  vi.stubEnv("VERCEL", "1");
  vi.stubEnv("VERCEL_URL", "buckets.vercel.app");
  const rules = await nextConfig.headers!();
  expect(rules[0].headers).toContainEqual({ key: "Strict-Transport-Security", value: "max-age=31536000" });
  vi.stubEnv("NEXTAUTH_URL", "http://localhost:3000");
  const explicit = await nextConfig.headers!();
  expect(explicit[0].headers.some((header) => header.key === "Strict-Transport-Security")).toBe(false);
});
