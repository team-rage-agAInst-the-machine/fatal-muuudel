import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  callsign: z.string().min(2).max(20),
  homePlanet: z.string().min(2),
  shipModel: z.string().min(2),
  // perfil biológico — todos opcionais
  image: z.string().optional(),
  species: z.string().optional(),
  locomotion: z.string().optional(),
  skinColor: z.string().optional(),
  eyeCount: z.number().int().min(0).optional(),
  iq: z.number().int().min(1).max(9999).optional(),
  towelStatus: z.string().optional(),
  forceSensitive: z.boolean().optional(),
  starfleetRank: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos, capitão" }, { status: 400 });
  }

  const { name, email, password, ...rest } = parsed.data;
  const hashed = await bcrypt.hash(password, 12);

  try {
    const user = await prisma.user.create({
      data: { name, email, password: hashed, ...rest },
      select: { id: true, email: true, callsign: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      const targets = e.meta?.target as string[] | undefined;
      const field = targets?.includes("email") ? "EMAIL_TAKEN" : "CALLSIGN_TAKEN";
      return NextResponse.json({ error: field }, { status: 409 });
    }
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
