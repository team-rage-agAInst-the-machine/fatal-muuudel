import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { mockUpdate, mockSend, mockWriteFile } = vi.hoisted(() => ({
  mockUpdate: vi.fn(),
  mockSend: vi.fn(),
  mockWriteFile: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: { user: { update: mockUpdate } } }));
vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: class {
    send = mockSend;
    constructor(_opts: unknown) {}
  },
  PutObjectCommand: class {
    constructor(public input: unknown) {}
  },
}));
vi.mock("fs/promises", () => {
  const m = { writeFile: mockWriteFile };
  return { default: m, ...m };
});

const { auth } = await import("@/auth");
const mockAuth = vi.mocked(auth);
const { POST } = await import("@/app/api/upload/route");

const SESSION = { user: { id: "et-001", email: "zork@ufo.com" } };
const MAX_SIZE = 5 * 1024 * 1024;

function makeFile(type = "image/jpeg", name = "photo.jpg") {
  return new File(["x"], name, { type });
}

function makeRequest(file: File) {
  const fd = new FormData();
  fd.append("file", file);
  return new Request("http://localhost/api/upload", { method: "POST", body: fd });
}

describe("POST /api/upload", () => {
  beforeEach(() => {
    mockAuth.mockReset();
    mockUpdate.mockReset();
    mockSend.mockReset();
    mockWriteFile.mockReset();
    mockWriteFile.mockResolvedValue(undefined);
    mockUpdate.mockResolvedValue({ id: "et-001" });
    delete process.env.AWS_S3_BUCKET;
    delete process.env.AWS_REGION;
    delete process.env.AWS_ACCESS_KEY_ID;
    delete process.env.AWS_SECRET_ACCESS_KEY;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("retorna 401 sem sessão", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await POST(makeRequest(makeFile()));
    expect(res.status).toBe(401);
    expect((await res.json()).error).toBe("Unauthorized");
  });

  it("retorna 400 quando nenhum arquivo enviado", async () => {
    mockAuth.mockResolvedValue(SESSION);
    const req = new Request("http://localhost/api/upload", { method: "POST", body: new FormData() });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/nenhum arquivo/i);
  });

  it("retorna 400 para MIME type inválido (PDF)", async () => {
    mockAuth.mockResolvedValue(SESSION);
    const res = await POST(makeRequest(makeFile("application/pdf", "doc.pdf")));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/tipo de arquivo não suportado/i);
  });

  it("retorna 400 para image/gif (não está nos tipos aceitos)", async () => {
    mockAuth.mockResolvedValue(SESSION);
    const res = await POST(makeRequest(makeFile("image/gif", "anim.gif")));
    expect(res.status).toBe(400);
  });

  it("retorna 400 quando arquivo é maior que 5MB (via file.size)", async () => {
    mockAuth.mockResolvedValue(SESSION);
    // jsdom não preserva conteúdo grande no ciclo FormData→Request→formData.
    // Injetamos um File-like com size acima do limite para testar a checagem da rota.
    const mockFile = { type: "image/jpeg", size: MAX_SIZE + 1 };
    const spy = vi.spyOn(Request.prototype, "formData").mockResolvedValueOnce({
      get: () => mockFile,
    } as unknown as FormData);
    try {
      const res = await POST(makeRequest(makeFile()));
      expect(res.status).toBe(400);
      expect((await res.json()).error).toMatch(/muito grande/i);
    } finally {
      spy.mockRestore();
    }
  });

  it("aceita JPEG, PNG e WebP", async () => {
    mockAuth.mockResolvedValue(SESSION);
    for (const [type, ext] of [["image/jpeg", "jpg"], ["image/png", "png"], ["image/webp", "webp"]]) {
      const res = await POST(makeRequest(makeFile(type, `photo.${ext}`)));
      expect(res.status).toBe(200);
    }
  });

  it("salva localmente em dev e atualiza User.image", async () => {
    mockAuth.mockResolvedValue(SESSION);

    const res = await POST(makeRequest(makeFile("image/jpeg")));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.url).toMatch(/^\/uploads\/.+\.jpg$/);
    expect(mockWriteFile).toHaveBeenCalledOnce();
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ image: data.url }) })
    );
  });

  it("deriva extensão do MIME type, não do nome do arquivo", async () => {
    mockAuth.mockResolvedValue(SESSION);
    const file = makeFile("image/png", "malicious.exe");
    const res = await POST(makeRequest(file));
    const data = await res.json();
    expect(data.url).toMatch(/\.png$/);
  });

  it("faz upload para S3 e atualiza User.image quando AWS_S3_BUCKET está configurado", async () => {
    mockAuth.mockResolvedValue(SESSION);
    mockSend.mockResolvedValue({});

    process.env.AWS_REGION = "us-east-1";
    process.env.AWS_S3_BUCKET = "fatal-muuudel";

    const res = await POST(makeRequest(makeFile()));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.url).toMatch(/amazonaws\.com/);
    expect(mockSend).toHaveBeenCalledOnce();
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ image: data.url }) })
    );
    expect(mockWriteFile).not.toHaveBeenCalled();
  });

  it("usa fallback local quando AWS_S3_BUCKET não está definido", async () => {
    mockAuth.mockResolvedValue(SESSION);
    // AWS_S3_BUCKET ausente → rota ignora S3 e salva localmente

    const res = await POST(makeRequest(makeFile()));
    expect(res.status).toBe(200);
    expect(mockSend).not.toHaveBeenCalled();
    expect(mockWriteFile).toHaveBeenCalledOnce();
  });
});
