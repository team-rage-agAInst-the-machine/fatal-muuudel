import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

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

  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  const key = `uploads/${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  if (process.env.AWS_S3_BUCKET) {
    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");

    const s3 = new S3Client({ region: process.env.AWS_REGION ?? "us-east-1" });

    await s3.send(new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    }));

    const url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION ?? "us-east-1"}.amazonaws.com/${key}`;
    await prisma.user.update({ where: { id: session.user.id }, data: { image: url } });
    return NextResponse.json({ url });
  }

  // Fallback local para desenvolvimento
  const { writeFile } = await import("fs/promises");
  const path = await import("path");
  const filename = key.replace("uploads/", "");
  await writeFile(path.join(process.cwd(), "public", "uploads", filename), buffer);
  const localUrl = `/uploads/${filename}`;
  await prisma.user.update({ where: { id: session.user.id }, data: { image: localUrl } });
  return NextResponse.json({ url: localUrl });
}
