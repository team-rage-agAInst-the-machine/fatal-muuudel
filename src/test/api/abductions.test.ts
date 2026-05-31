import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    abduction: { findMany: vi.fn() },
    swipe: { findMany: vi.fn() },
  },
}));

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { GET } from "@/app/api/abductions/route";

const mockAutET = vi.mocked(auth);
const mockAbductionFindMany = vi.mocked(prisma.abduction.findMany);
const mockBuscarDecisoes = vi.mocked(prisma.swipe.findMany);

const SESSAO_ET = { user: { id: "et-001", email: "zork@ufo.com" } };

const mockCow = {
  id: "cow-1",
  name: "Mimosa",
  age: 4,
  breed: "Girolando",
  farm: "Fazenda Intergaláctica",
  weightKg: 512,
  milkPct: 94,
  mooLevel: 8,
  distance: "2,3 anos-luz",
  hue: 188,
  tags: ["Leiteira", "Gordinha"],
  bio: "A melhor vaca do universo.",
  photoUrl: "https://example.com/mimosa.jpg",
  isHuman: false,
};

function makeRequest(url = "http://localhost/api/abductions") {
  return new Request(url, { method: "GET" });
}

describe("GET /api/abductions", () => {
  beforeEach(() => {
    mockAutET.mockReset();
    mockAbductionFindMany.mockReset();
    mockBuscarDecisoes.mockReset();
  });

  it("retorna 401 quando não autenticado", async () => {
    mockAutET.mockResolvedValue(null);
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("retorna [] quando user não tem abduções", async () => {
    mockAutET.mockResolvedValue(SESSAO_ET);
    mockAbductionFindMany.mockResolvedValue([]);
    mockBuscarDecisoes.mockResolvedValue([]);

    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.abductions).toEqual([]);
  });

  it("retorna lista com cow incluída (include com select explícito)", async () => {
    mockAutET.mockResolvedValue(SESSAO_ET);
    mockAbductionFindMany.mockResolvedValue([
      { cowId: "cow-1", cow: mockCow, createdAt: new Date("2025-01-01") },
    ] as never);
    mockBuscarDecisoes.mockResolvedValue([
      { cowId: "cow-1", direction: "LIKE" },
    ] as never);

    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.abductions).toHaveLength(1);
    expect(data.abductions[0].cow).toMatchObject({ id: "cow-1", name: "Mimosa" });
  });

  it("busca abduções com include usando select explícito nos campos da vaca", async () => {
    mockAutET.mockResolvedValue(SESSAO_ET);
    mockAbductionFindMany.mockResolvedValue([]);
    mockBuscarDecisoes.mockResolvedValue([]);

    await GET(makeRequest());

    expect(mockAbductionFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: {
          cow: {
            select: expect.objectContaining({
              id: true,
              name: true,
              photoUrl: true,
              breed: true,
              bio: true,
              mooLevel: true,
              tags: true,
              hue: true,
              distance: true,
              age: true,
              isHuman: true,
            }),
          },
        },
      })
    );
  });

  it("busca abduções ordenadas por createdAt desc", async () => {
    mockAutET.mockResolvedValue(SESSAO_ET);
    mockAbductionFindMany.mockResolvedValue([]);
    mockBuscarDecisoes.mockResolvedValue([]);

    await GET(makeRequest());

    expect(mockAbductionFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: "desc" } })
    );

    expect(mockBuscarDecisoes).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ alienId: expect.any(String) }),
      })
    );
  });

  it("vip: true quando o swipe correspondente foi SUPER", async () => {
    mockAutET.mockResolvedValue(SESSAO_ET);
    mockAbductionFindMany.mockResolvedValue([
      { cowId: "cow-1", cow: mockCow, createdAt: new Date("2025-01-01") },
    ] as never);
    mockBuscarDecisoes.mockResolvedValue([
      { cowId: "cow-1", direction: "SUPER" },
    ] as never);

    const res = await GET(makeRequest());
    const data = await res.json();
    expect(data.abductions[0].vip).toBe(true);
  });

  it("vip: false quando o swipe correspondente foi LIKE", async () => {
    mockAutET.mockResolvedValue(SESSAO_ET);
    mockAbductionFindMany.mockResolvedValue([
      { cowId: "cow-1", cow: mockCow, createdAt: new Date("2025-01-01") },
    ] as never);
    mockBuscarDecisoes.mockResolvedValue([
      { cowId: "cow-1", direction: "LIKE" },
    ] as never);

    const res = await GET(makeRequest());
    const data = await res.json();
    expect(data.abductions[0].vip).toBe(false);
  });

  it("vip: false quando nao ha swipe correspondente para a vaca", async () => {
    mockAutET.mockResolvedValue(SESSAO_ET);
    mockAbductionFindMany.mockResolvedValue([
      { cowId: "cow-1", cow: mockCow, createdAt: new Date("2025-01-01") },
    ] as never);
    mockBuscarDecisoes.mockResolvedValue([] as never);

    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.abductions[0].vip).toBe(false);
  });

  it("retorna 200 com { abductions: [...] }", async () => {
    mockAutET.mockResolvedValue(SESSAO_ET);
    const cow2 = { ...mockCow, id: "cow-2", name: "Beladona" };
    mockAbductionFindMany.mockResolvedValue([
      { cowId: "cow-1", cow: mockCow, createdAt: new Date("2025-02-01") },
      { cowId: "cow-2", cow: cow2, createdAt: new Date("2025-01-01") },
    ] as never);
    mockBuscarDecisoes.mockResolvedValue([
      { cowId: "cow-1", direction: "SUPER" },
      { cowId: "cow-2", direction: "LIKE" },
    ] as never);

    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("abductions");
    expect(Array.isArray(data.abductions)).toBe(true);
    expect(data.abductions).toHaveLength(2);
    expect(data.abductions[0].vip).toBe(true);
    expect(data.abductions[1].vip).toBe(false);
  });

  it("retorna page e pageSize no response", async () => {
    mockAutET.mockResolvedValue(SESSAO_ET);
    mockAbductionFindMany.mockResolvedValue([]);
    mockBuscarDecisoes.mockResolvedValue([]);

    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.page).toBe(1);
    expect(data.pageSize).toBe(50);
  });

  it("?page=2 passa skip correto para o findMany", async () => {
    mockAutET.mockResolvedValue(SESSAO_ET);
    mockAbductionFindMany.mockResolvedValue([]);
    mockBuscarDecisoes.mockResolvedValue([]);

    await GET(makeRequest("http://localhost/api/abductions?page=2"));

    expect(mockAbductionFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 50, take: 50 })
    );
  });
});
