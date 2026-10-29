import type { NextConfig } from "next";
import { securityHeaders } from "./lib/securityHeaders";
import { resolveAuthUrl } from "./lib/authUrl";

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders(process.env.NODE_ENV === "production", resolveAuthUrl(process.env)) }];
  },
};

export default nextConfig;
