import { describe, it, expect, vi, beforeEach } from "vitest";

const mockUpdate = vi.fn();

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: { user: { update: mockUpdate } } }));

const { auth } = await import("@/auth");
const mockAuth = vi.mocked(auth);

const { PATCH } = await import("@/app/api/profile/route");

const SESSION = { user: { id: "et-001", email: "zork@ufo.com" } };

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("PATCH /api/profile", () => {
  beforeEach(() => {
    mockAuth.mockReset();
    mockUpdate.mockReset();
  });

  it("retorna 401 sem sessão", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await PATCH(makeRequest({ callsign: "Zork" }));
    expect(res.status).toBe(401);
  });

  it("retorna 400 para callsign muito curto", async () => {
    mockAuth.mockResolvedValue(SESSION);
    const res = await PATCH(makeRequest({ callsign: "X" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Dados inválidos");
  });

  it("retorna 400 para callsign muito longo (> 30 chars)", async () => {
    mockAuth.mockResolvedValue(SESSION);
    const res = await PATCH(makeRequest({ callsign: "A".repeat(31) }));
    expect(res.status).toBe(400);
  });

  it("atualiza callsign, homePlanet e shipModel", async () => {
    mockAuth.mockResolvedValue(SESSION);
    const updated = {
      id: "et-001",
      image: null,
      callsign: "Capitão Mugido",
      homePlanet: "Zargon-7",
      shipModel: "Disco Mk IV",
    };
    mockUpdate.mockResolvedValue(updated);

    const res = await PATCH(
      makeRequest({ callsign: "Capitão Mugido", homePlanet: "Zargon-7", shipModel: "Disco Mk IV" })
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.user.callsign).toBe("Capitão Mugido");
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "et-001" },
        data: { callsign: "Capitão Mugido", homePlanet: "Zargon-7", shipModel: "Disco Mk IV" },
      })
    );
  });

  it("ignora campo image — não pode ser atualizado via PATCH", async () => {
    mockAuth.mockResolvedValue(SESSION);
    mockUpdate.mockResolvedValue({ id: "et-001", image: null, callsign: "Zork" });

    const res = await PATCH(
      makeRequest({ callsign: "Zork", image: "https://site-malicioso.com/malware.jpg" })
    );
    expect(res.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.not.objectContaining({ image: expect.anything() }),
      })
    );
  });

  it("rejeita payload vazio com 400", async () => {
    mockAuth.mockResolvedValue(SESSION);

    const res = await PATCH(makeRequest({}));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("Nenhum campo para atualizar");
  });

  it("retorna 400 para homePlanet muito longo (> 50 chars)", async () => {
    mockAuth.mockResolvedValue(SESSION);
    const res = await PATCH(makeRequest({ homePlanet: "P".repeat(51) }));
    expect(res.status).toBe(400);
  });
});
