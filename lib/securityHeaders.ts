export function securityHeaders(production: boolean, origin?: string) {
  const baseline = "frame-ancestors 'none'; object-src 'none'; base-uri 'self'";
  // Inline Next.js and Mantine scripts must gain nonces before enforcing this policy.
  // Report-only keeps the beta working while violations can be inspected in the browser.
  const reportOnly = [
    "default-src 'self'",
    production ? "script-src 'self'" : "script-src 'self' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://*.googleusercontent.com",
    "font-src 'self'",
    "connect-src 'self'",
    "form-action 'self'",
    baseline,
  ].join("; ");
  const headers = [
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "no-referrer" },
    { key: "Content-Security-Policy", value: baseline },
    { key: "Content-Security-Policy-Report-Only", value: reportOnly },
  ];
  let https = false;
  try { https = new URL(origin ?? "").protocol === "https:"; } catch { /* Invalid settings are reported by server configuration validation. */ }
  if (production && https) {
    headers.push({ key: "Strict-Transport-Security", value: "max-age=31536000" });
  }
  return headers;
}
