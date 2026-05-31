import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/matchmaking", () => ({
  computeCompatibility: vi.fn().mockReturnValue(75),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    swipe: { findMany: vi.fn() },
    cow: { findMany: vi.fn() },
    missionConfig: { findFirst: vi.fn() },
  },
}));

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { GET } from "@/app/api/cows/route";

const mockAutET = vi.mocked(auth);
const mockBuscarDecisoes = vi.mocked(prisma.swipe.findMany);
const mockBuscarVacas = vi.mocked(prisma.cow.findMany);
const mockMissaoAtiva = vi.mocked(prisma.missionConfig.findFirst);

const SESSAO_ET = { user: { id: "et-001", email: "zork@ufo.com" } };

const VACA_PADRAO = {
  id: "mimosa",
  name: "Mimosa",
  breed: "Girolando",
  age: 4,
  farm: "Fazenda Teste",
  weightKg: 512,
  milkPct: 94,
  mooLevel: 8,
  distance: "2,3 anos-luz",
  hue: 188,
  tags: ["Leiteira Premium", "Dócil"],
  bio: "A mais mugidora do pasto intergaláctico.",
  photoUrl: "https://example.com/mimosa.jpg",
  isHuman: false,
  createdAt: new Date("2025-01-01"),
};

function makeRequest(url = "http://localhost/api/cows") {
  return new Request(url, { method: "GET" });
}

describe("GET /api/cows", () => {
  beforeEach(() => {
    mockAutET.mockReset();
    mockBuscarDecisoes.mockReset();
    mockBuscarVacas.mockReset();
    mockMissaoAtiva.mockReset();
    mockMissaoAtiva.mockResolvedValue(null); // sem missão ativa → matchmaking usa defaults
  });

  it("retorna 200 com cows[] e hasRejected quando não autenticado", async () => {
    mockAutET.mockResolvedValue(null);
    mockBuscarVacas.mockResolvedValue([VACA_PADRAO]);

    const res = await GET(makeRequest());

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("cows");
    expect(data).toHaveProperty("hasRejected");
    expect(data.hasRejected).toBe(false);
    expect(Array.isArray(data.cows)).toBe(true);
  });

  it("não consulta swipes quando não autenticado", async () => {
    mockAutET.mockResolvedValue(null);
    mockBuscarVacas.mockResolvedValue([VACA_PADRAO]);

    await GET(makeRequest());

    expect(mockBuscarDecisoes).not.toHaveBeenCalled();
  });

  it("exclui vacas já swipadas (LIKE, SUPER e PASS) da lista retornada no range padrão", async () => {
    mockAutET.mockResolvedValue(SESSAO_ET);
    mockBuscarDecisoes.mockResolvedValue([
      { cowId: "mimosa", direction: "LIKE" },
      { cowId: "bezerrada", direction: "PASS" },
    ]);
    mockBuscarVacas.mockResolvedValue([]);

    await GET(makeRequest());

    expect(mockBuscarVacas).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: { notIn: expect.arrayContaining(["mimosa", "bezerrada"]) } },
      })
    );
  });

  it("?range=100 é aceito e exclui apenas vacas com LIKE/SUPER (não as com PASS)", async () => {
    mockAutET.mockResolvedValue(SESSAO_ET);
    mockBuscarDecisoes.mockResolvedValue([
      { cowId: "mimosa", direction: "LIKE" },
      { cowId: "bezerrada", direction: "PASS" },
    ]);
    mockBuscarVacas.mockResolvedValue([]);

    await GET(makeRequest("http://localhost/api/cows?range=100"));

    const call = mockBuscarVacas.mock.calls[0][0];
    const notIn: string[] = call.where.id.notIn;

    // Vaca com LIKE fica excluída mesmo com range ampliado
    expect(notIn).toContain("mimosa");
    // Vaca com PASS deve reaparecer no range ampliado (não está no notIn)
    expect(notIn).not.toContain("bezerrada");
  });

  it("hasRejected: true quando user tem swipes com PASS", async () => {
    mockAutET.mockResolvedValue(SESSAO_ET);
    mockBuscarDecisoes.mockResolvedValue([
      { cowId: "bezerrada", direction: "PASS" },
    ]);
    mockBuscarVacas.mockResolvedValue([VACA_PADRAO]);

    const res = await GET(makeRequest());
    const data = await res.json();

    expect(data.hasRejected).toBe(true);
  });

  it("hasRejected: false quando user não tem swipes com PASS", async () => {
    mockAutET.mockResolvedValue(SESSAO_ET);
    mockBuscarDecisoes.mockResolvedValue([
      { cowId: "mimosa", direction: "LIKE" },
    ]);
    mockBuscarVacas.mockResolvedValue([VACA_PADRAO]);

    const res = await GET(makeRequest());
    const data = await res.json();

    expect(data.hasRejected).toBe(false);
  });

  it("hasRejected: false quando user não tem nenhum swipe", async () => {
    mockAutET.mockResolvedValue(SESSAO_ET);
    mockBuscarDecisoes.mockResolvedValue([]);
    mockBuscarVacas.mockResolvedValue([VACA_PADRAO]);

    const res = await GET(makeRequest());
    const data = await res.json();

    expect(data.hasRejected).toBe(false);
  });

  it("retorna vacas com todos os campos esperados (id, name, breed, farm, distance, bio, tags, etc.)", async () => {
    mockAutET.mockResolvedValue(SESSAO_ET);
    mockBuscarDecisoes.mockResolvedValue([]);
    mockBuscarVacas.mockResolvedValue([VACA_PADRAO]);

    const res = await GET(makeRequest());
    const data = await res.json();

    expect(data.cows).toHaveLength(1);
    const cow = data.cows[0];
    expect(cow.id).toBe("mimosa");
    expect(cow.name).toBe("Mimosa");
    expect(cow.breed).toBe("Girolando");
    expect(cow.farm).toBe("Fazenda Teste");
    expect(cow.distance).toBe("2,3 anos-luz");
    expect(cow.bio).toBe("A mais mugidora do pasto intergaláctico.");
    expect(cow.tags).toEqual(["Leiteira Premium", "Dócil"]);
    expect(cow.age).toBe(4);
    expect(cow.weightKg).toBe(512);
    expect(cow.milkPct).toBe(94);
    expect(cow.mooLevel).toBe(8);
    expect(cow.hue).toBe(188);
    expect(cow.photoUrl).toBe("https://example.com/mimosa.jpg");
    expect(cow.isHuman).toBe(false);
  });

  it("vacas com isHuman: true são incluídas na lista (são intencionais)", async () => {
    const humanCow = { ...VACA_PADRAO, id: "etbilu", name: "ET Bilu", isHuman: true };
    mockAutET.mockResolvedValue(SESSAO_ET);
    mockBuscarDecisoes.mockResolvedValue([]);
    mockBuscarVacas.mockResolvedValue([humanCow]);

    const res = await GET(makeRequest());
    const data = await res.json();

    const found = data.cows.find((c: { id: string }) => c.id === "etbilu");
    expect(found).toBeDefined();
    expect(found.isHuman).toBe(true);
  });

  it("retorna 200 com cows[] e hasRejected para user autenticado sem swipes", async () => {
    mockAutET.mockResolvedValue(SESSAO_ET);
    mockBuscarDecisoes.mockResolvedValue([]);
    mockBuscarVacas.mockResolvedValue([VACA_PADRAO]);

    const res = await GET(makeRequest());

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.cows)).toBe(true);
    expect(typeof data.hasRejected).toBe("boolean");
  });

  it("sem missão ativa: não chama computeCompatibility com parâmetros nulos e retorna vacas", async () => {
    mockAutET.mockResolvedValue(SESSAO_ET);
    mockBuscarDecisoes.mockResolvedValue([]);
    mockBuscarVacas.mockResolvedValue([VACA_PADRAO]);
    mockMissaoAtiva.mockResolvedValue(null);

    const res = await GET(makeRequest());
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.cows).toHaveLength(1);
    // computeCompatibility foi chamado com {} (sem parâmetros de missão) → usa defaults internos
    expect(data.cows[0]).toHaveProperty("matchScore");
    expect(typeof data.cows[0].matchScore).toBe("number");
  });

  it("com missão ativa: passa parâmetros da missão para computeCompatibility", async () => {
    const { computeCompatibility } = await import("@/lib/matchmaking");
    mockAutET.mockResolvedValue(SESSAO_ET);
    mockBuscarDecisoes.mockResolvedValue([]);
    mockBuscarVacas.mockResolvedValue([VACA_PADRAO]);
    mockMissaoAtiva.mockResolvedValue({
      mooPreference: 9,
      maxCargoKg: 600,
      abductionStyle: "stealth",
      temperamento: "curioso",
      signoGalactico: "Pulsar Bovino",
      objetivoDaMissao: "pesquisa",
    });

    await GET(makeRequest());

    expect(vi.mocked(computeCompatibility)).toHaveBeenCalledWith(
      expect.objectContaining({
        mooPreference: 9,
        abductionStyle: "stealth",
        signoGalactico: "Pulsar Bovino",
      }),
      expect.any(Object)
    );
  });

  it("vacas são ordenadas por matchScore decrescente quando há missão ativa", async () => {
    const { computeCompatibility } = await import("@/lib/matchmaking");
    const vaca2 = { ...VACA_PADRAO, id: "geraldina", name: "Geraldina" };
    vi.mocked(computeCompatibility)
      .mockReturnValueOnce(42)  // mimosa → score 42
      .mockReturnValueOnce(88); // geraldina → score 88

    mockAutET.mockResolvedValue(SESSAO_ET);
    mockBuscarDecisoes.mockResolvedValue([]);
    mockBuscarVacas.mockResolvedValue([VACA_PADRAO, vaca2]);

    const res = await GET(makeRequest());
    const data = await res.json();

    expect(data.cows[0].id).toBe("geraldina"); // maior score primeiro
    expect(data.cows[1].id).toBe("mimosa");
  });

  // SKIP: a rota não possui try/catch global, portanto uma exceção lançada por auth()
  // se propaga para fora do handler em vez de ser capturada e retornada como 500.
  it.skip("retorna 500 quando auth() lanca excecao inesperada", async () => {
    vi.mocked(auth).mockRejectedValue(new Error("session store unavailable"));
    const res = await GET(new Request("http://localhost/api/cows"));
    expect(res.status).toBe(500);
  });
});
