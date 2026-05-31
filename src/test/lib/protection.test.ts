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

  it("retorna false para 'perdida'", () => {
    expect(hasTowel("perdida")).toBe(false);
  });

  it("retorna true para 'mochila'", () => {
    expect(hasTowel("mochila")).toBe(true);
  });

  it("retorna true para 'capsula'", () => {
    expect(hasTowel("capsula")).toBe(true);
  });

  it("retorna true para 'cintura'", () => {
    expect(hasTowel("cintura")).toBe(true);
  });
});
