import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ABDUCTION_STYLES = ["stealth", "científico", "flashy", "casual"] as const;
const OBJETIVOS = ["pesquisa", "troféu", "companhia", "experimento"] as const;
const TEMPERAMENTOS_ET = ["paciente", "agitado", "curioso", "dominante"] as const;
const SIGNOS = [
  "Touro Nebular", "Leite de Andrômeda", "Escorpião Cósmico", "Buraco Negro do Boi",
  "Cometa Lanoso", "Pulsar Bovino", "Galáxia Mugidora", "Supernova do Pasto",
  "Quasar Ruminante", "Buraco de Minhoca", "Matéria Escura da Vaca", "Luz do Capim",
] as const;
const TOWEL_STATUSES = ["mochila", "capsula", "cintura", "perdida"] as const;

const updateSchema = z.object({
  name: z.string().min(2).max(60).optional(),
  callsign: z.string().min(2).max(30).optional(),
  homePlanet: z.string().min(2).max(50).optional(),
  shipModel: z.string().min(2).max(50).optional(),
  towelStatus: z.enum(TOWEL_STATUSES).nullable().optional(),
  mooPreference: z.number().int().min(0).max(10).optional(),
  maxCargoKg: z.number().int().min(1).optional(),
  abductionStyle: z.enum(ABDUCTION_STYLES).nullable().optional(),
  temperamento: z.enum(TEMPERAMENTOS_ET).nullable().optional(),
  signoGalactico: z.enum(SIGNOS).nullable().optional(),
  objetivoDaMissao: z.enum(OBJETIVOS).nullable().optional(),
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

  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: "Nenhum campo para atualizar" }, { status: 400 });
  }


  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: parsed.data,
    select: {
      id: true, name: true, image: true, callsign: true, homePlanet: true, shipModel: true,
      towelStatus: true, mooPreference: true, maxCargoKg: true,
      abductionStyle: true, temperamento: true, signoGalactico: true, objetivoDaMissao: true,
    },
  });

  return NextResponse.json({ ok: true, user });
}
