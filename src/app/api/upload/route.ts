import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

function detectImageType(buffer: Buffer): "image/jpeg" | "image/png" | "image/webp" | null {
  if (buffer.length < 12) return null
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg"
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return "image/png"
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) return "image/webp"
  return null
}

const EXT_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Tipo de arquivo não suportado. Use JPG, PNG ou WebP." }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Arquivo muito grande. Máximo 5MB." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const detectedType = detectImageType(buffer)
  if (!detectedType) {
    return NextResponse.json({ error: "Conteúdo do arquivo não reconhecido como imagem válida." }, { status: 400 })
  }

  const ext = EXT_MAP[detectedType]
  const key = `uploads/${randomUUID()}.${ext}`;

  if (process.env.AWS_S3_BUCKET) {
    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");

    const s3 = new S3Client({ region: process.env.AWS_REGION ?? "us-east-1" });

    await s3.send(new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: detectedType,
    }));

    const url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION ?? "us-east-1"}.amazonaws.com/${key}`;
    await prisma.user.update({ where: { id: session.user.id }, data: { image: url } });
    return NextResponse.json({ url });
  }

  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Storage não configurado" }, { status: 503 })
  }

  // Fallback local para desenvolvimento
  const { writeFile } = await import("fs/promises");
  const path = await import("path");
  const filename = path.basename(key.replace("uploads/", ""));
  await writeFile(path.join(process.cwd(), "public", "uploads", filename), buffer);
  const localUrl = `/uploads/${filename}`;
  await prisma.user.update({ where: { id: session.user.id }, data: { image: localUrl } });
  return NextResponse.json({ url: localUrl });
}
