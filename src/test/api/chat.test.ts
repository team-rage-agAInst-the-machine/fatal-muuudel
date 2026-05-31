import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Hoisted mocks for GoogleGenerativeAI
const { mockGenerateContentStream, mockGetGenerativeModel } = vi.hoisted(() => {
  const mockGenerateContentStream = vi.fn();
  const mockGetGenerativeModel = vi.fn(() => ({
    generateContentStream: mockGenerateContentStream,
  }));
  return { mockGenerateContentStream, mockGetGenerativeModel };
});

vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: class MockGoogleGenerativeAI {
    constructor(public apiKey: string) {}
    getGenerativeModel = mockGetGenerativeModel;
  },
}));

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn() },
  },
}));

const { auth } = await import("@/auth");
const mockAuth = vi.mocked(auth);

const { POST } = await import("@/app/api/chat/translate/route");

const VALID_BODY = {
  message: "Oi vaquinha!",
  cowName: "Mimosa",
  cowBio: "Bio da vaca.",
  cowBreed: "Girolando",
  cowMooLevel: 8,
};

const MOCK_REPLIES = [
  "Muu mu mumu muuu... (Oi capitão! Que bom que você apareceu, tava com saudade do pasto 😔)",
  "Mooo muu mu! Moo muu muuu! (Recebi seu sinal sim! Aqui no porão tá gelado mas tô bem!)",
  "Muuu... mu moo muu mumu! (Capitão, quando você vai me levar visitar o planeta de vocês?)",
  "Moo muu! Mu muu mooooo! (Esse disco voador é incrível! A minha fazenda não tinha nada assim!)",
  "Muuu mu moo... muu? (Tem capim aí? Esse negócio sintético da nave não tem sabor nenhum...)",
  "Mooo muu mumu mu muuu! (Você é o melhor ET que já me abduziu, capitão! Pode me abduzir de novo!)",
  "Muu? Mu moo muu moooo! (Isso que você falou... eu não entendi muito mas MUUU de coração!)",
  "Muuu mu moo muu! (Tô aqui ruminando e pensando na vida... 5 estrelas pra essa abdução!)",
  "Moo muu! Muuu mu mumu moo! (Sabe o que eu mais gosto daqui? As estrelas! Nunca via isso do pasto!)",
  "Muuu moo mu muu... moooo! (Mandei abraço de volta pra você! Cuida do disco voador tá? 🛸)",
];

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/chat/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function readResponseText(res: Response): Promise<string> {
  if (res.body) {
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let result = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      result += decoder.decode(value, { stream: true });
    }
    return result;
  }
  return res.text();
}

describe("POST /api/chat/translate", () => {
  beforeEach(() => {
    mockAuth.mockReset();
    mockGetGenerativeModel.mockClear();
    mockGenerateContentStream.mockReset();
    delete process.env.GOOGLE_AI_API_KEY;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("retorna 400 com message vazia", async () => {
    const res = await POST(makeRequest({ ...VALID_BODY, message: "" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Dados inválidos");
  });

  it("retorna 400 sem cowName", async () => {
    const { cowName: _cn, ...bodyWithoutCowName } = VALID_BODY;
    const res = await POST(makeRequest(bodyWithoutCowName));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Dados inválidos");
  });

  it("retorna 400 com message ausente", async () => {
    const { message: _m, ...bodyWithoutMessage } = VALID_BODY;
    const res = await POST(makeRequest(bodyWithoutMessage));
    expect(res.status).toBe(400);
  });

  it("retorna 400 com cowMooLevel fora do intervalo (> 10)", async () => {
    const res = await POST(makeRequest({ ...VALID_BODY, cowMooLevel: 11 }));
    expect(res.status).toBe(400);
  });

  it("sem GOOGLE_AI_API_KEY: retorna text/plain com uma resposta mock", async () => {
    // GOOGLE_AI_API_KEY não definido
    const res = await POST(makeRequest(VALID_BODY));

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toMatch(/text\/plain/);

    const text = await readResponseText(res);
    expect(MOCK_REPLIES).toContain(text);
  });

  it("sem GOOGLE_AI_API_KEY: não chama GoogleGenerativeAI", async () => {
    await POST(makeRequest(VALID_BODY));
    // getGenerativeModel nunca é chamado quando não há API key
    expect(mockGetGenerativeModel).not.toHaveBeenCalled();
  });

  it("com GOOGLE_AI_API_KEY: chama GoogleGenerativeAI e retorna stream", async () => {
    process.env.GOOGLE_AI_API_KEY = "fake-api-key";
    mockAuth.mockResolvedValue(null);

    async function* fakeStream() {
      yield { text: () => "Muu mu" };
      yield { text: () => " (Oi capitão!)" };
    }

    mockGenerateContentStream.mockResolvedValue({ stream: fakeStream() });

    const res = await POST(makeRequest(VALID_BODY));

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toMatch(/text\/plain/);

    const text = await readResponseText(res);
    expect(text).toBe("Muu mu (Oi capitão!)");
    // Verifica que getGenerativeModel foi chamado (proxy do GoogleGenerativeAI instanciado)
    expect(mockGetGenerativeModel).toHaveBeenCalled();
    expect(mockGenerateContentStream).toHaveBeenCalledWith("Oi vaquinha!");
  });

  it("com GOOGLE_AI_API_KEY: retorna mock quando Gemini lança exceção", async () => {
    process.env.GOOGLE_AI_API_KEY = "fake-api-key";
    mockAuth.mockResolvedValue(null);

    mockGenerateContentStream.mockRejectedValue(new Error("Gemini indisponível"));

    const res = await POST(makeRequest(VALID_BODY));

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toMatch(/text\/plain/);

    const text = await readResponseText(res);
    expect(MOCK_REPLIES).toContain(text);
  });

  it("body malformado (JSON inválido): requisição rejeita com erro (req.json() não está protegido)", async () => {
    // A rota não tem try/catch em torno de req.json(), então um JSON malformado
    // faz o handler rejeitar em vez de retornar 400.
    const req = new Request("http://localhost/api/chat/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{ malformed json !!!",
    });
    await expect(POST(req)).rejects.toThrow();
  });
});
