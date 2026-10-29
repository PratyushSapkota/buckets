import { expect, it } from "vitest";
import { securityHeaders } from "@/lib/securityHeaders";

const asMap = (production: boolean, origin?: string) => Object.fromEntries(securityHeaders(production, origin).map(({ key, value }) => [key, value]));
it("enforces framing, MIME, referrer, and baseline CSP protections", () => {
  const headers = asMap(false, "http://localhost:3000");
  expect(headers["X-Frame-Options"]).toBe("DENY");
  expect(headers["X-Content-Type-Options"]).toBe("nosniff");
  expect(headers["Referrer-Policy"]).toBe("no-referrer");
  expect(headers["Content-Security-Policy"]).toBe("frame-ancestors 'none'; object-src 'none'; base-uri 'self'");
  expect(headers["Content-Security-Policy-Report-Only"]).toContain("script-src 'self'");
  expect(headers["Content-Security-Policy-Report-Only"]).toContain("style-src 'self' 'unsafe-inline'");
  expect(headers["Content-Security-Policy-Report-Only"]).toContain("https://*.googleusercontent.com");
});
it.each([[false, "https://example.com"], [true, "http://localhost:3000"], [true, undefined], [true, "invalid"]] as const)("omits HSTS for production=%s origin=%s", (production, origin) => {
  expect(asMap(production, origin)["Strict-Transport-Security"]).toBeUndefined();
});
it("enables HSTS only for HTTPS production and omits development eval allowance", () => {
  const headers = asMap(true, "https://buckets.example.com");
  expect(headers["Strict-Transport-Security"]).toBe("max-age=31536000");
  expect(headers["Content-Security-Policy-Report-Only"]).not.toContain("unsafe-eval");
});
