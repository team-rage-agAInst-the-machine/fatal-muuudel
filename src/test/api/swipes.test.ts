import { describe, it, expect, vi, beforeEach } from "vitest";

// TODOS os mocks ANTES dos imports do SUT
vi.mock("@/generated/prisma/client", () => ({
  SwipeDirection: { LIKE: "LIKE", SUPER: "SUPER", PASS: "PASS" },
}));

const mockSwipeUpsert = vi.fn();
const mockSwipeDeleteMany = vi.fn();
const mockAbductionUpsert = vi.fn();
const mockAbductionDeleteMany = vi.fn();

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    swipe: { upsert: mockSwipeUpsert, deleteMany: mockSwipeDeleteMany },
    abduction: { upsert: mockAbductionUpsert, deleteMany: mockAbductionDeleteMany },
  },
}));

const { auth } = await import("@/auth");
const mockAuth = vi.mocked(auth);

const { POST, DELETE } = await import("@/app/api/swipes/route");

const SESSION = { user: { id: "et-001", email: "zork@ufo.com" } };

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
    mockAuth.mockReset();
    mockSwipeUpsert.mockReset();
    mockAbductionUpsert.mockReset();
    mockSwipeDeleteMany.mockReset();
    mockAbductionDeleteMany.mockReset();
    mockSwipeUpsert.mockResolvedValue({});
    mockAbductionUpsert.mockResolvedValue({});
  });

  it("retorna 401 quando não autenticado", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await POST(makePostRequest({ cowId: "mimosa", direction: "like" }));
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("retorna 400 quando direction é inválida", async () => {
    mockAuth.mockResolvedValue(SESSION);
    const res = await POST(makePostRequest({ cowId: "mimosa", direction: "VAMOS_ABDUZIR" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid payload");
  });

  it("LIKE cria Swipe + Abduction com status PLANNED (upsert)", async () => {
    mockAuth.mockResolvedValue(SESSION);
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
    mockAuth.mockResolvedValue(SESSION);
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

  it("PASS cria Swipe mas NÃO cria Abduction", async () => {
    mockAuth.mockResolvedValue(SESSION);
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
    mockAuth.mockResolvedValue(SESSION);
    const res = await POST(makePostRequest({ cowId: "mimosa", direction: "like" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });
});

describe("DELETE /api/swipes", () => {
  beforeEach(() => {
    mockAuth.mockReset();
    mockSwipeUpsert.mockReset();
    mockAbductionUpsert.mockReset();
    mockSwipeDeleteMany.mockReset();
    mockAbductionDeleteMany.mockReset();
    mockSwipeDeleteMany.mockResolvedValue({ count: 1 });
    mockAbductionDeleteMany.mockResolvedValue({ count: 1 });
  });

  it("retorna 401 quando não autenticado", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await DELETE(makeDeleteRequest("mimosa"));
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("retorna 400 quando cowId não fornecido", async () => {
    mockAuth.mockResolvedValue(SESSION);
    const res = await DELETE(makeDeleteRequest());
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("cowId obrigatório");
  });

  it("deleta a Abduction associada", async () => {
    mockAuth.mockResolvedValue(SESSION);
    await DELETE(makeDeleteRequest("mimosa"));
    expect(mockAbductionDeleteMany).toHaveBeenCalledWith({
      where: { alienId: "et-001", cowId: "mimosa" },
    });
  });

  it("deleta o Swipe existente", async () => {
    mockAuth.mockResolvedValue(SESSION);
    await DELETE(makeDeleteRequest("mimosa"));
    expect(mockSwipeDeleteMany).toHaveBeenCalledWith({
      where: { alienId: "et-001", cowId: "mimosa" },
    });
  });

  it("retorna 200 em caso de sucesso", async () => {
    mockAuth.mockResolvedValue(SESSION);
    const res = await DELETE(makeDeleteRequest("mimosa"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });
});
