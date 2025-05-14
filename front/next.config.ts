import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config) => {
    // Add WebSocket support
    config.infrastructureLogging = {
      level: 'error',
    };
    
    return config;
  },
};

export default nextConfig;
