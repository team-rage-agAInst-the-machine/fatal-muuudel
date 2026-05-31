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

const JPEG_MAGIC = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01])
const PNG_MAGIC = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d])
const WEBP_MAGIC = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50])

function makeFile(type = "image/jpeg", name = "photo.jpg", content: Uint8Array | string = JPEG_MAGIC) {
  return new File([content], name, { type });
}

/**
 * jsdom's Request.formData() hangs when the body contains a File with binary content.
 * We stub formData() on the request instance to bypass this jsdom limitation.
 */
function makeRequest(file: File | null): Request {
  const req = new Request("http://localhost/api/upload", { method: "POST", body: new FormData() });
  vi.spyOn(req, "formData").mockResolvedValue({
    get: () => file,
  } as unknown as FormData);
  return req;
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
    const res = await POST(makeRequest(null));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/nenhum arquivo/i);
  });

  it("retorna 400 para MIME type inválido (PDF)", async () => {
    mockAuth.mockResolvedValue(SESSION);
    const res = await POST(makeRequest(new File(["x"], "doc.pdf", { type: "application/pdf" })));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/tipo de arquivo não suportado/i);
  });

  it("retorna 400 para image/gif (não está nos tipos aceitos)", async () => {
    mockAuth.mockResolvedValue(SESSION);
    const res = await POST(makeRequest(new File(["x"], "anim.gif", { type: "image/gif" })));
    expect(res.status).toBe(400);
  });

  it("retorna 400 quando arquivo é maior que 5MB (via file.size)", async () => {
    mockAuth.mockResolvedValue(SESSION);
    const mockFile = { type: "image/jpeg", size: MAX_SIZE + 1 } as File;
    const res = await POST(makeRequest(mockFile));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/muito grande/i);
  });

  it("aceita JPEG, PNG e WebP", async () => {
    mockAuth.mockResolvedValue(SESSION);
    const cases = [
      ["image/jpeg", "jpg", JPEG_MAGIC],
      ["image/png", "png", PNG_MAGIC],
      ["image/webp", "webp", WEBP_MAGIC],
    ] as const;
    for (const [type, ext, magic] of cases) {
      const res = await POST(makeRequest(makeFile(type, `photo.${ext}`, magic)));
      expect(res.status).toBe(200);
    }
  });

  it("salva localmente em dev e atualiza User.image", async () => {
    mockAuth.mockResolvedValue(SESSION);

    const res = await POST(makeRequest(makeFile("image/jpeg", "photo.jpg", JPEG_MAGIC)));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.url).toMatch(/^\/uploads\/.+\.jpg$/);
    expect(mockWriteFile).toHaveBeenCalledOnce();
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ image: data.url }) })
    );
  });

  it("deriva extensão dos magic bytes, não do MIME declarado", async () => {
    mockAuth.mockResolvedValue(SESSION);
    // Arquivo com magic bytes JPEG mas MIME declarado como PNG
    // detectImageType detecta JPEG → ext deve ser .jpg
    const file = makeFile("image/png", "malicious.exe", JPEG_MAGIC);
    const res = await POST(makeRequest(file));
    const data = await res.json();
    expect(data.url).toMatch(/\.jpg$/);
  });

  it("faz upload para S3 e atualiza User.image quando AWS_S3_BUCKET está configurado", async () => {
    mockAuth.mockResolvedValue(SESSION);
    mockSend.mockResolvedValue({});

    process.env.AWS_REGION = "us-east-1";
    process.env.AWS_S3_BUCKET = "fatal-muuudel";

    const res = await POST(makeRequest(makeFile("image/jpeg", "photo.jpg", JPEG_MAGIC)));
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

    const res = await POST(makeRequest(makeFile("image/jpeg", "photo.jpg", JPEG_MAGIC)));
    expect(res.status).toBe(200);
    expect(mockSend).not.toHaveBeenCalled();
    expect(mockWriteFile).toHaveBeenCalledOnce();
  });

  it("retorna 400 quando magic bytes não correspondem (MIME spoofing com conteúdo PDF)", async () => {
    mockAuth.mockResolvedValue(SESSION);
    // Magic bytes de PDF (0x25 0x50 0x44 0x46 = %PDF) com MIME jpeg → detectImageType retorna null
    const evilFile = makeFile("image/jpeg", "evil.jpg", new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]));
    const res = await POST(makeRequest(evilFile));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/não reconhecido como imagem válida/i);
  });

  it("ContentType enviado ao S3 usa tipo detectado pelos magic bytes, não o MIME do cliente", async () => {
    mockAuth.mockResolvedValue(SESSION);
    mockSend.mockResolvedValue({});

    process.env.AWS_REGION = "us-east-1";
    process.env.AWS_S3_BUCKET = "fatal-muuudel";

    // Magic bytes JPEG mas MIME declarado como PNG
    const file = makeFile("image/png", "photo.png", JPEG_MAGIC);
    const res = await POST(makeRequest(file));
    expect(res.status).toBe(200);

    const callArg = mockSend.mock.calls[0][0];
    expect(callArg.input.ContentType).toBe("image/jpeg");
  });

  it("retorna 503 em produção sem AWS_S3_BUCKET", async () => {
    mockAuth.mockResolvedValue(SESSION);
    vi.stubEnv("NODE_ENV", "production");
    delete process.env.AWS_S3_BUCKET;

    const res = await POST(makeRequest(makeFile("image/jpeg", "photo.jpg", JPEG_MAGIC)));
    expect(res.status).toBe(503);
    expect((await res.json()).error).toMatch(/storage não configurado/i);
  });
});
