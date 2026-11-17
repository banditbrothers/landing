import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    minimumCacheTTL: 2678400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      // Instagram CDN host depends on the server's region (e.g. scontent-iad3-1.cdninstagram.com on Vercel)
      {
        protocol: "https",
        hostname: "**.cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "**.fbcdn.net",
      },
      {
        protocol: "https",
        hostname: "bandit-brothers-s3-storage.s3.ap-south-1.amazonaws.com",
      },
    ],
  },
  // PostHog reverse proxy: events go to our own domain so ad blockers don't drop them.
  // Path is deliberately not "posthog"/"ingest" (blocklists match those).
  async rewrites() {
    return [
      { source: "/bb-r/static/:path*", destination: "https://us-assets.i.posthog.com/static/:path*" },
      { source: "/bb-r/array/:path*", destination: "https://us-assets.i.posthog.com/array/:path*" },
      { source: "/bb-r/:path*", destination: "https://us.i.posthog.com/:path*" },
    ];
  },
  // PostHog endpoints end in a slash (/e/, /decide/); don't let Next redirect them
  skipTrailingSlashRedirect: true,
  async redirects() {
    return [
      {
        source: "/order",
        destination: "/checkout",
        permanent: true,
      },
      {
        source: "/designs/:path*",
        destination: "/shop",
        permanent: true,
      },
      {
        source: "/products/:path*",
        destination: "/shop/:path*",
        permanent: true,
      },
      // WhatsApp template buttons only allow the variable at the end of the URL
      {
        source: "/review/:orderId",
        destination: "/order/:orderId/review",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
