import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/components/ui/avatar", () => ({
  Avatar: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div data-testid="avatar" {...props}>{children}</div>
  ),
  AvatarImage: ({ src, alt }: { src?: string; alt: string }) =>
    src ? <img src={src} alt={alt} /> : null,
  AvatarFallback: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="avatar-fallback">{children}</span>
  ),
}));

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

const { ProfileScreen } = await import("@/components/fatal/ProfileScreen");

const BASE_USER = {
  id: "et-001",
  name: "Zork",
  image: null,
  callsign: "Cap Mugido",
  homePlanet: "Zargon-7",
  shipModel: "Disco Mk IV",
};

describe("ProfileScreen", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("exibe as iniciais do callsign quando não há imagem", () => {
    render(<ProfileScreen user={BASE_USER} />);
    expect(screen.getByTestId("avatar-fallback")).toHaveTextContent("CA");
  });

  it("usa as iniciais do name quando callsign está ausente", () => {
    render(<ProfileScreen user={{ ...BASE_USER, callsign: null }} />);
    expect(screen.getByTestId("avatar-fallback")).toHaveTextContent("ZO");
  });

  it("usa ET como fallback quando name e callsign são nulos", () => {
    render(<ProfileScreen user={{ ...BASE_USER, name: null, callsign: null }} />);
    expect(screen.getByTestId("avatar-fallback")).toHaveTextContent("ET");
  });

  it("exibe a imagem do avatar quando image está definida", () => {
    render(<ProfileScreen user={{ ...BASE_USER, image: "/uploads/foto.jpg" }} />);
    expect(screen.getByRole("img")).toHaveAttribute("src", "/uploads/foto.jpg");
  });

  it("renderiza os campos do perfil ET", () => {
    render(<ProfileScreen user={BASE_USER} />);
    expect(screen.getByText("Cap Mugido")).toBeInTheDocument();
    expect(screen.getByText("Zargon-7")).toBeInTheDocument();
    expect(screen.getByText("Disco Mk IV")).toBeInTheDocument();
  });

  it("exibe — para campos nulos", () => {
    render(<ProfileScreen user={{ ...BASE_USER, homePlanet: null, shipModel: null }} />);
    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBeGreaterThanOrEqual(2);
  });

  it("exibe botão TROCAR FOTO", () => {
    render(<ProfileScreen user={BASE_USER} />);
    expect(screen.getByRole("button", { name: /trocar foto/i })).toBeInTheDocument();
  });

  it("mostra TRANSMITINDO... durante o upload e restaura após", async () => {
    let resolveUpload!: (v: Response) => void;
    mockFetch.mockReturnValueOnce(
      new Promise((res) => { resolveUpload = res; })
    );

    render(<ProfileScreen user={BASE_USER} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["data"], "foto.jpg", { type: "image/jpeg" });

    await userEvent.upload(input, file);
    expect(screen.getByRole("button", { name: /transmitindo/i })).toBeDisabled();

    resolveUpload(new Response(JSON.stringify({ url: "/uploads/nova.jpg" }), { status: 200 }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /trocar foto/i })).not.toBeDisabled()
    );
  });

  it("atualiza o avatar após upload bem-sucedido", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ url: "/uploads/nova.jpg" }), { status: 200 })
    );

    render(<ProfileScreen user={BASE_USER} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, new File(["data"], "foto.jpg", { type: "image/jpeg" }));

    await waitFor(() => expect(screen.getByRole("img")).toHaveAttribute("src", "/uploads/nova.jpg"));
  });

  it("exibe erro temático quando upload retorna status != 200", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Arquivo maior que 5MB. Comprime aí, capitão." }), { status: 413 })
    );

    render(<ProfileScreen user={BASE_USER} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, new File(["data"], "foto.jpg", { type: "image/jpeg" }));

    await waitFor(() =>
      expect(screen.getByText(/comprime aí, capitão/i)).toBeInTheDocument()
    );
  });

  it("exibe erro de comunicação quando fetch lança exceção", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(<ProfileScreen user={BASE_USER} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, new File(["data"], "foto.jpg", { type: "image/jpeg" }));

    await waitFor(() =>
      expect(screen.getByText(/falha de comunicação intergaláctica/i)).toBeInTheDocument()
    );
  });

  it("botão fica habilitado após erro no upload", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(<ProfileScreen user={BASE_USER} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, new File(["data"], "foto.jpg", { type: "image/jpeg" }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /trocar foto/i })).not.toBeDisabled()
    );
  });
});
