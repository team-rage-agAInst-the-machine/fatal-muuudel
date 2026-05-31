import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenAI } from "@google/genai";
import { auth } from "@/auth";

const FARMER_EMAIL = "erick.szns@gmail.com";

// Slugifica o nome da vaca para usar como id
function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export async function POST() {
  const session = await auth();
  if (session?.user?.email !== FARMER_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GOOGLE_AI_API_KEY não configurada" }, { status: 500 });
  }

  // Gera o perfil textual da vaca
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

  const prompt = `Você é o banco de dados de uma plataforma de Tinder para ETs escolherem vacas para abduzir chamada "Fatal Muuudel". Gere o perfil completo de UMA vaca para ser cadastrada no sistema.

O tom é completamente absurdo, sci-fi trash, engraçado e brasileiro. As vacas têm personalidade forte e sabem que vivem num universo onde ETs as abduzem regularmente.

Responda SOMENTE com um JSON válido, sem markdown, sem blocos de código, seguindo EXATAMENTE esta estrutura:
{
  "name": "Nome brasileiro criativo da vaca",
  "breed": "Raça real ou inventada criativamente",
  "age": número inteiro entre 2 e 12,
  "farm": "Nome de fazenda brasileira inventada",
  "weightKg": número inteiro entre 300 e 800,
  "milkPct": número inteiro entre 0 e 100,
  "mooLevel": número inteiro entre 0 e 10,
  "distance": "distância lúdica tipo '2,3 anos-luz' ou '1 salto hiperespacial' ou '418 km de pasto'",
  "hue": número inteiro entre 0 e 360 representando a cor oklch da vaca,
  "tags": ["tag1", "tag2", "tag3"] com 3 tags engraçadas e temáticas,
  "bio": "Bio em primeira pessoa, de 1 a 2 frases, com emoji, no estilo trash sci-fi brasileiro"
}`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text().trim();

  let cowData: Record<string, unknown>;
  try {
    cowData = JSON.parse(raw);
  } catch {
    // Tenta extrair JSON se vier com lixo ao redor
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
      return NextResponse.json({ error: "IA retornou formato inválido, tenta de novo 🛸" }, { status: 500 });
    }
    cowData = JSON.parse(match[0]);
  }

  // Gera slug a partir do nome
  const name = String(cowData.name ?? "vaca");
  const id = `${slugify(name)}-${Math.floor(Math.random() * 900) + 100}`;

  // Tenta gerar imagem com Imagen
  let photoUrl: string | null = null;
  try {
    const genAINew = new GoogleGenAI({ apiKey });
    const imageResult = await genAINew.models.generateImages({
      model: "imagen-3.0-generate-002",
      prompt: `Fotografia realista e vibrante de uma vaca chamada ${name}, raça ${cowData.breed ?? "brasileira"}, em um pasto iluminado por luz de outro mundo com elementos de ficção científica sutis ao fundo — disco voador distante, céu levemente roxo, atmosfera alienígena. Estilo editorial de fazenda, cores saturadas, sem texto.`,
      config: { numberOfImages: 1, aspectRatio: "3:4" },
    });

    const b64 = imageResult.generatedImages?.[0]?.image?.imageBytes;
    if (b64) {
      // Converte base64 para data URL para o preview — o fazendeiro faz upload manual se quiser persistir no S3
      photoUrl = `data:image/png;base64,${b64}`;
    }
  } catch {
    // Imagen pode não estar disponível — segue sem foto
  }

  return NextResponse.json({
    cow: {
      ...cowData,
      id,
      tags: Array.isArray(cowData.tags) ? cowData.tags : [],
      photoUrl,
    },
  });
}
