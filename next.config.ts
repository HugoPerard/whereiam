import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "prdhugo.fr",
        pathname: "/favicon.svg",
      },
    ],
  },
};

export default nextConfig;
