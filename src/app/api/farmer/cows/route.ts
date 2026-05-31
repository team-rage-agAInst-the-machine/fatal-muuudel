import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const FARMER_EMAIL = "erick.szns@gmail.com";

const cowSchema = z.object({
  id: z.string().min(1).max(60).regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífens"),
  name: z.string().min(1).max(100),
  breed: z.string().min(1).max(100),
  age: z.coerce.number().int().min(0).max(30),
  farm: z.string().min(1).max(100),
  weightKg: z.coerce.number().int().min(1),
  milkPct: z.coerce.number().int().min(0).max(100),
  mooLevel: z.coerce.number().int().min(0).max(10),
  distance: z.string().min(1),
  hue: z.coerce.number().int().min(0).max(360),
  tags: z.array(z.string()).default([]),
  bio: z.string().min(1).max(500),
  photoUrl: z.string().url().optional().nullable(),
  isHuman: z.boolean().default(false),
});

export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.email !== FARMER_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = cowSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 }
    );
  }

  try {
    const cow = await prisma.cow.create({ data: parsed.data });
    return NextResponse.json({ ok: true, cow });
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "ID já em uso, escolha outro slug" },
        { status: 409 }
      );
    }
    throw err;
  }
}
