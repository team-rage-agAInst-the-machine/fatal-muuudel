import { describe, it, expect } from "vitest";
import { computeCompatibility, type EtFactors, type CowFactors } from "@/lib/matchmaking";

const baseCow: CowFactors = {
  mooLevel: 5,
  weightKg: 500,
};

const baseEt: EtFactors = {};

describe("computeCompatibility", () => {
  it("retorna score no range 0-100 para inputs sem preferências", () => {
    const score = computeCompatibility(baseEt, baseCow);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("ET e vaca com todos os campos null retorna score entre 41 e 51 (soma dos defaults)", () => {
    const score = computeCompatibility(baseEt, baseCow);
    // defaults: 10 + 12 + 10 + 7 + 7 + 5 = 51
    expect(score).toBe(51);
  });

  it("ET flashy + vaca aventureira resulta em fator EstiloPersonalidade = 18", () => {
    const et: EtFactors = { abductionStyle: "flashy" };
    const cow: CowFactors = { ...baseCow, personality: "aventureira" };
    const full = computeCompatibility({ ...baseEt }, { mooLevel: 5, weightKg: 500 });
    const withStyle = computeCompatibility(et, cow);
    // diff = 18 - 10 (default) = +8
    expect(withStyle - full).toBe(8);
  });

  it("mooPreference igual ao mooLevel resulta em 20 pts (sintonia máxima)", () => {
    const et: EtFactors = { mooPreference: 5 };
    const score = computeCompatibility(et, { mooLevel: 5, weightKg: 500 });
    // moo: 20, outros: 12+10+7+7+5 = 41 → total 61
    expect(score).toBe(61);
  });

  it("mesmo signoGalactico resulta em fator SignoGaláctico = 15", () => {
    const et: EtFactors = { signoGalactico: "Pulsar Bovino" };
    const cow: CowFactors = { ...baseCow, signoGalactico: "Pulsar Bovino" };
    const withoutSigno = computeCompatibility(baseEt, baseCow);
    const withSigno = computeCompatibility(et, cow);
    // diff = 15 - 7 (default) = +8
    expect(withSigno - withoutSigno).toBe(8);
  });

  it("signo oposto (±6) resulta em 5 pts", () => {
    // índice 0 vs índice 6 = diferença de 6 (oposto)
    const et: EtFactors = { signoGalactico: "Touro Nebular" };        // índice 0
    const cow: CowFactors = { ...baseCow, signoGalactico: "Galáxia Mugidora" }; // índice 6
    const withoutSigno = computeCompatibility(baseEt, baseCow);
    const withSigno = computeCompatibility(et, cow);
    // diff = 5 - 7 = -2
    expect(withSigno - withoutSigno).toBe(-2);
  });

  it("maxCargoKg >= weightKg resulta em 20 pts de CargaÓtima", () => {
    const et: EtFactors = { maxCargoKg: 600 };
    const score = computeCompatibility(et, { mooLevel: 5, weightKg: 500 });
    const scoreNull = computeCompatibility(baseEt, baseCow);
    // diff = 20 - 12 (default) = +8
    expect(score - scoreNull).toBe(8);
  });

  it("score não ultrapassa 100", () => {
    const et: EtFactors = {
      mooPreference: 10,
      maxCargoKg: 9999,
      abductionStyle: "científico",
      temperamento: "curioso",
      signoGalactico: "Escorpião Cósmico",
      objetivoDaMissao: "pesquisa",
    };
    const cow: CowFactors = {
      mooLevel: 10,
      weightKg: 100,
      personality: "aventureira",
      temperamento: "curiosa",
      signoGalactico: "Escorpião Cósmico",
      papelNoRebanho: "isolada",
    };
    expect(computeCompatibility(et, cow)).toBeLessThanOrEqual(100);
  });

  it("score não fica abaixo de 0", () => {
    const et: EtFactors = { mooPreference: 0, maxCargoKg: 1 };
    const cow: CowFactors = { mooLevel: 10, weightKg: 10000 };
    expect(computeCompatibility(et, cow)).toBeGreaterThanOrEqual(0);
  });
});
