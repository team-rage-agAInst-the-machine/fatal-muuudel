import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SwipeDirection } from "@/generated/prisma/client";

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
