import type { NextConfig } from "next";

const s3Bucket = process.env.AWS_S3_BUCKET;
const s3Region = process.env.AWS_REGION ?? "us-east-1";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Apenas o bucket configurado — evita carregar imagens de buckets de terceiros
      ...(s3Bucket
        ? [{ protocol: "https" as const, hostname: `${s3Bucket}.s3.${s3Region}.amazonaws.com` }]
        : []),
      // Pexels (fotos das vacas e intrusos humanos)
      { protocol: "https", hostname: "images.pexels.com" },
      // Wikimedia (Lulubelle III — Atom Heart Mother)
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
