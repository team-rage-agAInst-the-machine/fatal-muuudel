import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ abductions: [] });
  }

  const swipes = await prisma.swipe.findMany({
    where: {
      alienId: session.user.id,
      direction: { in: ["LIKE", "SUPER"] },
    },
    include: { cow: true },
    orderBy: { createdAt: "desc" },
  });

  const abductions = swipes.map((s) => ({
    cow: s.cow,
    vip: s.direction === "SUPER",
  }));

  return Response.json({ abductions });
}
