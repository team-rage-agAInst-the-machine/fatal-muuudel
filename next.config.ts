import type { NextConfig } from "next";

const s3Bucket = process.env.AWS_S3_BUCKET;
const s3Region = process.env.AWS_REGION ?? "us-east-1";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Localstack (dev)
      { protocol: "http", hostname: "localhost", port: "4566", pathname: "/**" },
      // Apenas o bucket configurado — evita carregar imagens de buckets de terceiros
      ...(s3Bucket
        ? [{ protocol: "https" as const, hostname: `${s3Bucket}.s3.${s3Region}.amazonaws.com` }]
        : []),
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
