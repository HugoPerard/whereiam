import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL(process.env.AVATAR_URL ?? "")],
  },
};

export default nextConfig;
