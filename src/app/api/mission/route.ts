import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ABDUCTION_STYLES = ["stealth", "científico", "flashy", "casual"] as const;
const OBJETIVOS = ["pesquisa", "troféu", "companhia", "experimento"] as const;
const TEMPERAMENTOS = ["paciente", "agitado", "curioso", "dominante"] as const;
const SIGNOS = [
  "Touro Nebular", "Leite de Andrômeda", "Escorpião Cósmico", "Buraco Negro do Boi",
  "Cometa Lanoso", "Pulsar Bovino", "Galáxia Mugidora", "Supernova do Pasto",
  "Quasar Ruminante", "Buraco de Minhoca", "Matéria Escura da Vaca", "Luz do Capim",
] as const;

const missionSchema = z.object({
  name: z.string().min(1).max(60),
  abductionStyle: z.enum(ABDUCTION_STYLES).nullable().optional(),
  objetivoDaMissao: z.enum(OBJETIVOS).nullable().optional(),
  temperamento: z.enum(TEMPERAMENTOS).nullable().optional(),
  signoGalactico: z.enum(SIGNOS).nullable().optional(),
  mooPreference: z.number().int().min(0).max(10).optional(),
  maxCargoKg: z.number().int().min(1).optional(),
  activate: z.boolean().optional(),
});

const updateSchema = missionSchema.partial().extend({ name: z.string().min(1).max(60).optional() });

const MISSION_SELECT = {
  id: true, name: true, isActive: true,
  abductionStyle: true, objetivoDaMissao: true,
  temperamento: true, signoGalactico: true,
  mooPreference: true, maxCargoKg: true,
  createdAt: true,
} as const;

async function activateMission(alienId: string, missionId: string) {
  return prisma.$transaction([
    prisma.missionConfig.updateMany({
      where: { alienId, isActive: true },
      data: { isActive: false },
    }),
    prisma.missionConfig.update({
      where: { id: missionId, alienId },
      data: { isActive: true },
      select: MISSION_SELECT,
    }),
  ]);
}

// GET — lista todas as missões do ET autenticado
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const missions = await prisma.missionConfig.findMany({
    where: { alienId: session.user.id },
    select: MISSION_SELECT,
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ missions });
}

// POST — cria nova missão; se `activate: true` ou for a primeira, ativa automaticamente
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = missionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const { activate, ...data } = parsed.data;

  const existing = await prisma.missionConfig.count({ where: { alienId: session.user.id } });
  const shouldActivate = activate || existing === 0;

  if (shouldActivate) {
    await prisma.missionConfig.updateMany({
      where: { alienId: session.user.id, isActive: true },
      data: { isActive: false },
    });
  }

  const mission = await prisma.missionConfig.create({
    data: { ...data, alienId: session.user.id, isActive: shouldActivate },
    select: MISSION_SELECT,
  });

  return NextResponse.json({ ok: true, mission }, { status: 201 });
}

// PATCH — atualiza campos de uma missão (?id=) e/ou a ativa (?id=&activate=true)
export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const { activate, ...data } = parsed.data;

  if (activate) {
    const [, mission] = await activateMission(session.user.id, id);
    if (Object.keys(data).length > 0) {
      const updated = await prisma.missionConfig.update({
        where: { id, alienId: session.user.id },
        data,
        select: MISSION_SELECT,
      });
      return NextResponse.json({ ok: true, mission: updated });
    }
    return NextResponse.json({ ok: true, mission });
  }

  const mission = await prisma.missionConfig.update({
    where: { id, alienId: session.user.id },
    data,
    select: MISSION_SELECT,
  });

  return NextResponse.json({ ok: true, mission });
}

// DELETE — remove uma missão (?id=); se era a ativa, ativa a mais recente restante
export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });

  const target = await prisma.missionConfig.findUnique({
    where: { id, alienId: session.user.id },
    select: { isActive: true },
  });
  if (!target) return NextResponse.json({ error: "Missão não encontrada" }, { status: 404 });

  await prisma.missionConfig.delete({ where: { id } });

  if (target.isActive) {
    const next = await prisma.missionConfig.findFirst({
      where: { alienId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });
    if (next) {
      await prisma.missionConfig.update({
        where: { id: next.id },
        data: { isActive: true },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
