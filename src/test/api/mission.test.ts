import { beforeEach, describe, expect, it, vi } from "vitest";

const mockMissionFindMany = vi.fn();
const mockMissionCount = vi.fn();
const mockMissionUpdateMany = vi.fn();
const mockMissionCreate = vi.fn();
const mockMissionUpdate = vi.fn();
const mockMissionFindUnique = vi.fn();
const mockMissionDelete = vi.fn();
const mockMissionFindFirst = vi.fn();
const mockTransaction = vi.fn();

const mockTxMissionConfig = {
  updateMany: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  findUnique: vi.fn(),
  delete: vi.fn(),
  findFirst: vi.fn(),
};

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: mockTransaction,
    missionConfig: {
      findMany: mockMissionFindMany,
      count: mockMissionCount,
      updateMany: mockMissionUpdateMany,
      create: mockMissionCreate,
      update: mockMissionUpdate,
      findUnique: mockMissionFindUnique,
      delete: mockMissionDelete,
      findFirst: mockMissionFindFirst,
    },
  },
}));

const { auth } = await import("@/auth");
const mockAutET = vi.mocked(auth);

const { POST, DELETE } = await import("@/app/api/mission/route");

const SESSAO_ET = { user: { id: "et-001", email: "zork@ufo.com" } };
const MISSAO_ATIVA = {
  id: "mission-ativa",
  name: "Operação Toalha",
  isActive: true,
  abductionStyle: null,
  objetivoDaMissao: null,
  temperamento: null,
  signoGalactico: null,
  mooPreference: 7,
  maxCargoKg: null,
  createdAt: new Date("2026-05-31T10:00:00Z"),
};

function makePostRequest(body: unknown) {
  return new Request("http://localhost/api/mission", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeDeleteRequest(id?: string) {
  const url = id ? `http://localhost/api/mission?id=${id}` : "http://localhost/api/mission";
  return new Request(url, { method: "DELETE" });
}

describe("POST /api/mission", () => {
  beforeEach(() => {
    mockAutET.mockReset();
    mockMissionFindMany.mockReset();
    mockMissionCount.mockReset();
    mockMissionUpdateMany.mockReset();
    mockMissionCreate.mockReset();
    mockMissionUpdate.mockReset();
    mockMissionFindUnique.mockReset();
    mockMissionDelete.mockReset();
    mockMissionFindFirst.mockReset();
    mockTransaction.mockReset();
    Object.values(mockTxMissionConfig).forEach((mock) => mock.mockReset());

    mockAutET.mockResolvedValue(SESSAO_ET);
    mockMissionCount.mockResolvedValue(1);
    mockMissionUpdateMany.mockResolvedValue({ count: 1 });
    mockMissionCreate.mockResolvedValue(MISSAO_ATIVA);
    mockTxMissionConfig.updateMany.mockResolvedValue({ count: 1 });
    mockTxMissionConfig.create.mockResolvedValue(MISSAO_ATIVA);
    mockTransaction.mockImplementation(async (fn) => fn({ missionConfig: mockTxMissionConfig }));
  });

  it("cria missão ativada dentro de uma transação com a desativação da anterior", async () => {
    const res = await POST(makePostRequest({
      name: "Operação Toalha",
      mooPreference: 7,
      activate: true,
    }));

    expect(res.status).toBe(201);
    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(mockTxMissionConfig.updateMany).toHaveBeenCalledWith({
      where: { alienId: "et-001", isActive: true },
      data: { isActive: false },
    });
    expect(mockTxMissionConfig.create).toHaveBeenCalledWith({
      data: {
        name: "Operação Toalha",
        mooPreference: 7,
        alienId: "et-001",
        isActive: true,
      },
      select: expect.any(Object),
    });
  });
});

describe("DELETE /api/mission", () => {
  beforeEach(() => {
    mockAutET.mockReset();
    mockMissionFindMany.mockReset();
    mockMissionCount.mockReset();
    mockMissionUpdateMany.mockReset();
    mockMissionCreate.mockReset();
    mockMissionUpdate.mockReset();
    mockMissionFindUnique.mockReset();
    mockMissionDelete.mockReset();
    mockMissionFindFirst.mockReset();
    mockTransaction.mockReset();
    Object.values(mockTxMissionConfig).forEach((mock) => mock.mockReset());

    mockAutET.mockResolvedValue(SESSAO_ET);
    mockMissionFindUnique.mockResolvedValue({ isActive: true });
    mockTxMissionConfig.delete.mockResolvedValue({});
    mockTxMissionConfig.findFirst.mockResolvedValue({ id: "mission-next" });
    mockTxMissionConfig.update.mockResolvedValue({ id: "mission-next", isActive: true });
    mockTransaction.mockImplementation(async (fn) => fn({ missionConfig: mockTxMissionConfig }));
  });

  it("remove missão ativa e promove a próxima dentro da mesma transação", async () => {
    const res = await DELETE(makeDeleteRequest("mission-old"));

    expect(res.status).toBe(200);
    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(mockTxMissionConfig.delete).toHaveBeenCalledWith({
      where: { id: "mission-old", alienId: "et-001" },
    });
    expect(mockTxMissionConfig.findFirst).toHaveBeenCalledWith({
      where: { alienId: "et-001" },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });
    expect(mockTxMissionConfig.update).toHaveBeenCalledWith({
      where: { id: "mission-next", alienId: "et-001" },
      data: { isActive: true },
    });
  });
});
