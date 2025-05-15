import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    minimumCacheTTL: 2678400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "scontent.cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "instagram.fbom6-1.fna.fbcdn.net",
      },
      {
        protocol: "https",
        hostname: "bandit-brothers-s3-storage.s3.ap-south-1.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
