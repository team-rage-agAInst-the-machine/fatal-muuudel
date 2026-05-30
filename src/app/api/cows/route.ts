import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const INITIAL_RANGE = 50;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const range = Number(searchParams.get("range") ?? INITIAL_RANGE);
  const expanded = range > INITIAL_RANGE;

  const session = await auth();

  let cows;
  let hasRejected = false;

  if (session?.user?.id) {
    const allSwipes = await prisma.swipe.findMany({
      where: { alienId: session.user.id },
      select: { cowId: true, direction: true },
    });

    const abductedIds = allSwipes
      .filter((s) => s.direction === "LIKE" || s.direction === "SUPER")
      .map((s) => s.cowId);

    const passedIds = allSwipes
      .filter((s) => s.direction === "PASS")
      .map((s) => s.cowId);

    hasRejected = passedIds.length > 0;

    const excludeIds = expanded ? abductedIds : [...abductedIds, ...passedIds];

    cows = await prisma.cow.findMany({
      where: { id: { notIn: excludeIds } },
      orderBy: { createdAt: "asc" },
    });
  } else {
    cows = await prisma.cow.findMany({ orderBy: { createdAt: "asc" } });
  }

  return Response.json({ cows, hasRejected });
}
