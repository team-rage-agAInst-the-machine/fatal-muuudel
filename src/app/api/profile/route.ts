import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  image: z.string().min(1).optional(),
  callsign: z.string().min(2).max(30).optional(),
  homePlanet: z.string().min(2).max(50).optional(),
  shipModel: z.string().min(2).max(50).optional(),
});

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: parsed.data,
    select: { id: true, image: true, callsign: true, homePlanet: true, shipModel: true },
  });

  return NextResponse.json({ ok: true, user });
}
