import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const INITIAL_RANGE = 50;

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const range = Math.min(Math.max(1, Number(searchParams.get("range") ?? INITIAL_RANGE)), 100);
  const expanded = range > INITIAL_RANGE;

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

  const hasRejected = passedIds.length > 0;

  const excludeIds = expanded ? abductedIds : [...abductedIds, ...passedIds];

  const cows = await prisma.cow.findMany({
    where: { id: { notIn: excludeIds } },
    orderBy: { createdAt: "asc" },
  });

  return Response.json({ cows, hasRejected });
}
