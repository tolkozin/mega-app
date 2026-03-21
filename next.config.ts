import type { NextConfig } from "next";

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

export default nextConfig;
