import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "4566", pathname: "/**" },
      { protocol: "https", hostname: "**.amazonaws.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
