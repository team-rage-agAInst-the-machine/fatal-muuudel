import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { computeCompatibility } from "@/lib/matchmaking";

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

  const [allSwipes, activeMission] = await Promise.all([
    prisma.swipe.findMany({
      where: { alienId: session.user.id },
      select: { cowId: true, direction: true },
    }),
    prisma.missionConfig.findFirst({
      where: { alienId: session.user.id, isActive: true },
      select: {
        mooPreference: true,
        maxCargoKg: true,
        abductionStyle: true,
        temperamento: true,
        signoGalactico: true,
        objetivoDaMissao: true,
      },
    }),
  ]);

  const abductedIds = allSwipes
    .filter((s) => s.direction === "LIKE" || s.direction === "SUPER")
    .map((s) => s.cowId);

  const passedIds = allSwipes
    .filter((s) => s.direction === "PASS")
    .map((s) => s.cowId);

  const hasRejected = passedIds.length > 0;

  const excludeIds = expanded ? abductedIds : [...abductedIds, ...passedIds];

  const rawCows = await prisma.cow.findMany({
    where: { id: { notIn: excludeIds } },
    orderBy: { createdAt: "asc" },
  });

  const et = activeMission ?? {};
  const cows = rawCows
    .map((cow) => ({
      ...cow,
      matchScore: computeCompatibility(et, cow),
    }))
    .sort((a, b) => b.matchScore - a.matchScore);

  return Response.json({ cows, hasRejected });
}
