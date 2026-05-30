import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Localstack (dev)
      { protocol: "http", hostname: "localhost", port: "4566", pathname: "/**" },
      // AWS S3 (qualquer bucket/região)
      { protocol: "https", hostname: "**.amazonaws.com" },
      // Picsum (placeholder das vacas no seed)
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
