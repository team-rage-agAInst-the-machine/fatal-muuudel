import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// jsdom não tem scrollIntoView — precisamos mocká-lo
window.HTMLElement.prototype.scrollIntoView = vi.fn();

// Mock CowProfileModal to a sentinela testável
vi.mock("@/components/fatal/CowProfileModal", () => ({
  CowProfileModal: ({ cow, onClose }: { cow: { name: string }; onClose: () => void }) => (
    <div data-testid="cow-profile-modal">
      <span>Perfil de {cow.name}</span>
      <button onClick={onClose}>Fechar modal</button>
    </div>
  ),
}));

// Stub fetch global
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Stub localStorage — sem isso mensagens persistem entre testes
const mockLocalStorage = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
vi.stubGlobal("localStorage", mockLocalStorage);

const { ChatModal } = await import("@/components/fatal/ChatModal");

const mockCow = {
  id: "test-cow-001",
  name: "Mimosa",
  age: 4,
  breed: "Girolando",
  farm: "Fazenda Teste",
  weightKg: 512,
  milkPct: 94,
  mooLevel: 8,
  distance: "2,3 anos-luz",
  hue: 188,
  tags: ["Leiteira", "Dócil"],
  bio: "Bio de teste da vaca.",
  photoUrl: null,
  isHuman: false,
};

// Cria um mock de stream que retorna texto chunk a chunk
function makeStreamResponse(text: string) {
  const encoder = new TextEncoder();
  let done = false;
  return {
    ok: true,
    body: {
      getReader() {
        return {
          read(): Promise<{ done: boolean; value?: Uint8Array }> {
            if (done) return Promise.resolve({ done: true });
            done = true;
            return Promise.resolve({ done: false, value: encoder.encode(text) });
          },
        };
      },
    },
  };
}

describe("ChatModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it("renderiza header com nome da vaca", () => {
    render(<ChatModal cow={mockCow} vip={false} onClose={() => {}} />);
    // Header mostra nome da vaca
    expect(screen.getByText("Mimosa")).toBeInTheDocument();
  });

  it("renderiza raça e distância no subheader", () => {
    render(<ChatModal cow={mockCow} vip={false} onClose={() => {}} />);
    expect(screen.getByText(/Girolando/)).toBeInTheDocument();
    expect(screen.getByText(/2,3 anos-luz/)).toBeInTheDocument();
  });

  it("renderiza estado vazio com 'Canal interestelar aberto'", () => {
    render(<ChatModal cow={mockCow} vip={false} onClose={() => {}} />);
    expect(screen.getByText(/Canal interestelar aberto com Mimosa/)).toBeInTheDocument();
  });

  it("digitar e submeter form adiciona bolha do alien com o texto", async () => {
    // Fetch nunca resolve (para não avançar para resposta da vaca)
    mockFetch.mockReturnValueOnce(new Promise(() => {}));

    render(<ChatModal cow={mockCow} vip={false} onClose={() => {}} />);

    const input = screen.getByPlaceholderText(/fala pro gado/i);
    await userEvent.type(input, "Oi Mimosa!");
    await userEvent.click(screen.getByRole("button", { name: /enviar/i }));

    // Bolha do alien deve aparecer com texto em maiúsculas e em parênteses
    await waitFor(() => {
      expect(screen.getByText("OI MIMOSA!")).toBeInTheDocument();
    });
  });

  it("mostra indicador 'está mugindo...' durante loading", async () => {
    // Fetch nunca resolve — estado fica no typing=true
    mockFetch.mockReturnValueOnce(new Promise(() => {}));

    render(<ChatModal cow={mockCow} vip={false} onClose={() => {}} />);

    const input = screen.getByPlaceholderText(/fala pro gado/i);
    await userEvent.type(input, "Teste de loading");
    await userEvent.click(screen.getByRole("button", { name: /enviar/i }));

    await waitFor(() => {
      expect(screen.getByText(/Mimosa está mugindo/i)).toBeInTheDocument();
    });
  });

  it("bolha da vaca aparece após resposta, com mugido e tradução separados", async () => {
    const cowReply = "Muu mu mumu! (Oi capitão, que bom!)";
    mockFetch.mockReturnValueOnce(makeStreamResponse(cowReply));

    render(<ChatModal cow={mockCow} vip={false} onClose={() => {}} />);

    const input = screen.getByPlaceholderText(/fala pro gado/i);
    await userEvent.type(input, "Olá Mimosa!");
    await userEvent.click(screen.getByRole("button", { name: /enviar/i }));

    // Parte do mugido (sem a tradução)
    await waitFor(() => {
      expect(screen.getByText("Muu mu mumu!")).toBeInTheDocument();
    });

    // Tradução entre parênteses
    expect(screen.getByText("(Oi capitão, que bom!)")).toBeInTheDocument();
  });

  it("botão de presente 🌽 dispara mensagem 'Mandei 🌽 milho pra você!'", async () => {
    mockFetch.mockReturnValueOnce(new Promise(() => {}));

    render(<ChatModal cow={mockCow} vip={false} onClose={() => {}} />);

    await userEvent.click(screen.getByRole("button", { name: /milho/i }));

    await waitFor(() => {
      // Bolha alien mostra em maiúsculas
      expect(screen.getByText("MANDEI 🌽 MILHO PRA VOCÊ!")).toBeInTheDocument();
    });
  });

  it("botão de presente 🧂 dispara mensagem 'Mandei 🧂 sal mineral pra você!'", async () => {
    mockFetch.mockReturnValueOnce(new Promise(() => {}));

    render(<ChatModal cow={mockCow} vip={false} onClose={() => {}} />);

    await userEvent.click(screen.getByRole("button", { name: /sal/i }));

    await waitFor(() => {
      // Bolha alien mostra em maiúsculas
      expect(screen.getByText("MANDEI 🧂 SAL MINERAL PRA VOCÊ!")).toBeInTheDocument();
    });
  });

  it("clique no header abre overlay de perfil da vaca", async () => {
    render(<ChatModal cow={mockCow} vip={false} onClose={() => {}} />);

    const headerBtn = screen.getByRole("button", { name: /ver perfil da vaca/i });
    await userEvent.click(headerBtn);

    await waitFor(() => {
      expect(screen.getByTestId("cow-profile-modal")).toBeInTheDocument();
    });
    expect(screen.getByText(/Perfil de Mimosa/)).toBeInTheDocument();
  });

  it("botão voltar chama onClose sem abrir o perfil", async () => {
    const onClose = vi.fn();
    render(<ChatModal cow={mockCow} vip={false} onClose={onClose} />);

    await userEvent.click(screen.getByRole("button", { name: /voltar/i }));

    expect(onClose).toHaveBeenCalledOnce();
    expect(screen.queryByTestId("cow-profile-modal")).not.toBeInTheDocument();
  });

  it("exibe mensagem de erro quando fetch falha", async () => {
    mockFetch.mockRejectedValueOnce(new Error("falha de rede"));

    render(<ChatModal cow={mockCow} vip={false} onClose={() => {}} />);

    const input = screen.getByPlaceholderText(/fala pro gado/i);
    await userEvent.type(input, "Teste de erro!");
    await userEvent.click(screen.getByRole("button", { name: /enviar/i }));

    await waitFor(() => {
      expect(screen.getByText(/nave com defeito/i)).toBeInTheDocument();
    });
  });
});
