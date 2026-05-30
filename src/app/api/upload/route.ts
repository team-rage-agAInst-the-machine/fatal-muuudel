import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

const MAX_SIZE = 5 * 1024 * 1024;
const EXT_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function getS3Client() {
  const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION } = process.env;
  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_REGION) return null;
  return new S3Client({
    region: AWS_REGION,
    credentials: { accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY },
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rejeita antes de ler o body quando o Content-Length declarado já passa do limite
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength) > MAX_SIZE + 1024) {
    return NextResponse.json(
      { error: "Arquivo maior que 5MB. Comprime aí, capitão." },
      { status: 413 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 });
  }
  if (!EXT_MAP[file.type]) {
    return NextResponse.json(
      { error: "Tipo inválido. Envia JPG, PNG ou WebP." },
      { status: 400 }
    );
  }

  const ext = EXT_MAP[file.type];
  const filename = `${randomUUID()}.${ext}`;
  const bytes = await file.arrayBuffer();
  const body = Buffer.from(bytes);

  // Verifica o tamanho real após leitura — file.size é declarado pelo cliente
  if (body.length > MAX_SIZE) {
    return NextResponse.json(
      { error: "Arquivo maior que 5MB. Comprime aí, capitão." },
      { status: 413 }
    );
  }

  const s3 = getS3Client();

  if (s3 && process.env.AWS_S3_BUCKET) {
    const key = `uploads/${filename}`;
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Body: body,
        ContentType: file.type,
      })
    );

    const base = process.env.AWS_S3_PUBLIC_URL
      ? process.env.AWS_S3_PUBLIC_URL.replace(/\/$/, "")
      : `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com`;

    return NextResponse.json({ url: `${base}/${key}` });
  }

  // fallback: local storage — apenas em desenvolvimento
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Storage não configurado. Defina as variáveis AWS_* no ambiente." },
      { status: 500 }
    );
  }
  const uploadDir = join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(join(uploadDir, filename), body);
  return NextResponse.json({ url: `/uploads/${filename}` });
}
