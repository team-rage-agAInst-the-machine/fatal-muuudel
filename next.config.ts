import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // AWS S3 (qualquer bucket/região)
      { protocol: "https", hostname: "**.amazonaws.com" },
      // CloudFront ou URL customizada — defina AWS_S3_PUBLIC_URL com seu domínio
      // e adicione aqui: { protocol: "https", hostname: "cdn.seudominio.com" }
      // Picsum (placeholder das vacas no seed)
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
};

export default nextConfig;
