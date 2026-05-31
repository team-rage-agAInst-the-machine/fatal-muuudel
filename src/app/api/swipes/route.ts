import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SwipeDirection } from "@/generated/prisma/client";
import { requiresTowel, hasTowel } from "@/lib/protection";

const DIR_MAP: Record<string, SwipeDirection> = {
  like: SwipeDirection.LIKE,
  nope: SwipeDirection.PASS,
  super: SwipeDirection.SUPER,
};

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { cowId, direction } = body as { cowId: string; direction: string };

  if (!cowId || !direction || !DIR_MAP[direction]) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  const prismaDirection = DIR_MAP[direction];

  if (prismaDirection === SwipeDirection.LIKE || prismaDirection === SwipeDirection.SUPER) {
    const [cow, user] = await Promise.all([
      prisma.cow.findUnique({ where: { id: cowId }, select: { protectionLevel: true, desprevenida: true } }),
      prisma.user.findUnique({ where: { id: session.user.id }, select: { towelStatus: true } }),
    ]);

    if (cow && requiresTowel(cow.protectionLevel, cow.desprevenida) && !hasTowel(user?.towelStatus)) {
      return Response.json({ error: "NO_TOWEL" }, { status: 403 });
    }
  }

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
