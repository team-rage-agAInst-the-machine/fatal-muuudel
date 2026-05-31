export const TOWEL_REQUIRED_LEVELS = ["SAGRADA", "DIVINA"] as const;

// Apenas estas duas respostas confirmam que o ET sabe onde está sua toalha.
// Todas as demais (perdeu, nunca ouviu falar, usa só para tentáculos…) não contam.
export const HAS_TOWEL_VALUES = [
  "Sempre com a toalha — sou um mochileiro sério",
  "Tenho 42 toalhas, só por precaução",
] as const;

export function requiresTowel(level: string, desprevenida = false): boolean {
  if (desprevenida) return false;
  return (TOWEL_REQUIRED_LEVELS as readonly string[]).includes(level);
}

export function hasTowel(towelStatus: string | null | undefined): boolean {
  return (HAS_TOWEL_VALUES as readonly string[]).includes(towelStatus ?? "");
}
