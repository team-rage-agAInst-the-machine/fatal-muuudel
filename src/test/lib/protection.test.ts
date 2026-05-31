import { describe, it, expect } from "vitest";
import { requiresTowel, hasTowel } from "@/lib/protection";

describe("requiresTowel", () => {
  it("retorna true para SAGRADA", () => {
    expect(requiresTowel("SAGRADA")).toBe(true);
  });

  it("retorna true para DIVINA", () => {
    expect(requiresTowel("DIVINA")).toBe(true);
  });

  it("retorna false para ELITE", () => {
    expect(requiresTowel("ELITE")).toBe(false);
  });

  it("retorna false para VEDETE", () => {
    expect(requiresTowel("VEDETE")).toBe(false);
  });

  it("retorna false para CAMPESTRE", () => {
    expect(requiresTowel("CAMPESTRE")).toBe(false);
  });

  it("retorna false para EXTRAVIADA", () => {
    expect(requiresTowel("EXTRAVIADA")).toBe(false);
  });

  it("DIVINA com desprevenida=true retorna false (Lulubelle exception)", () => {
    expect(requiresTowel("DIVINA", true)).toBe(false);
  });

  it("SAGRADA com desprevenida=true retorna false", () => {
    expect(requiresTowel("SAGRADA", true)).toBe(false);
  });

  it("desprevenida=false não afeta DIVINA (ainda requer toalha)", () => {
    expect(requiresTowel("DIVINA", false)).toBe(true);
  });
});

describe("hasTowel", () => {
  it("retorna false para null", () => {
    expect(hasTowel(null)).toBe(false);
  });

  it("retorna false para undefined", () => {
    expect(hasTowel(undefined)).toBe(false);
  });

  it("retorna false para string vazia", () => {
    expect(hasTowel("")).toBe(false);
  });

  it("retorna false para 'Perdi no buraco negro de Magrathea'", () => {
    expect(hasTowel("Perdi no buraco negro de Magrathea")).toBe(false);
  });

  it("retorna false para 'Nunca ouvi falar — o que é uma toalha?'", () => {
    expect(hasTowel("Nunca ouvi falar — o que é uma toalha?")).toBe(false);
  });

  it("retorna false para 'Uso apenas para secar meus tentáculos'", () => {
    expect(hasTowel("Uso apenas para secar meus tentáculos")).toBe(false);
  });

  it("retorna true para 'Sempre com a toalha — sou um mochileiro sério'", () => {
    expect(hasTowel("Sempre com a toalha — sou um mochileiro sério")).toBe(true);
  });

  it("retorna true para 'Tenho 42 toalhas, só por precaução'", () => {
    expect(hasTowel("Tenho 42 toalhas, só por precaução")).toBe(true);
  });

  it("retorna false para qualquer valor desconhecido/legado", () => {
    expect(hasTowel("mochila")).toBe(false);
    expect(hasTowel("capsula")).toBe(false);
    expect(hasTowel("cintura")).toBe(false);
    expect(hasTowel("perdida")).toBe(false);
  });
});
