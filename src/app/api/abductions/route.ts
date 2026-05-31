import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const skip = (page - 1) * PAGE_SIZE;

  const rows = await prisma.abduction.findMany({
    where: { alienId: session.user.id },
    include: { cow: { select: { id: true, name: true, photoUrl: true, breed: true, bio: true, mooLevel: true, tags: true, hue: true, distance: true, age: true, isHuman: true } } },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE,
    skip,
  });

  const cowIds = rows.map((r) => r.cowId);
  const swipes = await prisma.swipe.findMany({
    where: { alienId: session.user.id, cowId: { in: cowIds } },
    select: { cowId: true, direction: true },
  });
  const swipeDir = new Map(swipes.map((s) => [s.cowId, s.direction]));

  const abductions = rows.map((r) => ({
    cow: r.cow,
    vip: swipeDir.get(r.cowId) === "SUPER",
  }));

  return Response.json({ abductions, page, pageSize: PAGE_SIZE });
}
