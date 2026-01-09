import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/app/:path*',
        destination: 'http://127.0.0.1:8000/app/:path*',
      },
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8000/api/:path*',
      },
      {
        source: '/sanctum/:path*',
        destination: 'http://127.0.0.1:8000/sanctum/:path*',
      },
    ];
  },
};

export default nextConfig;
