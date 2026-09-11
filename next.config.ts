import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow your phone / LAN device to use the dev server + HMR
  allowedDevOrigins: [
    "10.152.202.165",
    "127.0.0.1",
    "localhost",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;