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
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://images.pexels.com https://*.amazonaws.com",
              "font-src 'self'",
              "connect-src 'self'",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ]
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
