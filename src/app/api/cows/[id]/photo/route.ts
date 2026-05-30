import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { s3, S3_BUCKET, buildPublicUrl } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";

const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Não autorizado, capitão" }, { status: 401 });
  }

  const { id: cowId } = await params;

  const cow = await prisma.cow.findUnique({ where: { id: cowId }, select: { id: true } });
  if (!cow) {
    return Response.json({ error: "Vaca não encontrada" }, { status: 404 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Formato inválido" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "Campo 'file' ausente" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return Response.json({ error: "Só imagens são aceitas" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return Response.json({ error: "Arquivo maior que 5 MB" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const key = `cows/${cowId}/${crypto.randomUUID()}.${ext}`;
  const bytes = await file.arrayBuffer();

  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: Buffer.from(bytes),
      ContentType: file.type,
    })
  );

  const photoUrl = buildPublicUrl(key);

  await prisma.cow.update({ where: { id: cowId }, data: { photoUrl } });

  return Response.json({ photoUrl }, { status: 200 });
}
