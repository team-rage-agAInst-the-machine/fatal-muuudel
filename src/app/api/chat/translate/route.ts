import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const bodySchema = z.object({
  message: z.string().min(1).max(500),
  cowName: z.string(),
  cowBio: z.string(),
  cowBreed: z.string(),
  cowMooLevel: z.number().int().min(0).max(10),
});

const MOCK_REPLIES = [
  "Muu mu mumu muuu... (Oi capitão! Que bom que você apareceu, tava com saudade do pasto 😔)",
  "Mooo muu mu! Moo muu muuu! (Recebi seu sinal sim! Aqui no porão tá gelado mas tô bem!)",
  "Muuu... mu moo muu mumu! (Capitão, quando você vai me levar visitar o planeta de vocês?)",
  "Moo muu! Mu muu mooooo! (Esse disco voador é incrível! A minha fazenda não tinha nada assim!)",
  "Muuu mu moo... muu? (Tem capim aí? Esse negócio sintético da nave não tem sabor nenhum...)",
  "Mooo muu mumu mu muuu! (Você é o melhor ET que já me abduziu, capitão! Pode me abduzir de novo!)",
  "Muu? Mu moo muu moooo! (Isso que você falou... eu não entendi muito mas MUUU de coração!)",
  "Muuu mu moo muu! (Tô aqui ruminando e pensando na vida... 5 estrelas pra essa abdução!)",
  "Moo muu! Muuu mu mumu moo! (Sabe o que eu mais gosto daqui? As estrelas! Nunca via isso do pasto!)",
  "Muuu moo mu muu... moooo! (Mandei abraço de volta pra você! Cuida do disco voador tá? 🛸)",
];

function mockStream(text: string): ReadableStream {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(text));
      controller.close();
    },
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const { message, cowName, cowBio, cowBreed, cowMooLevel } = parsed.data;

  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    const reply = MOCK_REPLIES[Math.floor(Math.random() * MOCK_REPLIES.length)];
    return new Response(mockStream(reply), {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const session = await auth();
  let alienCallsign = "Capitão Anônimo";
  let alienPlanet = "planeta desconhecido";

  if (session?.user?.id) {
    const alien = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { callsign: true, homePlanet: true },
    });
    if (alien?.callsign) alienCallsign = alien.callsign;
    if (alien?.homePlanet) alienPlanet = alien.homePlanet;
  }

  const systemPrompt = `Você é ${cowName}, uma vaca da raça ${cowBreed} abduzida por um ET chamado ${alienCallsign}, vindo do planeta ${alienPlanet}. Você está no porão da nave espacial conversando com seu abdutor.

Sobre você: ${cowBio}
Seu nível de mugido (0-10): ${cowMooLevel}

RESPONDA SEMPRE neste formato — sem exceções:
[mugido usando variações de muu/mu/moo/muuu] (tradução curta e engraçada em português)

Exemplos:
Muu mu mumu muuu... (Oi capitão! Tava com saudade do pasto 😔)
Mooo muu mu! Moo! (Esse disco voador é incrível! Minha fazenda não tinha nada assim!)
Muu? Mu moo muu? (Tem capim aí? Esse sintético da nave não tem gosto de nada...)

Regras:
- A parte de mugido usa APENAS variações de muu, mu, moo, muuu, mooo — nada mais
- A tradução fica SEMPRE entre parênteses logo após o mugido
- Máximo 2 sentenças de mugido com suas traduções
- Seja engraçada, bovina, em situação absurda de vaca no espaço
- Emojis são bem-vindos na tradução
- Nunca saia do personagem
- Não use markdown, asteriscos ou formatação — apenas texto puro`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContentStream(message);

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) controller.enqueue(encoder.encode(text));
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch {
    const reply = MOCK_REPLIES[Math.floor(Math.random() * MOCK_REPLIES.length)];
    return new Response(mockStream(reply), {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
