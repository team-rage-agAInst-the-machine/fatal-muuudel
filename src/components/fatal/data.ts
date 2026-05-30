// Dados estáticos do Fatal Muuudel — copy em 3 tons + base de vacas.
// Idêntico ao design original (data.jsx); manter sincronizado com prisma/seed.ts.

export type Tone = 0 | 1 | 2; // 0 = Escrachado, 1 = Equilibrado, 2 = Imersivo

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
  bios: [string, string, string];
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

export const TONE_LABELS = ["Escrachado", "Equilibrado", "Imersivo"] as const;

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
    bios: [
      "Topo abdução de primeira, mas só se rolar sal mineral no after. 🐄✨",
      "Vaca tranquila, leiteira nota 10. Aceita viagens longas se tiver pasto bom.",
      "Espécime dócil, lactação excepcional. Histórico de avistamentos prévios — sujeito de alto valor científico.",
    ],
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
    bios: [
      "Sou a fábrica de leite da fazenda. Cabe na nave? Porque eu não passo na portinhola. 😎",
      "Recordista de produção leiteira da região. Calma, mas exige conforto.",
      "Produtividade leiteira de 99%. Temperamento estável. Recomenda-se módulo de carga reforçado.",
    ],
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
    bios: [
      "Mugido nível show de rock 🤘 Se quiser silêncio na nave, passa pra próxima.",
      "Jovem, enérgica e barulhenta. Ótima para quem curte agito.",
      "Vocalização de 10/10 decibéis. Recomenda-se isolamento acústico na cápsula.",
    ],
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
    bios: [
      "Pequena, dócil e cabe em qualquer disco voador. Praticamente plug and play. 🛸",
      "Porte compacto, fácil de transportar. Leite cremoso e personalidade serena.",
      "Dimensões ideais para abdução de baixa energia. Eficiência de transporte máxima.",
    ],
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
    bios: [
      "Já fugi de 3 fazendas, duvido essa navezinha me segurar. Vem com tudo. 💪",
      "Independente e forte. Não é fácil, mas vale a abdução.",
      "Espécime de alta resistência. Histórico de evasão — requer feixe de contenção reforçado.",
    ],
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
    bios: [
      "Vivo olhando pro céu esperando uma nave. Demorou, hein? 🌙👽",
      "Sonhadora, observa o céu toda noite. Parece que estava te esperando.",
      "Comportamento de fixação celeste recorrente. Possível pré-disposição ao contato. Prioridade alta.",
    ],
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
    bios: [
      "Sou a coroa do pasto, tenho causos de abdução pra te contar a viagem toda. 👵",
      "Experiente e tranquila. Companhia perfeita pra viagens longas.",
      "Matriarca do rebanho. Valor comportamental elevado para estudos de longa duração.",
    ],
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
    bios: [
      "Se for me abduzir, que seja com raio trator de qualidade. Tenho padrão. 💅",
      "Cheia de personalidade e bem fotogênica. Ama atenção.",
      "Temperamento expressivo. Resposta positiva a estímulos luminosos — ideal para feixe demonstrativo.",
    ],
  },
];

export const FM_COPY: [Copy, Copy, Copy] = [
  {
    // 0 — Escrachado
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
  },
  {
    // 1 — Equilibrado
    nome: "Fatal Muuudel",
    slogan: "Encontre a vaca certa pra sua próxima abdução",
    enter: "EMBARCAR",
    swipeTitle: "Quem você vai abduzir hoje?",
    nope: "PASSAR",
    like: "ABDUZIR",
    superNope: "DISPENSAR",
    superLike: "SUPER ABDUÇÃO",
    matchTitle: "ABDUÇÃO INICIADA",
    matchSub: "Raio trator ativado. Mais uma para o rebanho intergaláctico.",
    matchCta: "VER PRÓXIMA",
    emptyTitle: "Sem mais vacas por aqui",
    emptySub: "Você analisou todo o pasto disponível.",
    listTitle: "VACAS ABDUZIDAS",
    listEmpty: "Você ainda não abduziu nenhuma vaca.",
    again: "RECOMEÇAR",
  },
  {
    // 2 — Imersivo (sério-engraçado)
    nome: "FATAL MUUUDEL",
    slogan: "Sistema de Seleção de Espécimes Bovinos · Protocolo de Abdução v9.7",
    enter: "INICIAR VARREDURA",
    swipeTitle: "Análise de espécimes — Setor Pasto-7",
    nope: "DESCARTAR",
    like: "SELECIONAR",
    superNope: "REJEITAR",
    superLike: "PRIORIDADE MÁXIMA",
    matchTitle: "ABDUÇÃO INICIADA",
    matchSub: "Feixe de contenção engajado. Espécime em transporte para a câmara de análise.",
    matchCta: "PRÓXIMO ESPÉCIME",
    emptyTitle: "Varredura concluída",
    emptySub: "Todos os espécimes do setor foram processados.",
    listTitle: "ESPÉCIMES CAPTURADOS",
    listEmpty: "Nenhum espécime na câmara de contenção.",
    again: "REINICIAR PROTOCOLO",
  },
];

export function stripedBg(hue: number): React.CSSProperties {
  return {
    backgroundImage: `repeating-linear-gradient(135deg, oklch(0.26 0.07 ${hue}) 0 11px, oklch(0.22 0.06 ${hue}) 11px 22px)`,
  };
}
