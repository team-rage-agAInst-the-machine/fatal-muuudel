import type { CSSProperties } from "react";

export type Cow = {
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
  photoUrl?: string | null;
  isHuman?: boolean;
  // Proteção e matchmaking
  matchScore?: number;
  protectionLevel?: string;
  desprevenida?: boolean;
  personality?: string | null;
  flightRisk?: number | null;
  temperamento?: string | null;
  signoGalactico?: string | null;
  papelNoRebanho?: string | null;
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

export function stripedBg(hue: number): CSSProperties {
  return {
    backgroundImage: `repeating-linear-gradient(135deg, oklch(0.26 0.07 ${hue}) 0 11px, oklch(0.22 0.06 ${hue}) 11px 22px)`,
  };
}
