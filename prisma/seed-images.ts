import "dotenv/config";
import fs from "fs";
import path from "path";
import { S3Client, PutObjectCommand, CreateBucketCommand } from "@aws-sdk/client-s3";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const s3 = new S3Client({
  region: process.env.S3_REGION ?? "us-east-1",
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: !!process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "test",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "test",
  },
});

const BUCKET = process.env.S3_BUCKET_NAME ?? "fatal-muuudel";
const IMAGES_DIR = path.join(import.meta.dirname, "images");

function buildPublicUrl(key: string): string {
  const endpoint = process.env.S3_ENDPOINT;
  const region = process.env.S3_REGION ?? "us-east-1";
  if (endpoint) return `${endpoint}/${BUCKET}/${key}`;
  return `https://${BUCKET}.s3.${region}.amazonaws.com/${key}`;
}

async function ensureBucket() {
  try {
    await s3.send(new CreateBucketCommand({ Bucket: BUCKET }));
    console.log(`Bucket '${BUCKET}' criado.`);
  } catch (err: unknown) {
    const code = (err as { Code?: string; name?: string }).Code ?? (err as { name?: string }).name;
    if (code !== "BucketAlreadyOwnedByYou" && code !== "BucketAlreadyExists") throw err;
  }
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`Pasta ${IMAGES_DIR} não encontrada.`);
    process.exit(1);
  }

  const files = fs.readdirSync(IMAGES_DIR).filter((f) => !f.startsWith("."));
  if (files.length === 0) {
    console.log("Nenhuma imagem encontrada em prisma/images/ — coloque arquivos como mimosa.jpg");
    return;
  }

  await ensureBucket();

  let count = 0;
  for (const file of files) {
    const cowId = path.basename(file, path.extname(file));
    const cow = await prisma.cow.findUnique({ where: { id: cowId }, select: { id: true } });
    if (!cow) {
      console.warn(`  ⚠ Vaca '${cowId}' não encontrada no banco — pulando ${file}`);
      continue;
    }

    const filePath = path.join(IMAGES_DIR, file);
    const body = fs.readFileSync(filePath);
    const ext = path.extname(file).slice(1);
    const mime = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : `image/${ext}`;
    const key = `cows/${cowId}/original.${ext}`;

    await s3.send(
      new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: mime })
    );

    const photoUrl = buildPublicUrl(key);
    await prisma.cow.update({ where: { id: cowId }, data: { photoUrl } });
    console.log(`  ✓ ${cowId} → ${photoUrl}`);
    count++;
  }

  console.log(`\nSeed de imagens concluído: ${count} vaca(s) atualizada(s). 🛸🐄`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
