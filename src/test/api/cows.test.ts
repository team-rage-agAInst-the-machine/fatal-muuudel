import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSwipeFindMany = vi.fn();
const mockCowFindMany = vi.fn();

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    swipe: { findMany: mockSwipeFindMany },
    cow: { findMany: mockCowFindMany },
  },
}));

const { auth } = await import("@/auth");
const mockAuth = vi.mocked(auth);

const { GET } = await import("@/app/api/cows/route");

const SESSION = { user: { id: "et-001", email: "zork@ufo.com" } };

const BASE_COW = {
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
    mockAuth.mockReset();
    mockSwipeFindMany.mockReset();
    mockCowFindMany.mockReset();
  });

  it("retorna 200 com cows[] e hasRejected quando não autenticado", async () => {
    mockAuth.mockResolvedValue(null);
    mockCowFindMany.mockResolvedValue([BASE_COW]);

    const res = await GET(makeRequest());

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("cows");
    expect(data).toHaveProperty("hasRejected");
    expect(data.hasRejected).toBe(false);
    expect(Array.isArray(data.cows)).toBe(true);
  });

  it("não consulta swipes quando não autenticado", async () => {
    mockAuth.mockResolvedValue(null);
    mockCowFindMany.mockResolvedValue([BASE_COW]);

    await GET(makeRequest());

    expect(mockSwipeFindMany).not.toHaveBeenCalled();
  });

  it("exclui vacas já swipadas (LIKE, SUPER e PASS) da lista retornada no range padrão", async () => {
    mockAuth.mockResolvedValue(SESSION);
    mockSwipeFindMany.mockResolvedValue([
      { cowId: "mimosa", direction: "LIKE" },
      { cowId: "bezerrada", direction: "PASS" },
    ]);
    mockCowFindMany.mockResolvedValue([]);

    await GET(makeRequest());

    expect(mockCowFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: { notIn: expect.arrayContaining(["mimosa", "bezerrada"]) } },
      })
    );
  });

  it("?range=100 é aceito e exclui apenas vacas com LIKE/SUPER (não as com PASS)", async () => {
    mockAuth.mockResolvedValue(SESSION);
    mockSwipeFindMany.mockResolvedValue([
      { cowId: "mimosa", direction: "LIKE" },
      { cowId: "bezerrada", direction: "PASS" },
    ]);
    mockCowFindMany.mockResolvedValue([]);

    await GET(makeRequest("http://localhost/api/cows?range=100"));

    const call = mockCowFindMany.mock.calls[0][0];
    const notIn: string[] = call.where.id.notIn;

    // Vaca com LIKE fica excluída mesmo com range ampliado
    expect(notIn).toContain("mimosa");
    // Vaca com PASS deve reaparecer no range ampliado (não está no notIn)
    expect(notIn).not.toContain("bezerrada");
  });

  it("hasRejected: true quando user tem swipes com PASS", async () => {
    mockAuth.mockResolvedValue(SESSION);
    mockSwipeFindMany.mockResolvedValue([
      { cowId: "bezerrada", direction: "PASS" },
    ]);
    mockCowFindMany.mockResolvedValue([BASE_COW]);

    const res = await GET(makeRequest());
    const data = await res.json();

    expect(data.hasRejected).toBe(true);
  });

  it("hasRejected: false quando user não tem swipes com PASS", async () => {
    mockAuth.mockResolvedValue(SESSION);
    mockSwipeFindMany.mockResolvedValue([
      { cowId: "mimosa", direction: "LIKE" },
    ]);
    mockCowFindMany.mockResolvedValue([BASE_COW]);

    const res = await GET(makeRequest());
    const data = await res.json();

    expect(data.hasRejected).toBe(false);
  });

  it("hasRejected: false quando user não tem nenhum swipe", async () => {
    mockAuth.mockResolvedValue(SESSION);
    mockSwipeFindMany.mockResolvedValue([]);
    mockCowFindMany.mockResolvedValue([BASE_COW]);

    const res = await GET(makeRequest());
    const data = await res.json();

    expect(data.hasRejected).toBe(false);
  });

  it("retorna vacas com todos os campos esperados (id, name, breed, farm, distance, bio, tags, etc.)", async () => {
    mockAuth.mockResolvedValue(SESSION);
    mockSwipeFindMany.mockResolvedValue([]);
    mockCowFindMany.mockResolvedValue([BASE_COW]);

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
    const humanCow = { ...BASE_COW, id: "etbilu", name: "ET Bilu", isHuman: true };
    mockAuth.mockResolvedValue(SESSION);
    mockSwipeFindMany.mockResolvedValue([]);
    mockCowFindMany.mockResolvedValue([humanCow]);

    const res = await GET(makeRequest());
    const data = await res.json();

    const found = data.cows.find((c: { id: string }) => c.id === "etbilu");
    expect(found).toBeDefined();
    expect(found.isHuman).toBe(true);
  });

  it("retorna 200 com cows[] e hasRejected para user autenticado sem swipes", async () => {
    mockAuth.mockResolvedValue(SESSION);
    mockSwipeFindMany.mockResolvedValue([]);
    mockCowFindMany.mockResolvedValue([BASE_COW]);

    const res = await GET(makeRequest());

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.cows)).toBe(true);
    expect(typeof data.hasRejected).toBe("boolean");
  });
});
