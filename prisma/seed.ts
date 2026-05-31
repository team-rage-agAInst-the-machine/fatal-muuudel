import "dotenv/config";
import fs from "fs";
import path from "path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

type CowSeed = {
  id: string;
  name: string;
  age: number;
  breed: string;
  farm: string;
  weightKg: number;
  milkPct: number;
  mooLevel: number;
  distance: string;
  hue: number;
  tags: string[];
  bio: string;
  photoUrl: string;
  isHuman?: boolean;
};

const cows: CowSeed[] = [
  {
    id: "mimosa",
    name: "Mimosa",
    age: 4,
    breed: "Girolando",
    farm: "Fazenda Boa Vista",
    weightKg: 512,
    milkPct: 94,
    mooLevel: 8,
    distance: "2,3 anos-luz",
    hue: 188,
    tags: ["Capim premium", "Rumina à noite", "Já viu OVNI antes"],
    bio: "Topo abdução de primeira, mas só se rolar sal mineral no after. 🐄✨",
    photoUrl: "https://images.pexels.com/photos/29468422/pexels-photo-29468422.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop",
  },
  {
    id: "geraldina",
    name: "Geraldina",
    age: 6,
    breed: "Holandesa",
    farm: "Sítio Recanto Verde",
    weightKg: 638,
    milkPct: 99,
    mooLevel: 5,
    distance: "418 km de pasto",
    hue: 168,
    tags: ["Leite premiado", "Anti-carrapato", "Não muge no after"],
    bio: "Sou a fábrica de leite da fazenda. Cabe na nave? Porque eu não passo na portinhola. 😎",
    photoUrl: "https://images.pexels.com/photos/12381458/pexels-photo-12381458.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop",
  },
  {
    id: "estrela",
    name: "Estrela",
    age: 3,
    breed: "Gir Leiteiro",
    farm: "Rancho do Capim Dourado",
    weightKg: 447,
    milkPct: 88,
    mooLevel: 10,
    distance: "1 salto hiperespacial",
    hue: 200,
    tags: ["Berra alto", "Fã de cerca elétrica", "Vibe pasto orgânico"],
    bio: "Mugido nível show de rock 🤘 Se quiser silêncio na nave, passa pra próxima.",
    photoUrl: "https://images.pexels.com/photos/19855902/pexels-photo-19855902.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop",
  },
  {
    id: "margarida",
    name: "Margarida",
    age: 5,
    breed: "Jersey",
    farm: "Fazenda Santa Mu",
    weightKg: 389,
    milkPct: 91,
    mooLevel: 4,
    distance: "0,8 ano-luz",
    hue: 152,
    tags: ["Compacta", "Curte sal mineral", "Soneca no pasto"],
    bio: "Pequena, dócil e cabe em qualquer disco voador. Praticamente plug and play. 🛸",
    photoUrl: "https://images.pexels.com/photos/31458840/pexels-photo-31458840.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop",
  },
  {
    id: "bartira",
    name: "Bartira",
    age: 7,
    breed: "Nelore",
    farm: "Sítio Três Cercas",
    weightKg: 705,
    milkPct: 42,
    mooLevel: 7,
    distance: "5,1 anos-luz",
    hue: 210,
    tags: ["Marrenta", "Pula cerca", "Líder do rebanho"],
    bio: "Já fugi de 3 fazendas, duvido essa navezinha me segurar. Vem com tudo. 💪",
    photoUrl: "https://images.pexels.com/photos/13910867/pexels-photo-13910867.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop",
  },
  {
    id: "penelope",
    name: "Penélope",
    age: 4,
    breed: "Pardo-Suíço",
    farm: "Fazenda Lua Cheia",
    weightKg: 556,
    milkPct: 96,
    mooLevel: 6,
    distance: "3,7 anos-luz",
    hue: 176,
    tags: ["Romântica", "Olha pra lua", "Leite cremoso"],
    bio: "Vivo olhando pro céu esperando uma nave. Demorou, hein? 🌙👽",
    photoUrl: "https://images.pexels.com/photos/7626240/pexels-photo-7626240.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop",
  },
  {
    id: "zelia",
    name: "Zélia",
    age: 8,
    breed: "Guzerá",
    farm: "Fazenda Boa Vista",
    weightKg: 612,
    milkPct: 71,
    mooLevel: 3,
    distance: "6,4 anos-luz",
    hue: 164,
    tags: ["Sábia", "Conta histórias", "Anti-stress"],
    bio: "Sou a coroa do pasto, tenho causos de abdução pra te contar a viagem toda. 👵",
    photoUrl: "https://images.pexels.com/photos/14748148/pexels-photo-14748148.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop",
  },
  {
    id: "carminha",
    name: "Carminha",
    age: 5,
    breed: "Holandesa",
    farm: "Sítio Recanto Verde",
    weightKg: 598,
    milkPct: 85,
    mooLevel: 9,
    distance: "2,9 anos-luz",
    hue: 192,
    tags: ["Dramática", "Diva do curral", "Pose pra foto"],
    bio: "Se for me abduzir, que seja com raio trator de qualidade. Tenho padrão. 💅",
    photoUrl: "https://images.pexels.com/photos/30121945/pexels-photo-30121945.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop",
  },
  // ✨ Referências culturais & trocadilhos lácteos
  {
    id: "leiticia",
    name: "Leitícia",
    age: 3,
    breed: "Girolando",
    farm: "Fazenda Pé de Serra",
    weightKg: 480,
    milkPct: 97,
    mooLevel: 6,
    distance: "1,2 anos-luz",
    hue: 172,
    tags: ["Leite tipo A", "Vitamina D extra", "Influencer do pasto"],
    bio: "Meu leite é tão premium que o ET pediu o contato do meu nutricionista. Encomenda direto, sem intermediário. 🥛✨",
    photoUrl: "https://images.pexels.com/photos/18843665/pexels-photo-18843665.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop",
  },
  {
    id: "mozzarina",
    name: "Mozzarina",
    age: 4,
    breed: "Búfala Mediterrânea",
    farm: "Sítio Bella Vita",
    weightKg: 510,
    milkPct: 88,
    mooLevel: 5,
    distance: "2,7 anos-luz",
    hue: 45,
    tags: ["Mozzarella de elite", "Origem protegida", "Temperatura controlada"],
    bio: "Italiana por natureza, mozzarella por vocação. Se me abduzir, garanta temperatura controlada na nave. Sou delicada. 🧀🇮🇹",
    photoUrl: "https://images.pexels.com/photos/19603274/pexels-photo-19603274.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop",
  },
  {
    id: "milka",
    name: "Milka",
    age: 5,
    breed: "Pardo-Alpina",
    farm: "Fazenda Montanha Azul",
    weightKg: 545,
    milkPct: 95,
    mooLevel: 7,
    distance: "3,1 anos-luz",
    hue: 270,
    tags: ["Vaca roxa original", "Branding próprio", "Chocolate premium"],
    bio: "Sim, sou roxa. Não é doença — é branding. Me reconhecem de longe. Exatamente como planejei. 💜🍫",
    photoUrl: "https://images.pexels.com/photos/18827660/pexels-photo-18827660.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop",
  },
  {
    id: "clarabelle",
    name: "Clarabelle",
    age: 6,
    breed: "Holandesa",
    farm: "Parque da Fantasia",
    weightKg: 578,
    milkPct: 89,
    mooLevel: 8,
    distance: "1 parque temático daqui",
    hue: 15,
    tags: ["Amiga do Mickey", "Laço vermelho", "Celebridade"],
    bio: "Amiga do Mickey, comadre da Minnie, colega do Pateta. Frequento círculos muito melhores que esse pasto. 🐭✨",
    photoUrl: "https://images.pexels.com/photos/30982514/pexels-photo-30982514.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop",
  },
  {
    id: "bessie",
    name: "Bessie",
    age: 7,
    breed: "Jersey",
    farm: "Old MacDonald Farm",
    weightKg: 412,
    milkPct: 93,
    mooLevel: 3,
    distance: "4,2 anos-luz",
    hue: 202,
    tags: ["Old school", "Sem firulas", "Leite há décadas"],
    bio: "Classic. No nonsense. Produzindo leite desde antes da internet. Se você me abduziu, tem bom gosto, cowboy. 🤠",
    photoUrl: "https://images.pexels.com/photos/8637745/pexels-photo-8637745.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop",
  },
  {
    id: "iracema",
    name: "Iracema",
    age: 4,
    breed: "Gir Leiteiro",
    farm: "Fazenda Ceará",
    weightKg: 435,
    milkPct: 91,
    mooLevel: 6,
    distance: "5,0 anos-luz",
    hue: 155,
    tags: ["Lábios de mel", "Cabelos da graúna", "Literatura nacional"],
    bio: "Virgem dos lábios de mel, os cabelos mais leves que a asa da graúna... e meu leite é tipo A. 📚💛",
    photoUrl: "https://images.pexels.com/photos/36607672/pexels-photo-36607672.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop",
  },
  {
    id: "manteiga-monroe",
    name: "Manteiga Monroe",
    age: 5,
    breed: "Jersey",
    farm: "Hollywood Ranch",
    weightKg: 398,
    milkPct: 96,
    mooLevel: 7,
    distance: "Muito longe, querida",
    hue: 40,
    tags: ["Dourada por natureza", "Irresistível", "Happy Birthday vibes"],
    bio: "Suave, dourada e irresistível como manteiga derretendo. Happy birthday, Mr. Astronaut. 🧈💋",
    photoUrl: "https://images.pexels.com/photos/2887110/pexels-photo-2887110.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop",
  },
  {
    id: "brie-gitte",
    name: "Brie-gitte",
    age: 4,
    breed: "Normanda",
    farm: "Chateau du Pasto",
    weightKg: 520,
    milkPct: 87,
    mooLevel: 4,
    distance: "3,8 anos-luz",
    hue: 160,
    tags: ["Francesa de coração", "Casca branca impecável", "Exige vinho a bordo"],
    bio: "Refinada, francesa de coração, casca branca impecável. Apenas me abduzam com vinho tinto à bordo. 🧀🍷",
    photoUrl: "https://images.pexels.com/photos/2650386/pexels-photo-2650386.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop",
  },
  {
    id: "pasteurela",
    name: "Pasteurela",
    age: 3,
    breed: "Holandesa",
    farm: "Laboratório Agro",
    weightKg: 490,
    milkPct: 99,
    mooLevel: 4,
    distance: "0,3 ano-luz",
    hue: 185,
    tags: ["Pasteurizada", "Homogeneizada", "ISO 9001 bovina"],
    bio: "Pasteurizada, homogeneizada e pronta para consumo. Saúde e higiene são meu estilo de vida, capitão. 🔬🥛",
    photoUrl: "https://images.pexels.com/photos/1567938/pexels-photo-1567938.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop",
  },
  {
    id: "ivete-mugalo",
    name: "Ivete Mugalo",
    age: 5,
    breed: "Nelore Festeira",
    farm: "Fazenda Camarote",
    weightKg: 512,
    milkPct: 78,
    mooLevel: 10,
    distance: "Olha o bloco, olha!",
    hue: 225,
    tags: ["Não para de mugir", "Festival de verão", "Beijo pra quem veio de longe"],
    bio: "MUUUUUU! Não para de mugir! Vou fazer o show mais longo da nave. Beijo pra quem veio de longe! 🎤🎉",
    photoUrl: "https://images.pexels.com/photos/19395924/pexels-photo-19395924.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop",
  },
  // ⚠️ Intrusos — humanos disfarçados de vaca
  {
    id: "joao-da-fazenda",
    name: "João da Fazenda",
    age: 34,
    breed: "Humano (nega muito)",
    farm: "Não sei, uma fazenda aí",
    weightKg: 78,
    milkPct: 0,
    mooLevel: 2,
    distance: "1,8 km (foi de carro)",
    hue: 30,
    tags: ["Usa boné", "Fala português", "Não rumina"],
    bio: "MUU. Sou vaca sim. Não tenho medo de nada. Por favor não me abduz... digo, abduz à vontade! MUUUU.",
    photoUrl: "https://images.pexels.com/photos/10899302/pexels-photo-10899302.jpeg",
    isHuman: true,
  },
  {
    id: "fernanda-pasto",
    name: "Fernanda do Pasto",
    age: 28,
    breed: "Jersey (acredite em mim)",
    farm: "Sítio Suspeito",
    weightKg: 62,
    milkPct: 3,
    mooLevel: 1,
    distance: "Bem pertinho mesmo",
    hue: 45,
    tags: ["Totalmente vaca", "Não é humana", "Tem cascos (são botas)"],
    bio: "Oi moo olá. Adoro comer capim e fazer coisas de vaca. Definitivamente não sou repórter investigando abdução extraterrestre.",
    photoUrl: "https://images.pexels.com/photos/30792475/pexels-photo-30792475.jpeg",
    isHuman: true,
  },
];

const CACHE_FOTOS = path.join(__dirname, "cow-photos.json");
const TAMANHO_REBANHO = 18; // vacas reais (sem os humanos infiltrados)

async function buscarFotosDoRebanho(): Promise<string[]> {
  // Usa cache se já tiver fotos suficientes
  if (fs.existsSync(PHOTOS_CACHE)) {
    const cached: string[] = JSON.parse(fs.readFileSync(PHOTOS_CACHE, "utf-8"));
    if (cached.length >= TAMANHO_REBANHO) {
      console.log(`📸 Usando ${cached.length} fotos em cache (prisma/cow-photos.json).`);
      return cached;
    }
  }

  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return [];

  console.log("🔍 Buscando fotos de vacas na Pexels API...");
  try {
    const queries = ["cow farm", "dairy cow", "cattle field", "cow close up"];
    const urls: string[] = [];

    for (const query of queries) {
      const res = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=3&orientation=portrait`,
        { headers: { Authorization: apiKey } }
      );
      if (!res.ok) continue;
      const data = await res.json() as { photos: { src: { large: string } }[] };
      for (const photo of data.photos) {
        if (photo.src?.large) urls.push(photo.src.large);
      }
    }

    if (urls.length > 0) {
      fs.writeFileSync(PHOTOS_CACHE, JSON.stringify(urls, null, 2));
      console.log(`📸 ${urls.length} fotos salvas em cache (prisma/cow-photos.json).`);
    }

    return urls;
  } catch {
    console.warn("⚠️  Pexels API falhou, usando fotos de fallback.");
    return [];
  }
}

async function main() {
  const fotasDoPasto = await buscarFotosDoRebanho();

  if (fotasDoPasto.length === 0 && !process.env.PEXELS_API_KEY) {
    console.log("ℹ️  PEXELS_API_KEY não configurada — usando fotos de fallback do Pexels.");
  }

  const rebanhoComFotos = cows.map((cow, i) => {
    if (cow.isHuman) return cow;
    const photo = fotasDoPasto[i];
    return photo ? { ...cow, photoUrl: photo } : cow;
  });

  for (const cow of rebanhoComFotos) {
    await prisma.cow.upsert({
      where: { id: cow.id },
      update: cow,
      create: cow,
    });
  }
  console.log(`Seeded ${cowsWithPhotos.length} cows. 🛸🐄`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
