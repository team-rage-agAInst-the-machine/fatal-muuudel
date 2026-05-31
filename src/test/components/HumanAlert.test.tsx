import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { HumanAlert } from "@/components/fatal/HumanAlert";

const mockCow = {
  id: "humano-001",
  name: "João da Silva",
  age: 35,
  breed: "Homo Sapiens",
  farm: "Fazenda Estranha",
  weightKg: 80,
  milkPct: 0,
  mooLevel: 1,
  distance: "0,5 anos-luz",
  hue: 30,
  tags: ["Suspeito"],
  bio: "Esse não é uma vaca.",
  photoUrl: null,
  isHuman: true,
};

describe("HumanAlert", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza o nome do humano intruso", () => {
    render(<HumanAlert cow={mockCow} onDismiss={vi.fn()} />);
    expect(screen.getByText(/João da Silva/)).toBeInTheDocument();
  });

  it("contém texto de alerta sobre não ser vaca", () => {
    render(<HumanAlert cow={mockCow} onDismiss={vi.fn()} />);
    expect(screen.getByText(/não é uma vaca/i)).toBeInTheDocument();
  });

  it("contém o título INTRUSO DETECTADO", () => {
    render(<HumanAlert cow={mockCow} onDismiss={vi.fn()} />);
    expect(screen.getByText("INTRUSO DETECTADO")).toBeInTheDocument();
  });

  it("contém uma dica do Guia do Mochileiro", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);

    render(<HumanAlert cow={mockCow} onDismiss={vi.fn()} />);

    expect(screen.getByText(/GUIA DO MOCHILEIRO/)).toBeInTheDocument();

    vi.restoreAllMocks();
  });

  it("exibe a entrada '42' quando Math.random retorna 0", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);

    render(<HumanAlert cow={mockCow} onDismiss={vi.fn()} />);

    expect(screen.getByText(/VERBETE: 42/)).toBeInTheDocument();

    vi.restoreAllMocks();
  });

  it("exibe a entrada TOALHA quando Math.random seleciona índice 2", () => {
    vi.spyOn(Math, "random").mockReturnValue(2 / 5);

    render(<HumanAlert cow={mockCow} onDismiss={vi.fn()} />);

    expect(screen.getByText(/TOALHA/)).toBeInTheDocument();

    vi.restoreAllMocks();
  });

  it("botão de dispensar chama onDismiss ao ser clicado", async () => {
    const onDismiss = vi.fn();
    render(<HumanAlert cow={mockCow} onDismiss={onDismiss} />);

    const btn = screen.getByRole("button", { name: /entendido/i });
    await userEvent.click(btn);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
