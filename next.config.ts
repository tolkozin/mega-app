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
};

export default nextConfig;
