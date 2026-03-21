import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const nextConfig: NextConfig = {
  // Allow FastAPI backend
  async rewrites() {
    if (!apiUrl) return [];
    return [
      {
        source: "/api/run/:path*",
        destination: `${apiUrl}/api/run/:path*`,
      },
      {
        source: "/api/export/:path*",
        destination: `${apiUrl}/api/export/:path*`,
      },
    ];
  },
  // Cache static assets aggressively
  async headers() {
    return [
      {
        source: "/:path*.svg",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/:path*.png",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/:path*.ico",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/:path*.woff2",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  disableLogger: true,
  sourcemaps: { deleteSourcemapsAfterUpload: true },
  automaticVercelMonitors: true,
});
