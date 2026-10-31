import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pg"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.storage.supabase.co" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/events/press-bits",
        destination: "/events/leader-bytes",
        permanent: true,
      },
      {
        source: "/events/press-bits/:path*",
        destination: "/events/leader-bytes/:path*",
        permanent: true,
      },
      {
        source: "/events/press-bytes",
        destination: "/events/leader-bytes",
        permanent: true,
      },
      {
        source: "/events/press-bytes/:path*",
        destination: "/events/leader-bytes/:path*",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/audio/daily-latest.mp3",
        destination: "/api/audio/daily-latest",
      },
    ];
  },
};

export default nextConfig;
