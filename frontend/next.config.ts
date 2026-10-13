import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // images: {
  //   remotePatterns: [
  //     {
  //       protocol: "http",
  //       hostname: "127.0.0.1",
  //       port: "5000",
  //       pathname: "/uploads/**",
  //     },
  //   ],
  // },

  images: {
    domains: ["127.0.0.1", "localhost"],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "3mb",
    },
  },
};

export default nextConfig;
