import "dotenv/config";
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
    photoUrl: "https://picsum.photos/seed/mimosa/400/500",
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
    photoUrl: "https://picsum.photos/seed/geraldina/400/500",
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
    photoUrl: "https://picsum.photos/seed/estrela/400/500",
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
    photoUrl: "https://picsum.photos/seed/margarida/400/500",
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
    photoUrl: "https://picsum.photos/seed/bartira/400/500",
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
    photoUrl: "https://picsum.photos/seed/penelope/400/500",
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
    photoUrl: "https://picsum.photos/seed/zelia/400/500",
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
    photoUrl: "https://picsum.photos/seed/carminha/400/500",
  },
];

async function main() {
  for (const cow of cows) {
    await prisma.cow.upsert({
      where: { id: cow.id },
      update: cow,
      create: cow,
    });
  }
  console.log(`Seeded ${cows.length} cows. 🛸🐄`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
