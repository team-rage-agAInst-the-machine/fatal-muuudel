import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const rows = await prisma.abduction.findMany({
    where: { alienId: session.user.id },
    include: { cow: true },
    orderBy: { createdAt: "desc" },
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

  return Response.json({ abductions });
}
