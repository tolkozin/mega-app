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
  // Security + cache headers
  async headers() {
    const securityHeaders = [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      {
        key: "Content-Security-Policy",
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://cdn.plot.ly https://*.vercel-scripts.com https://*.sentry.io",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "img-src 'self' data: blob: https:",
          "font-src 'self' https://fonts.gstatic.com",
          "connect-src 'self' https://*.supabase.co https://*.sentry.io https://api.lemonsqueezy.com https://www.googletagmanager.com https://*.vercel-insights.com https://*.vercel-scripts.com " + (apiUrl ?? ""),
          "frame-src 'self' https://*.lemonsqueezy.com",
          "frame-ancestors 'none'",
        ].join("; "),
      },
    ];

    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
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
