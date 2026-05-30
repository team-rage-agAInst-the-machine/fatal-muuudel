import { S3Client } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  region: process.env.S3_REGION ?? "us-east-1",
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: !!process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "test",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "test",
  },
});

export const S3_BUCKET = process.env.S3_BUCKET_NAME ?? "fatal-muuudel";

export function buildPublicUrl(key: string): string {
  const endpoint = process.env.S3_ENDPOINT;
  const region = process.env.S3_REGION ?? "us-east-1";
  if (endpoint) {
    return `${endpoint}/${S3_BUCKET}/${key}`;
  }
  return `https://${S3_BUCKET}.s3.${region}.amazonaws.com/${key}`;
}
