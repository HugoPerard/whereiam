import type { NextConfig } from "next";

const avatarUrl = process.env.AVATAR_URL?.trim();
const nextConfig: NextConfig = {
  images: {
    ...(avatarUrl && {
      remotePatterns: [new URL(avatarUrl)],
    }),
  },
};

export default nextConfig;
