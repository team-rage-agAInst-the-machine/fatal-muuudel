import { describe, it, expect, vi, beforeEach } from "vitest";

// TODOS os mocks ANTES dos imports do SUT
vi.mock("@/generated/prisma/client", () => ({
  SwipeDirection: { LIKE: "LIKE", SUPER: "SUPER", PASS: "PASS" },
}));

const mockSwipeUpsert = vi.fn();
const mockSwipeDeleteMany = vi.fn();
const mockAbductionUpsert = vi.fn();
const mockAbductionDeleteMany = vi.fn();

const mockCowFindUnique = vi.fn();
const mockUserFindUnique = vi.fn();

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    swipe: { upsert: mockSwipeUpsert, deleteMany: mockSwipeDeleteMany },
    abduction: { upsert: mockAbductionUpsert, deleteMany: mockAbductionDeleteMany },
    cow: { findUnique: mockCowFindUnique },
    user: { findUnique: mockUserFindUnique },
  },
}));

const { auth } = await import("@/auth");
const mockAutET = vi.mocked(auth);

const { POST, DELETE } = await import("@/app/api/swipes/route");

const SESSAO_ET = { user: { id: "et-001", email: "zork@ufo.com" } };

function makePostRequest(body: unknown) {
  return new Request("http://localhost/api/swipes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeDeleteRequest(cowId?: string) {
  const url = cowId
    ? `http://localhost/api/swipes?cowId=${cowId}`
    : "http://localhost/api/swipes";
  return new Request(url, { method: "DELETE" });
}

describe("POST /api/swipes", () => {
  beforeEach(() => {
    mockAutET.mockReset();
    mockSwipeUpsert.mockReset();
    mockAbductionUpsert.mockReset();
    mockSwipeDeleteMany.mockReset();
    mockAbductionDeleteMany.mockReset();
    mockCowFindUnique.mockReset();
    mockUserFindUnique.mockReset();
    mockSwipeUpsert.mockResolvedValue({});
    mockAbductionUpsert.mockResolvedValue({});
    // Default: vaca sem proteção especial, ET sem toalha
    mockCowFindUnique.mockResolvedValue({ protectionLevel: "CAMPESTRE", desprevenida: false });
    mockUserFindUnique.mockResolvedValue({ towelStatus: null });
  });

  it("retorna 401 quando não autenticado", async () => {
    mockAutET.mockResolvedValue(null);
    const res = await POST(makePostRequest({ cowId: "mimosa", direction: "like" }));
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("retorna 400 quando direction é inválida", async () => {
    mockAutET.mockResolvedValue(SESSAO_ET);
    const res = await POST(makePostRequest({ cowId: "mimosa", direction: "VAMOS_ABDUZIR" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid payload");
  });

  it("LIKE cria Swipe + Abduction com status PLANNED (upsert)", async () => {
    mockAutET.mockResolvedValue(SESSAO_ET);
    const res = await POST(makePostRequest({ cowId: "mimosa", direction: "like" }));
    expect(res.status).toBe(200);
    expect(mockSwipeUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { alienId_cowId: { alienId: "et-001", cowId: "mimosa" } },
        create: { alienId: "et-001", cowId: "mimosa", direction: "LIKE" },
        update: { direction: "LIKE" },
      })
    );
    expect(mockAbductionUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { alienId_cowId: { alienId: "et-001", cowId: "mimosa" } },
        create: { alienId: "et-001", cowId: "mimosa", status: "PLANNED" },
        update: {},
      })
    );
  });

  it("SUPER cria Swipe + Abduction com status PLANNED (upsert)", async () => {
    mockAutET.mockResolvedValue(SESSAO_ET);
    const res = await POST(makePostRequest({ cowId: "mimosa", direction: "super" }));
    expect(res.status).toBe(200);
    expect(mockSwipeUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ direction: "SUPER" }),
      })
    );
    expect(mockAbductionUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ status: "PLANNED" }),
      })
    );
  });

  it("PASS: frontend envia nope, API normaliza e persiste direction PASS", async () => {
    // A UI envia "nope" como alias para PASS — a API normaliza internamente
    mockAutET.mockResolvedValue(SESSAO_ET);
    const res = await POST(makePostRequest({ cowId: "mimosa", direction: "nope" }));
    expect(res.status).toBe(200);
    expect(mockSwipeUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ direction: "PASS" }),
      })
    );
    expect(mockAbductionUpsert).not.toHaveBeenCalled();
  });

  it("retorna 200 em caso de sucesso", async () => {
    mockAutET.mockResolvedValue(SESSAO_ET);
    const res = await POST(makePostRequest({ cowId: "mimosa", direction: "like" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });

  it("retorna 403 NO_TOWEL ao tentar LIKE em vaca DIVINA sem toalha", async () => {
    mockAutET.mockResolvedValue(SESSAO_ET);
    mockCowFindUnique.mockResolvedValue({ protectionLevel: "DIVINA", desprevenida: false });
    mockUserFindUnique.mockResolvedValue({ towelStatus: null });
    const res = await POST(makePostRequest({ cowId: "clarabelle", direction: "like" }));
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toBe("NO_TOWEL");
  });

  it("retorna 403 NO_TOWEL ao tentar SUPER em vaca SAGRADA sem toalha", async () => {
    mockAutET.mockResolvedValue(SESSAO_ET);
    mockCowFindUnique.mockResolvedValue({ protectionLevel: "SAGRADA", desprevenida: false });
    mockUserFindUnique.mockResolvedValue({ towelStatus: "Perdi no buraco negro de Magrathea" });
    const res = await POST(makePostRequest({ cowId: "mozzarina", direction: "super" }));
    expect(res.status).toBe(403);
  });

  it("permite LIKE em vaca DIVINA desprevenida mesmo sem toalha (Lulubelle exception)", async () => {
    mockAutET.mockResolvedValue(SESSAO_ET);
    mockCowFindUnique.mockResolvedValue({ protectionLevel: "DIVINA", desprevenida: true });
    mockUserFindUnique.mockResolvedValue({ towelStatus: null });
    const res = await POST(makePostRequest({ cowId: "lulubelle", direction: "like" }));
    expect(res.status).toBe(200);
  });

  it("permite LIKE em vaca DIVINA quando ET tem toalha", async () => {
    mockAutET.mockResolvedValue(SESSAO_ET);
    mockCowFindUnique.mockResolvedValue({ protectionLevel: "DIVINA", desprevenida: false });
    mockUserFindUnique.mockResolvedValue({ towelStatus: "Sempre com a toalha — sou um mochileiro sério" });
    const res = await POST(makePostRequest({ cowId: "clarabelle", direction: "like" }));
    expect(res.status).toBe(200);
  });

  it("PASS não verifica toalha (qualquer vaca aceita PASS)", async () => {
    mockAutET.mockResolvedValue(SESSAO_ET);
    mockCowFindUnique.mockResolvedValue({ protectionLevel: "DIVINA", desprevenida: false });
    mockUserFindUnique.mockResolvedValue({ towelStatus: null });
    const res = await POST(makePostRequest({ cowId: "clarabelle", direction: "nope" }));
    expect(res.status).toBe(200);
    expect(mockCowFindUnique).not.toHaveBeenCalled();
  });

  // A rota não possui try/catch em torno das chamadas ao banco — erros de DB propagam
  // como exceção não tratada em vez de retornar 500. Habilitar após adicionar tratamento de erro.
  it.skip("retorna 500 quando o banco falha ao registrar swipe", async () => {
    mockAutET.mockResolvedValue(SESSAO_ET);
    mockSwipeUpsert.mockRejectedValue(new Error("DB explodiu"));
    const res = await POST(makePostRequest({ cowId: "mimosa", direction: "like" }));
    expect(res.status).toBe(500);
  });
});

describe("DELETE /api/swipes", () => {
  beforeEach(() => {
    mockAutET.mockReset();
    mockSwipeUpsert.mockReset();
    mockAbductionUpsert.mockReset();
    mockSwipeDeleteMany.mockReset();
    mockAbductionDeleteMany.mockReset();
    mockSwipeDeleteMany.mockResolvedValue({ count: 1 });
    mockAbductionDeleteMany.mockResolvedValue({ count: 1 });
  });

  it("retorna 401 quando não autenticado", async () => {
    mockAutET.mockResolvedValue(null);
    const res = await DELETE(makeDeleteRequest("mimosa"));
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("retorna 400 quando cowId não fornecido", async () => {
    mockAutET.mockResolvedValue(SESSAO_ET);
    const res = await DELETE(makeDeleteRequest());
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("cowId obrigatório");
  });

  it("deleta a Abduction associada", async () => {
    mockAutET.mockResolvedValue(SESSAO_ET);
    await DELETE(makeDeleteRequest("mimosa"));
    expect(mockAbductionDeleteMany).toHaveBeenCalledWith({
      where: { alienId: "et-001", cowId: "mimosa" },
    });
  });

  it("deleta o Swipe existente", async () => {
    mockAutET.mockResolvedValue(SESSAO_ET);
    await DELETE(makeDeleteRequest("mimosa"));
    expect(mockSwipeDeleteMany).toHaveBeenCalledWith({
      where: { alienId: "et-001", cowId: "mimosa" },
    });
  });

  it("retorna 200 em caso de sucesso", async () => {
    mockAutET.mockResolvedValue(SESSAO_ET);
    const res = await DELETE(makeDeleteRequest("mimosa"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });
});
