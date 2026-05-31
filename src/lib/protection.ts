export const TOWEL_REQUIRED_LEVELS = ["SAGRADA", "DIVINA"] as const;

export function requiresTowel(level: string, desprevenida = false): boolean {
  if (desprevenida) return false;
  return (TOWEL_REQUIRED_LEVELS as readonly string[]).includes(level);
}

export function hasTowel(towelStatus: string | null | undefined): boolean {
  return !!towelStatus && towelStatus !== "perdida";
}
