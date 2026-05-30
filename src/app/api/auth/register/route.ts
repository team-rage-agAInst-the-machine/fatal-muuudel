import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  callsign: z.string().min(2).max(20),
  homePlanet: z.string().min(2),
  shipModel: z.string().min(2),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos, capitão" }, { status: 400 });
  }

  const { name, email, password, callsign, homePlanet, shipModel } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { callsign }] },
    select: { email: true, callsign: true },
  });

  if (existing?.email === email) {
    return NextResponse.json({ error: "EMAIL_TAKEN" }, { status: 409 });
  }
  if (existing?.callsign === callsign) {
    return NextResponse.json({ error: "CALLSIGN_TAKEN" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { name, email, password: hashed, callsign, homePlanet, shipModel },
    select: { id: true, email: true, callsign: true },
  });

  return NextResponse.json(user, { status: 201 });
}
