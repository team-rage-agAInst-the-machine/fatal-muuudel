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

const { default: RegisterPage } = await import("@/app/register/page");

const step1Fields = {
  name: "Zork das Nebulosas",
  email: "zork@nebulosa.ufo",
  password: "senha123",
  callsign: "Cap Mugido",
  homePlanet: "Magrathea, Vulcano, Terra...",
  shipModel: "Millennium Falcon Mk. II",
};

async function fillStep1() {
  await userEvent.type(screen.getByPlaceholderText("Zork das Nebulosas"), step1Fields.name);
  await userEvent.type(screen.getByPlaceholderText("zork@nebulosa.ufo"), step1Fields.email);
  await userEvent.type(screen.getByPlaceholderText("••••••••"), step1Fields.password);
  await userEvent.type(screen.getByPlaceholderText("Capitão Mugido"), step1Fields.callsign);
  await userEvent.type(screen.getByPlaceholderText("Magrathea, Vulcano, Terra..."), step1Fields.homePlanet);
  await userEvent.type(screen.getByPlaceholderText("Millennium Falcon Mk. II"), step1Fields.shipModel);
}

async function advanceToStep2() {
  await fillStep1();
  await userEvent.click(screen.getByRole("button", { name: /próxima etapa/i }));
  await waitFor(() => expect(screen.getByText(/escaneando espécime/i)).toBeInTheDocument());
}

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

  it("renderiza os 6 campos da etapa 1", () => {
    render(<RegisterPage />);
    expect(screen.getByPlaceholderText("Zork das Nebulosas")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("zork@nebulosa.ufo")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Capitão Mugido")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Magrathea, Vulcano, Terra...")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Millennium Falcon Mk. II")).toBeInTheDocument();
  });

  it("renderiza o botão PRÓXIMA ETAPA", () => {
    render(<RegisterPage />);
    expect(screen.getByRole("button", { name: /próxima etapa/i })).toBeInTheDocument();
  });

  it("renderiza link para /login", () => {
    render(<RegisterPage />);
    expect(screen.getByRole("link", { name: /entrar na nave/i })).toHaveAttribute("href", "/login");
  });

  it("exibe erros de validação ao submeter etapa 1 vazia", async () => {
    render(<RegisterPage />);
    await userEvent.click(screen.getByRole("button", { name: /próxima etapa/i }));
    await waitFor(() => {
      expect(screen.getByText("Nome precisa ter pelo menos 2 caracteres")).toBeInTheDocument();
      expect(screen.getByText("Email inválido")).toBeInTheDocument();
      expect(screen.getByText("Senha precisa ter pelo menos 6 caracteres")).toBeInTheDocument();
    });
  });

  it("avança para etapa 2 com dados válidos", async () => {
    render(<RegisterPage />);
    await advanceToStep2();
    expect(screen.getByText(/escaneando espécime/i)).toBeInTheDocument();
  });
});

describe("RegisterPage — Etapa 2", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockSignIn.mockReset();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("renderiza campos biológicos e botões de confirmação", async () => {
    render(<RegisterPage />);
    await advanceToStep2();
    expect(screen.getByPlaceholderText(/vulcano, wookie/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /confirmar espécime/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /pular/i })).toBeInTheDocument();
  });

  it("faz fetch para /api/auth/register ao confirmar", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "1", email: step1Fields.email, callsign: step1Fields.callsign }),
    });
    vi.stubGlobal("fetch", mockFetch);
    mockSignIn.mockResolvedValue({ error: null });

    render(<RegisterPage />);
    await advanceToStep2();
    await userEvent.click(screen.getByRole("button", { name: /confirmar espécime/i }));

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
    await advanceToStep2();
    await userEvent.click(screen.getByRole("button", { name: /confirmar espécime/i }));

    await waitFor(() => expect(screen.getByText("Esse email já está na frota")).toBeInTheDocument());
  });

  it("exibe erro de callsign duplicado e volta para etapa 1", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "CALLSIGN_TAKEN" }),
    }));

    render(<RegisterPage />);
    await advanceToStep2();
    await userEvent.click(screen.getByRole("button", { name: /confirmar espécime/i }));

    await waitFor(() => expect(screen.getByText("Callsign já usado por outro ET")).toBeInTheDocument());
  });

  it("chama signIn após registro bem-sucedido", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "1", email: step1Fields.email, callsign: step1Fields.callsign }),
    }));
    mockSignIn.mockResolvedValue({ error: null });

    render(<RegisterPage />);
    await advanceToStep2();
    await userEvent.click(screen.getByRole("button", { name: /confirmar espécime/i }));

    await waitFor(() => expect(mockSignIn).toHaveBeenCalledWith("credentials", expect.objectContaining({ email: step1Fields.email })));
  });

  it("redireciona para /swipe após login bem-sucedido", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "1", email: step1Fields.email, callsign: step1Fields.callsign }),
    }));
    mockSignIn.mockResolvedValue({ error: null });

    render(<RegisterPage />);
    await advanceToStep2();
    await userEvent.click(screen.getByRole("button", { name: /confirmar espécime/i }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/swipe"));
  });

  it("PULAR também registra e redireciona", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "1", email: step1Fields.email, callsign: step1Fields.callsign }),
    }));
    mockSignIn.mockResolvedValue({ error: null });

    render(<RegisterPage />);
    await advanceToStep2();
    await userEvent.click(screen.getByRole("button", { name: /pular/i }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/swipe"));
  });
});
