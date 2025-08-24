import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'example.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  webpack: (config, { dev }) => {
    // Suppress webpack pack cache strategy warnings
    if (dev) {
      config.infrastructureLogging = {
        level: 'error',
      };
    }
    
    return config;
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '500mb', // Allow up to 500MB for video uploads
    },
  },
};

export default nextConfig;
