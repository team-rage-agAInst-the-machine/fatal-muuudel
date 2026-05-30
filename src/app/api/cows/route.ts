import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  let cows;
  if (session?.user?.id) {
    const swiped = await prisma.swipe.findMany({
      where: { alienId: session.user.id },
      select: { cowId: true },
    });
    const swipedIds = swiped.map((s) => s.cowId);
    cows = await prisma.cow.findMany({
      where: { id: { notIn: swipedIds } },
      orderBy: { createdAt: "asc" },
    });
  } else {
    cows = await prisma.cow.findMany({ orderBy: { createdAt: "asc" } });
  }

  return Response.json({ cows });
}
