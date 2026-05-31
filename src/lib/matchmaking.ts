export interface EtFactors {
  mooPreference?: number | null;
  maxCargoKg?: number | null;
  abductionStyle?: string | null;
  temperamento?: string | null;
  signoGalactico?: string | null;
  objetivoDaMissao?: string | null;
}

export interface CowFactors {
  mooLevel: number;
  weightKg: number;
  personality?: string | null;
  temperamento?: string | null;
  signoGalactico?: string | null;
  papelNoRebanho?: string | null;
}

const SIGNOS = [
  "Touro Nebular",
  "Leite de Andrômeda",
  "Escorpião Cósmico",
  "Buraco Negro do Boi",
  "Cometa Lanoso",
  "Pulsar Bovino",
  "Galáxia Mugidora",
  "Supernova do Pasto",
  "Quasar Ruminante",
  "Buraco de Minhoca",
  "Matéria Escura da Vaca",
  "Luz do Capim",
] as const;

// Tabela A: abductionStyle × personality → pts (max 20)
const ESTILO_PERSONALITY: Record<string, Record<string, number>> = {
  stealth:    { aventureira: 12, tímida: 20, travessa: 5,  pacífica: 18 },
  científico: { aventureira: 20, tímida: 14, travessa: 8,  pacífica: 18 },
  flashy:     { aventureira: 18, tímida: 5,  travessa: 20, pacífica: 8  },
  casual:     { aventureira: 14, tímida: 14, travessa: 14, pacífica: 14 },
};

// Tabela B: ET.temperamento × cow.temperamento → pts (max 15)
const TEMPERAMENTO: Record<string, Record<string, number>> = {
  paciente:  { dócil: 15, rebelde: 5,  curiosa: 10, indiferente: 12 },
  agitado:   { dócil: 8,  rebelde: 15, curiosa: 10, indiferente: 3  },
  curioso:   { dócil: 10, rebelde: 10, curiosa: 15, indiferente: 8  },
  dominante: { dócil: 12, rebelde: 5,  curiosa: 8,  indiferente: 15 },
};

// Tabela C: objetivoDaMissao × papelNoRebanho → pts (max 10)
const OBJETIVO_PAPEL: Record<string, Record<string, number>> = {
  pesquisa:    { líder: 7,  isolada: 10, popular: 5,  solitária: 10 },
  troféu:      { líder: 10, isolada: 5,  popular: 10, solitária: 5  },
  companhia:   { líder: 8,  isolada: 5,  popular: 10, solitária: 8  },
  experimento: { líder: 10, isolada: 10, popular: 5,  solitária: 8  },
};

function sintoniaDeSigno(et: string, cow: string): number {
  const a = SIGNOS.indexOf(et as never);
  const b = SIGNOS.indexOf(cow as never);
  if (a === -1 || b === -1) return 7;
  const diff = Math.min(Math.abs(a - b), SIGNOS.length - Math.abs(a - b));
  if (diff === 0) return 15;
  if (diff === 1) return 12;
  if (diff === 6) return 5;
  return 10;
}

export function computeCompatibility(et: EtFactors, cow: CowFactors): number {
  // 1. Sintonia de mugido (max 20)
  let score = 0;
  if (et.mooPreference == null) {
    score += 10;
  } else {
    score += Math.max(0, 20 - Math.abs(et.mooPreference - cow.mooLevel) * 2);
  }

  // 2. Carga ótima (max 20)
  if (et.maxCargoKg == null) {
    score += 12;
  } else if (et.maxCargoKg >= cow.weightKg) {
    score += 20;
  } else {
    score += Math.round((et.maxCargoKg / cow.weightKg) * 20);
  }

  // 3. Estilo × Personalidade (max 20)
  if (!et.abductionStyle || !cow.personality) {
    score += 10;
  } else {
    score += ESTILO_PERSONALITY[et.abductionStyle]?.[cow.personality] ?? 10;
  }

  // 4. Temperamento cruzado (max 15)
  if (!et.temperamento || !cow.temperamento) {
    score += 7;
  } else {
    score += TEMPERAMENTO[et.temperamento]?.[cow.temperamento] ?? 7;
  }

  // 5. Signo galáctico (max 15)
  if (!et.signoGalactico || !cow.signoGalactico) {
    score += 7;
  } else {
    score += sintoniaDeSigno(et.signoGalactico, cow.signoGalactico);
  }

  // 6. Objetivo × Papel no rebanho (max 10)
  if (!et.objetivoDaMissao || !cow.papelNoRebanho) {
    score += 5;
  } else {
    score += OBJETIVO_PAPEL[et.objetivoDaMissao]?.[cow.papelNoRebanho] ?? 5;
  }

  return Math.min(100, Math.max(0, score));
}
