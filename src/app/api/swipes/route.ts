import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SwipeDirection } from "@/generated/prisma/client";
import { z } from "zod";

const DIR_MAP: Record<string, SwipeDirection> = {
  like: SwipeDirection.LIKE,
  nope: SwipeDirection.PASS,
  super: SwipeDirection.SUPER,
};

const swipeSchema = z.object({
  cowId: z.string().min(1),
  direction: z.enum(["like", "nope", "super"]),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = swipeSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Invalid payload" }, { status: 400 });
  const { cowId, direction } = parsed.data;

  const cow = await prisma.cow.findUnique({ where: { id: cowId } });
  if (!cow) return Response.json({ error: "Vaca não encontrada" }, { status: 404 });

  const prismaDirection = DIR_MAP[direction];

  await prisma.swipe.upsert({
    where: { alienId_cowId: { alienId: session.user.id, cowId } },
    create: { alienId: session.user.id, cowId, direction: prismaDirection },
    update: { direction: prismaDirection },
  });

  if (prismaDirection === SwipeDirection.LIKE || prismaDirection === SwipeDirection.SUPER) {
    await prisma.abduction.upsert({
      where: { alienId_cowId: { alienId: session.user.id, cowId } },
      create: { alienId: session.user.id, cowId, status: "PLANNED" },
      update: {},
    });
  }

  return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const cowId = searchParams.get("cowId");
  if (!cowId) {
    return Response.json({ error: "cowId obrigatório" }, { status: 400 });
  }

  await prisma.abduction.deleteMany({
    where: { alienId: session.user.id, cowId },
  });
  await prisma.swipe.deleteMany({
    where: { alienId: session.user.id, cowId },
  });

  return Response.json({ ok: true });
}
