import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image configuration for external domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'platform-lookaside.fbsbx.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'graph.facebook.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Handle cross-domain setup
  async rewrites() {
    return [
      {
        source: '/auth/:path*',
        destination: 'https://auth.local.bndy.test:3000/auth/:path*',
      },
      {
        source: '/api/:path*',
        destination: 'https://api.local.bndy.test:3000/api/:path*',
      }
    ];
  },
  // Allow cross-origin requests during development
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*.local.bndy.test',
          },
        ],
      },
    ];
  }
};

export default nextConfig;
