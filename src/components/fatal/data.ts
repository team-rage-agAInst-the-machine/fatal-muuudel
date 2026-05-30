// Dados estáticos do Fatal Muuudel — base de vacas e copy (tom escrachado).
// Manter sincronizado com prisma/seed.ts.

export type Cow = {
  id: string;
  nome: string;
  idade: number;
  raca: string;
  fazenda: string;
  peso: number;
  leite: number;
  mugido: number;
  distancia: string;
  hue: number;
  tags: string[];
  bio: string;
  photoUrl?: string;
};

export type Copy = {
  nome: string;
  slogan: string;
  enter: string;
  swipeTitle: string;
  nope: string;
  like: string;
  superNope: string;
  superLike: string;
  matchTitle: string;
  matchSub: string;
  matchCta: string;
  emptyTitle: string;
  emptySub: string;
  listTitle: string;
  listEmpty: string;
  again: string;
};

export const FM_COWS: Cow[] = [
  {
    id: "mimosa",
    nome: "Mimosa",
    idade: 4,
    raca: "Girolando",
    fazenda: "Fazenda Boa Vista",
    peso: 512,
    leite: 94,
    mugido: 8,
    distancia: "2,3 anos-luz",
    hue: 188,
    tags: ["Capim premium", "Rumina à noite", "Já viu OVNI antes"],
    bio: "Topo abdução de primeira, mas só se rolar sal mineral no after. 🐄✨",
  },
  {
    id: "geraldina",
    nome: "Geraldina",
    idade: 6,
    raca: "Holandesa",
    fazenda: "Sítio Recanto Verde",
    peso: 638,
    leite: 99,
    mugido: 5,
    distancia: "418 km de pasto",
    hue: 168,
    tags: ["Leite premiado", "Anti-carrapato", "Não muge no after"],
    bio: "Sou a fábrica de leite da fazenda. Cabe na nave? Porque eu não passo na portinhola. 😎",
  },
  {
    id: "estrela",
    nome: "Estrela",
    idade: 3,
    raca: "Gir Leiteiro",
    fazenda: "Rancho do Capim Dourado",
    peso: 447,
    leite: 88,
    mugido: 10,
    distancia: "1 salto hiperespacial",
    hue: 200,
    tags: ["Berra alto", "Fã de cerca elétrica", "Vibe pasto orgânico"],
    bio: "Mugido nível show de rock 🤘 Se quiser silêncio na nave, passa pra próxima.",
  },
  {
    id: "margarida",
    nome: "Margarida",
    idade: 5,
    raca: "Jersey",
    fazenda: "Fazenda Santa Mu",
    peso: 389,
    leite: 91,
    mugido: 4,
    distancia: "0,8 ano-luz",
    hue: 152,
    tags: ["Compacta", "Curte sal mineral", "Soneca no pasto"],
    bio: "Pequena, dócil e cabe em qualquer disco voador. Praticamente plug and play. 🛸",
  },
  {
    id: "bartira",
    nome: "Bartira",
    idade: 7,
    raca: "Nelore",
    fazenda: "Sítio Três Cercas",
    peso: 705,
    leite: 42,
    mugido: 7,
    distancia: "5,1 anos-luz",
    hue: 210,
    tags: ["Marrenta", "Pula cerca", "Líder do rebanho"],
    bio: "Já fugi de 3 fazendas, duvido essa navezinha me segurar. Vem com tudo. 💪",
  },
  {
    id: "penelope",
    nome: "Penélope",
    idade: 4,
    raca: "Pardo-Suíço",
    fazenda: "Fazenda Lua Cheia",
    peso: 556,
    leite: 96,
    mugido: 6,
    distancia: "3,7 anos-luz",
    hue: 176,
    tags: ["Romântica", "Olha pra lua", "Leite cremoso"],
    bio: "Vivo olhando pro céu esperando uma nave. Demorou, hein? 🌙👽",
  },
  {
    id: "zelia",
    nome: "Zélia",
    idade: 8,
    raca: "Guzerá",
    fazenda: "Fazenda Boa Vista",
    peso: 612,
    leite: 71,
    mugido: 3,
    distancia: "6,4 anos-luz",
    hue: 164,
    tags: ["Sábia", "Conta histórias", "Anti-stress"],
    bio: "Sou a coroa do pasto, tenho causos de abdução pra te contar a viagem toda. 👵",
  },
  {
    id: "carminha",
    nome: "Carminha",
    idade: 5,
    raca: "Holandesa",
    fazenda: "Sítio Recanto Verde",
    peso: 598,
    leite: 85,
    mugido: 9,
    distancia: "2,9 anos-luz",
    hue: 192,
    tags: ["Dramática", "Diva do curral", "Pose pra foto"],
    bio: "Se for me abduzir, que seja com raio trator de qualidade. Tenho padrão. 💅",
  },
];

export const FM_COPY: Copy = {
  nome: "Fatal Muuudel",
  slogan: "O pasto inteiro na palma do raio trator 🛸🐄",
  enter: "ENTRAR NA NAVE",
  swipeTitle: "Escolhe a vaca, capitão",
  nope: "DEIXA PASTAR",
  like: "ABDUZIR",
  superNope: "ANO-LUZ DE DISTÂNCIA",
  superLike: "ABDUÇÃO VIP",
  matchTitle: "ABDUÇÃO INICIADA",
  matchSub: "Liga o raio trator que essa vaca é nossa! 🐄⚡",
  matchCta: "PRÓXIMA VÍTIMA",
  emptyTitle: "Pasto vazio, parceiro",
  emptySub: "Já abduziu tudo que era bom. Bora pra outra galáxia?",
  listTitle: "MINHAS VACAS ABDUZIDAS",
  listEmpty: "Nenhuma vaca no porão da nave ainda. Vai lá garimpar! 👽",
  again: "ABDUZIR DE NOVO",
};

export function stripedBg(hue: number): React.CSSProperties {
  return {
    backgroundImage: `repeating-linear-gradient(135deg, oklch(0.26 0.07 ${hue}) 0 11px, oklch(0.22 0.06 ${hue}) 11px 22px)`,
  };
}
