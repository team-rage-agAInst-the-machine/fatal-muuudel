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

const { default: LoginPage } = await import("@/app/login/page");

describe("LoginPage", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockSignIn.mockReset();
  });

  it("renderiza o título FATAL MUUUDEL", () => {
    render(<LoginPage />);
    expect(screen.getByText("FATAL MUUUDEL")).toBeInTheDocument();
  });

  it("renderiza os campos de email e senha", () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText("capitao@galaxia.ufo")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
  });

  it("renderiza o botão ENTRAR NA NAVE", () => {
    render(<LoginPage />);
    expect(screen.getByRole("button", { name: /entrar na nave/i })).toBeInTheDocument();
  });

  it("renderiza link para /register", () => {
    render(<LoginPage />);
    const link = screen.getByRole("link", { name: /embarcar na frota/i });
    expect(link).toHaveAttribute("href", "/register");
  });

  it("exibe erro de validação para email inválido", async () => {
    render(<LoginPage />);
    await userEvent.click(screen.getByRole("button", { name: /entrar na nave/i }));
    await waitFor(() => expect(screen.getByText("Email inválido")).toBeInTheDocument());
  });

  it("exibe erro de validação para senha curta", async () => {
    render(<LoginPage />);
    await userEvent.type(screen.getByPlaceholderText("capitao@galaxia.ufo"), "zork@ufo.com");
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "123");
    await userEvent.click(screen.getByRole("button", { name: /entrar na nave/i }));
    await waitFor(() =>
      expect(screen.getByText("Senha precisa ter pelo menos 6 caracteres")).toBeInTheDocument()
    );
  });

  it("chama signIn com email e senha ao submeter form válido", async () => {
    mockSignIn.mockResolvedValue({ error: null });
    render(<LoginPage />);
    await userEvent.type(screen.getByPlaceholderText("capitao@galaxia.ufo"), "zork@ufo.com");
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "senha123");
    await userEvent.click(screen.getByRole("button", { name: /entrar na nave/i }));
    await waitFor(() =>
      expect(mockSignIn).toHaveBeenCalledWith("credentials", {
        email: "zork@ufo.com",
        password: "senha123",
        redirect: false,
      })
    );
  });

  it("exibe erro temático quando signIn retorna erro", async () => {
    mockSignIn.mockResolvedValue({ error: "CredentialsSignin" });
    render(<LoginPage />);
    await userEvent.type(screen.getByPlaceholderText("capitao@galaxia.ufo"), "zork@ufo.com");
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "senhaerrada");
    await userEvent.click(screen.getByRole("button", { name: /entrar na nave/i }));
    await waitFor(() =>
      expect(screen.getByText(/nave com defeito/i)).toBeInTheDocument()
    );
  });

  it("redireciona para /swipe após login bem-sucedido", async () => {
    mockSignIn.mockResolvedValue({ error: null });
    render(<LoginPage />);
    await userEvent.type(screen.getByPlaceholderText("capitao@galaxia.ufo"), "zork@ufo.com");
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "senha123");
    await userEvent.click(screen.getByRole("button", { name: /entrar na nave/i }));
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/swipe"));
  });
});
