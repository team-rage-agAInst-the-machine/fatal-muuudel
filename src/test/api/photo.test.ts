import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSend = vi.fn();
const mockCowFindUnique = vi.fn();
const mockCowUpdate = vi.fn();

vi.mock("@/lib/s3", () => ({
  s3: { send: mockSend },
  S3_BUCKET: "fatal-muuudel",
  buildPublicUrl: (key: string) => `http://localhost:4566/fatal-muuudel/${key}`,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    cow: { findUnique: mockCowFindUnique, update: mockCowUpdate },
  },
}));

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

import { auth } from "@/auth";
const mockAuth = vi.mocked(auth);

const { POST } = await import("@/app/api/cows/[id]/photo/route");

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

function makeFormDataRequest(file?: File) {
  const formData = new FormData();
  if (file) formData.append("file", file);
  const req = new Request("http://localhost/api/cows/mimosa/photo", {
    method: "POST",
  });
  // jsdom doesn't fully serialize File objects in multipart FormData bodies,
  // so we patch formData() directly on the request instance.
  Object.defineProperty(req, "formData", { value: () => Promise.resolve(formData) });
  return req;
}

function makeImageFile(name = "vaca.jpg", type = "image/jpeg", sizeBytes = 1024) {
  const content = new Uint8Array(sizeBytes);
  return new File([content], name, { type });
}

describe("POST /api/cows/[id]/photo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSend.mockResolvedValue({});
    mockCowUpdate.mockResolvedValue({});
  });

  it("retorna 401 quando não autenticado", async () => {
    mockAuth.mockResolvedValue(null as never);
    const res = await POST(makeFormDataRequest(makeImageFile()), makeParams("mimosa"));
    expect(res.status).toBe(401);
  });

  it("retorna 404 quando vaca não existe", async () => {
    mockAuth.mockResolvedValue({ user: { id: "alien-1" } } as never);
    mockCowFindUnique.mockResolvedValue(null);
    const res = await POST(makeFormDataRequest(makeImageFile()), makeParams("nao-existe"));
    expect(res.status).toBe(404);
  });

  it("retorna 400 sem campo file", async () => {
    mockAuth.mockResolvedValue({ user: { id: "alien-1" } } as never);
    mockCowFindUnique.mockResolvedValue({ id: "mimosa" });
    const res = await POST(makeFormDataRequest(), makeParams("mimosa"));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("file");
  });

  it("retorna 400 para tipo não-imagem", async () => {
    mockAuth.mockResolvedValue({ user: { id: "alien-1" } } as never);
    mockCowFindUnique.mockResolvedValue({ id: "mimosa" });
    const file = makeImageFile("script.sh", "application/x-sh");
    const res = await POST(makeFormDataRequest(file), makeParams("mimosa"));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/imagens/i);
  });

  it("retorna 400 para arquivo maior que 5 MB", async () => {
    mockAuth.mockResolvedValue({ user: { id: "alien-1" } } as never);
    mockCowFindUnique.mockResolvedValue({ id: "mimosa" });
    const file = makeImageFile("big.jpg", "image/jpeg", 6 * 1024 * 1024);
    const res = await POST(makeFormDataRequest(file), makeParams("mimosa"));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/5 MB/);
  });

  it("retorna 200 com photoUrl em caso de sucesso", async () => {
    mockAuth.mockResolvedValue({ user: { id: "alien-1" } } as never);
    mockCowFindUnique.mockResolvedValue({ id: "mimosa" });
    const res = await POST(makeFormDataRequest(makeImageFile()), makeParams("mimosa"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.photoUrl).toMatch(/^http:\/\/localhost:4566\/fatal-muuudel\/cows\/mimosa\//);
  });

  it("chama prisma.cow.update com a photoUrl correta", async () => {
    mockAuth.mockResolvedValue({ user: { id: "alien-1" } } as never);
    mockCowFindUnique.mockResolvedValue({ id: "mimosa" });
    await POST(makeFormDataRequest(makeImageFile()), makeParams("mimosa"));
    expect(mockCowUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "mimosa" },
        data: expect.objectContaining({ photoUrl: expect.stringContaining("mimosa") }),
      })
    );
  });

  it("chama s3.send com o bucket e key corretos", async () => {
    mockAuth.mockResolvedValue({ user: { id: "alien-1" } } as never);
    mockCowFindUnique.mockResolvedValue({ id: "mimosa" });
    await POST(makeFormDataRequest(makeImageFile()), makeParams("mimosa"));
    expect(mockSend).toHaveBeenCalledTimes(1);
    const cmd = mockSend.mock.calls[0][0];
    expect(cmd.input.Bucket).toBe("fatal-muuudel");
    expect(cmd.input.Key).toMatch(/^cows\/mimosa\//);
    expect(cmd.input.ContentType).toBe("image/jpeg");
  });
});
