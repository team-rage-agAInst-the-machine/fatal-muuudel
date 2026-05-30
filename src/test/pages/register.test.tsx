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

const validFields = {
  name: "Zork das Nebulosas",
  email: "zork@nebulosa.ufo",
  password: "senha123",
  callsign: "Cap Mugido",
  homePlanet: "Zargon-7",
  shipModel: "Disco Mk IV",
};

async function fillForm(overrides: Partial<typeof validFields> = {}) {
  const f = { ...validFields, ...overrides };
  if (f.name) await userEvent.type(screen.getByPlaceholderText("Zork das Nebulosas"), f.name);
  if (f.email) await userEvent.type(screen.getByPlaceholderText("zork@nebulosa.ufo"), f.email);
  if (f.password) await userEvent.type(screen.getByPlaceholderText("••••••••"), f.password);
  if (f.callsign) await userEvent.type(screen.getByPlaceholderText("Capitão Mugido"), f.callsign);
  if (f.homePlanet) await userEvent.type(screen.getByPlaceholderText("Zargon-7"), f.homePlanet);
  if (f.shipModel) await userEvent.type(screen.getByPlaceholderText("Disco Voador Mk. IV"), f.shipModel);
}

describe("RegisterPage", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockSignIn.mockReset();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("renderiza o título NOVA TRIPULAÇÃO", () => {
    render(<RegisterPage />);
    expect(screen.getByText("NOVA TRIPULAÇÃO")).toBeInTheDocument();
  });

  it("renderiza os 6 campos do formulário", () => {
    render(<RegisterPage />);
    expect(screen.getByPlaceholderText("Zork das Nebulosas")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("zork@nebulosa.ufo")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Capitão Mugido")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Zargon-7")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Disco Voador Mk. IV")).toBeInTheDocument();
  });

  it("renderiza o botão EMBARCAR NA FROTA", () => {
    render(<RegisterPage />);
    expect(screen.getByRole("button", { name: /embarcar na frota/i })).toBeInTheDocument();
  });

  it("renderiza link para /login", () => {
    render(<RegisterPage />);
    const link = screen.getByRole("link", { name: /entrar na nave/i });
    expect(link).toHaveAttribute("href", "/login");
  });

  it("exibe erros de validação client-side ao submeter vazio", async () => {
    render(<RegisterPage />);
    await userEvent.click(screen.getByRole("button", { name: /embarcar na frota/i }));
    await waitFor(() => {
      expect(screen.getByText("Nome precisa ter pelo menos 2 caracteres")).toBeInTheDocument();
      expect(screen.getByText("Email inválido")).toBeInTheDocument();
      expect(screen.getByText("Senha precisa ter pelo menos 6 caracteres")).toBeInTheDocument();
    });
  });

  it("faz fetch para /api/auth/register com dados válidos", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "1", email: validFields.email, callsign: validFields.callsign }),
    });
    vi.stubGlobal("fetch", mockFetch);
    mockSignIn.mockResolvedValue({ error: null });

    render(<RegisterPage />);
    await fillForm();
    await userEvent.click(screen.getByRole("button", { name: /embarcar na frota/i }));

    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/auth/register",
        expect.objectContaining({ method: "POST" })
      )
    );
  });

  it("exibe erro de email duplicado quando API retorna EMAIL_TAKEN", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "EMAIL_TAKEN" }),
    }));

    render(<RegisterPage />);
    await fillForm();
    await userEvent.click(screen.getByRole("button", { name: /embarcar na frota/i }));

    await waitFor(() =>
      expect(screen.getByText("Esse email já está na frota")).toBeInTheDocument()
    );
  });

  it("exibe erro de callsign duplicado quando API retorna CALLSIGN_TAKEN", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "CALLSIGN_TAKEN" }),
    }));

    render(<RegisterPage />);
    await fillForm();
    await userEvent.click(screen.getByRole("button", { name: /embarcar na frota/i }));

    await waitFor(() =>
      expect(screen.getByText("Callsign já usado por outro ET")).toBeInTheDocument()
    );
  });

  it("chama signIn automaticamente após registro bem-sucedido", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "1", email: validFields.email, callsign: validFields.callsign }),
    }));
    mockSignIn.mockResolvedValue({ error: null });

    render(<RegisterPage />);
    await fillForm();
    await userEvent.click(screen.getByRole("button", { name: /embarcar na frota/i }));

    await waitFor(() =>
      expect(mockSignIn).toHaveBeenCalledWith("credentials", {
        email: validFields.email,
        password: validFields.password,
        redirect: false,
      })
    );
  });

  it("redireciona para /swipe após registro e login bem-sucedidos", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "1", email: validFields.email, callsign: validFields.callsign }),
    }));
    mockSignIn.mockResolvedValue({ error: null });

    render(<RegisterPage />);
    await fillForm();
    await userEvent.click(screen.getByRole("button", { name: /embarcar na frota/i }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/swipe"));
  });
});
