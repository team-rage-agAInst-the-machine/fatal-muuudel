import { describe, it, expect, vi, beforeEach } from "vitest";
import { Prisma } from "@/generated/prisma/client";

const mockCreate = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { create: mockCreate },
  },
}));

vi.mock("bcryptjs", () => ({
  default: { hash: vi.fn().mockResolvedValue("hashed_password") },
}));

const { POST } = await import("@/app/api/auth/register/route");

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makePrismaUniqueError(field: string) {
  const err = new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
    code: "P2002",
    clientVersion: "0.0.0",
    meta: { target: [field] },
  });
  return err;
}

const validBody = {
  name: "Zork",
  email: "zork@nebulosa.ufo",
  password: "senha123",
  callsign: "Cap Mugido",
  homePlanet: "Zargon-7",
  shipModel: "Disco Mk IV",
};

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    mockCreate.mockReset();
  });

  it("retorna 400 para email inválido", async () => {
    const res = await POST(makeRequest({ ...validBody, email: "nao-é-email" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Dados inválidos, capitão");
  });

  it("retorna 400 para senha curta", async () => {
    const res = await POST(makeRequest({ ...validBody, password: "123" }));
    expect(res.status).toBe(400);
  });

  it("retorna 400 para callsign ausente", async () => {
    const res = await POST(makeRequest({ ...validBody, callsign: "" }));
    expect(res.status).toBe(400);
  });

  it("retorna 400 para callsign muito longo", async () => {
    const res = await POST(makeRequest({ ...validBody, callsign: "a".repeat(21) }));
    expect(res.status).toBe(400);
  });

  it("retorna 409 EMAIL_TAKEN via constraint P2002 no email", async () => {
    mockCreate.mockRejectedValue(makePrismaUniqueError("email"));
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.error).toBe("EMAIL_TAKEN");
  });

  it("retorna 409 CALLSIGN_TAKEN via constraint P2002 no callsign", async () => {
    mockCreate.mockRejectedValue(makePrismaUniqueError("callsign"));
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.error).toBe("CALLSIGN_TAKEN");
  });

  it("retorna 201 com id, email e callsign em caso de sucesso", async () => {
    mockCreate.mockResolvedValue({ id: "abc123", email: validBody.email, callsign: validBody.callsign });
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data).toEqual({ id: "abc123", email: validBody.email, callsign: validBody.callsign });
  });

  it("chama prisma.user.create com senha hasheada", async () => {
    mockCreate.mockResolvedValue({ id: "abc123", email: validBody.email, callsign: validBody.callsign });
    await POST(makeRequest(validBody));
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ password: "hashed_password" }),
      })
    );
  });

  it("propaga erros desconhecidos do Prisma", async () => {
    mockCreate.mockRejectedValue(new Error("conexão perdida"));
    await expect(POST(makeRequest(validBody))).rejects.toThrow("conexão perdida");
  });
});
