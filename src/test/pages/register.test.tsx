import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockPush = vi.fn();
const mockSignIn = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mockPush }) }));
vi.mock("next-auth/react", () => ({ signIn: mockSignIn }));
vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}));
vi.mock("@/components/fatal/Saucer", () => ({ Saucer: () => null }));
vi.mock("@/components/fatal/Starfield", () => ({ Starfield: () => null }));
vi.mock("@/components/fatal/HitchhikerQuote", () => ({ HitchhikerQuote: () => null }));
vi.mock("@/lib/hitchhiker", () => ({ randomQuote: () => "" }));

const { default: RegisterPage } = await import("@/app/register/page");

const STEP1 = {
  name: "Zork das Nebulosas",
  email: "zork@nebulosa.ufo",
  password: "senha123",
  callsign: "Cap Mugido",
};

const mockFetchOk = () =>
  vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ id: "1", email: STEP1.email, callsign: STEP1.callsign }),
  });

async function fillStep1() {
  await userEvent.type(screen.getByPlaceholderText("Zork das Nebulosas"), STEP1.name);
  await userEvent.type(screen.getByPlaceholderText("zork@nebulosa.ufo"), STEP1.email);
  await userEvent.type(screen.getByPlaceholderText("••••••••"), STEP1.password);
  await userEvent.type(screen.getByPlaceholderText("Capitão Mugido"), STEP1.callsign);
}

async function advanceToStep2() {
  await fillStep1();
  await userEvent.click(screen.getByRole("button", { name: /próxima/i }));
  await waitFor(() => expect(screen.getByText("COORDENADAS DE ORIGEM")).toBeInTheDocument());
}

async function advanceToStep3() {
  await advanceToStep2();
  await userEvent.click(screen.getByRole("button", { name: /próxima/i }));
  await waitFor(() => expect(screen.getByText("DADOS BIOLÓGICOS")).toBeInTheDocument());
}

async function advanceToStep4() {
  await advanceToStep3();
  await userEvent.click(screen.getByRole("button", { name: /próxima/i }));
  await waitFor(() => expect(screen.getByText("AFILIAÇÃO GALÁCTICA")).toBeInTheDocument());
}

// ── Etapa 1 ───────────────────────────────────────────────────────────────────

describe("RegisterPage — Etapa 1", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockSignIn.mockReset();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("renderiza o título NOVA TRIPULAÇÃO", () => {
    render(<RegisterPage />);
    expect(screen.getByText("NOVA TRIPULAÇÃO")).toBeInTheDocument();
  });

  it("renderiza os 4 campos obrigatórios", () => {
    render(<RegisterPage />);
    expect(screen.getByPlaceholderText("Zork das Nebulosas")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("zork@nebulosa.ufo")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Capitão Mugido")).toBeInTheDocument();
  });

  it("renderiza botão PRÓXIMA", () => {
    render(<RegisterPage />);
    expect(screen.getByRole("button", { name: /próxima/i })).toBeInTheDocument();
  });

  it("renderiza link para /login", () => {
    render(<RegisterPage />);
    expect(screen.getByRole("link", { name: /entrar na nave/i })).toHaveAttribute("href", "/login");
  });

  it("exibe erros de validação ao submeter etapa 1 vazia", async () => {
    render(<RegisterPage />);
    await userEvent.click(screen.getByRole("button", { name: /próxima/i }));
    await waitFor(() => {
      expect(screen.getByText("Nome precisa ter pelo menos 2 caracteres")).toBeInTheDocument();
      expect(screen.getByText("Email inválido")).toBeInTheDocument();
      expect(screen.getByText("Senha precisa ter pelo menos 6 caracteres")).toBeInTheDocument();
    });
  });

  it("avança para etapa 2 com dados válidos", async () => {
    render(<RegisterPage />);
    await advanceToStep2();
    expect(screen.getByText("COORDENADAS DE ORIGEM")).toBeInTheDocument();
  });
});

// ── Etapa 2 ───────────────────────────────────────────────────────────────────

describe("RegisterPage — Etapa 2", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockSignIn.mockReset();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("renderiza campos planeta natal e modelo da nave", async () => {
    render(<RegisterPage />);
    await advanceToStep2();
    expect(screen.getAllByPlaceholderText(/comece a digitar/i).length).toBeGreaterThanOrEqual(2);
  });

  it("renderiza botões VOLTAR e PRÓXIMA", async () => {
    render(<RegisterPage />);
    await advanceToStep2();
    expect(screen.getByRole("button", { name: /voltar/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /próxima/i })).toBeInTheDocument();
  });

  it("volta para etapa 1 ao clicar VOLTAR", async () => {
    render(<RegisterPage />);
    await advanceToStep2();
    await userEvent.click(screen.getByRole("button", { name: /voltar/i }));
    await waitFor(() => expect(screen.getByText("NOVA TRIPULAÇÃO")).toBeInTheDocument());
  });

  it("avança para etapa 3 ao clicar PRÓXIMA", async () => {
    render(<RegisterPage />);
    await advanceToStep3();
    expect(screen.getByText("DADOS BIOLÓGICOS")).toBeInTheDocument();
  });
});

// ── Etapa 3 ───────────────────────────────────────────────────────────────────

describe("RegisterPage — Etapa 3", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockSignIn.mockReset();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("renderiza campos biológicos", async () => {
    render(<RegisterPage />);
    await advanceToStep3();
    expect(screen.getByPlaceholderText(/vulcano, wookie/i)).toBeInTheDocument();
  });

  it("volta para etapa 2 ao clicar VOLTAR", async () => {
    render(<RegisterPage />);
    await advanceToStep3();
    await userEvent.click(screen.getByRole("button", { name: /voltar/i }));
    await waitFor(() => expect(screen.getByText("COORDENADAS DE ORIGEM")).toBeInTheDocument());
  });

  it("avança para etapa 4 ao clicar PRÓXIMA", async () => {
    render(<RegisterPage />);
    await advanceToStep4();
    expect(screen.getByText("AFILIAÇÃO GALÁCTICA")).toBeInTheDocument();
  });
});

// ── Etapa 4 ───────────────────────────────────────────────────────────────────

describe("RegisterPage — Etapa 4", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockSignIn.mockReset();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("renderiza botões VOLTAR e CONFIRMAR", async () => {
    render(<RegisterPage />);
    await advanceToStep4();
    expect(screen.getByRole("button", { name: /voltar/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /confirmar/i })).toBeInTheDocument();
  });

  it("volta para etapa 3 ao clicar VOLTAR", async () => {
    render(<RegisterPage />);
    await advanceToStep4();
    await userEvent.click(screen.getByRole("button", { name: /voltar/i }));
    await waitFor(() => expect(screen.getByText("DADOS BIOLÓGICOS")).toBeInTheDocument());
  });

  it("faz fetch para /api/auth/register ao confirmar", async () => {
    const mockFetch = mockFetchOk();
    vi.stubGlobal("fetch", mockFetch);
    mockSignIn.mockResolvedValue({ error: null });

    render(<RegisterPage />);
    await advanceToStep4();
    await userEvent.click(screen.getByRole("button", { name: /confirmar/i }));

    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/auth/register",
        expect.objectContaining({ method: "POST" })
      )
    );
  });

  it("exibe erro de email duplicado e volta para etapa 1", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "EMAIL_TAKEN" }),
    }));

    render(<RegisterPage />);
    await advanceToStep4();
    await userEvent.click(screen.getByRole("button", { name: /confirmar/i }));

    await waitFor(() => expect(screen.getByText("Esse email já está na frota")).toBeInTheDocument());
  });

  it("exibe erro de callsign duplicado e volta para etapa 1", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "CALLSIGN_TAKEN" }),
    }));

    render(<RegisterPage />);
    await advanceToStep4();
    await userEvent.click(screen.getByRole("button", { name: /confirmar/i }));

    await waitFor(() => expect(screen.getByText("Callsign já usado por outro ET")).toBeInTheDocument());
  });

  it("chama signIn após registro bem-sucedido", async () => {
    vi.stubGlobal("fetch", mockFetchOk());
    mockSignIn.mockResolvedValue({ error: null });

    render(<RegisterPage />);
    await advanceToStep4();
    await userEvent.click(screen.getByRole("button", { name: /confirmar/i }));

    await waitFor(() =>
      expect(mockSignIn).toHaveBeenCalledWith("credentials", expect.objectContaining({ email: STEP1.email }))
    );
  });

  it("redireciona para /swipe após login bem-sucedido", async () => {
    vi.stubGlobal("fetch", mockFetchOk());
    mockSignIn.mockResolvedValue({ error: null });

    render(<RegisterPage />);
    await advanceToStep4();
    await userEvent.click(screen.getByRole("button", { name: /confirmar/i }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/swipe"));
  });
});
