import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow FastAPI backend
  async rewrites() {
    return [
      {
        source: "/api/run/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/run/:path*`,
      },
      {
        source: "/api/export/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/export/:path*`,
      },
    ];
  },
};

export default nextConfig;
