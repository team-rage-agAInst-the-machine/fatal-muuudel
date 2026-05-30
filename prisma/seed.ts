import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const cows = [
  {
    name: "Mimosa",
    breed: "Holandesa",
    age: 4,
    weightKg: 620,
    farm: "Fazenda Aurora",
    vibe: "filósofa",
    bio: "Passa o dia ruminando teorias sobre o multiverso.",
    photoUrl: "https://placecow.dev/640/480",
  },
  {
    name: "Malhada",
    breed: "Jersey",
    age: 3,
    weightKg: 480,
    farm: "Sítio Vale Verde",
    vibe: "rebelde",
    bio: "Já fugiu do curral três vezes nesta semana.",
    photoUrl: "https://placecow.dev/641/480",
  },
  {
    name: "Estrela",
    breed: "Nelore",
    age: 5,
    weightKg: 700,
    farm: "Rancho Cruzeiro do Sul",
    vibe: "chill",
    bio: "Olha as estrelas todas as noites. Pronta para subir.",
    photoUrl: "https://placecow.dev/640/481",
  },
  {
    name: "Mu-9000",
    breed: "Girolando",
    age: 2,
    weightKg: 540,
    farm: "Cooperativa Lácteos do Futuro",
    vibe: "tecnológica",
    bio: "Vaca conectada com brinco IoT. Sinal forte para abdução.",
    photoUrl: "https://placecow.dev/642/480",
  },
];

async function main() {
  for (const cow of cows) {
    const id = cow.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
    await prisma.cow.upsert({
      where: { id },
      update: cow,
      create: { id, ...cow },
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
