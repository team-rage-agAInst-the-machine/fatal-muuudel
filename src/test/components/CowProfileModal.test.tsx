import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { CowProfileModal } = await import("@/components/fatal/CowProfileModal");

const mockCow = {
  id: "vaca-001",
  name: "Mimosa",
  age: 4,
  breed: "Girolando",
  farm: "Fazenda Esperança",
  weightKg: 512,
  milkPct: 94,
  mooLevel: 8,
  distance: "2,3 anos-luz",
  hue: 188,
  tags: ["Leiteira", "Dócil", "Premiada"],
  bio: "Uma vaca exemplar do sertão brasileiro.",
  photoUrl: null,
  isHuman: false,
};

describe("CowProfileModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza o nome da vaca", () => {
    render(<CowProfileModal cow={mockCow} vip={false} onClose={vi.fn()} />);
    const names = screen.getAllByText("Mimosa");
    expect(names.length).toBeGreaterThanOrEqual(1);
  });

  it("renderiza a raça da vaca", () => {
    render(<CowProfileModal cow={mockCow} vip={false} onClose={vi.fn()} />);
    expect(screen.getByText(/Girolando/)).toBeInTheDocument();
  });

  it("renderiza a fazenda da vaca", () => {
    render(<CowProfileModal cow={mockCow} vip={false} onClose={vi.fn()} />);
    expect(screen.getByText(/Fazenda Esperança/)).toBeInTheDocument();
  });

  it("renderiza a distância da vaca", () => {
    render(<CowProfileModal cow={mockCow} vip={false} onClose={vi.fn()} />);
    expect(screen.getByText(/2,3 anos-luz/)).toBeInTheDocument();
  });

  it("renderiza a bio da vaca", () => {
    render(<CowProfileModal cow={mockCow} vip={false} onClose={vi.fn()} />);
    expect(
      screen.getByText("Uma vaca exemplar do sertão brasileiro.")
    ).toBeInTheDocument();
  });

  it("renderiza as tags da vaca", () => {
    render(<CowProfileModal cow={mockCow} vip={false} onClose={vi.fn()} />);
    expect(screen.getByText("Leiteira")).toBeInTheDocument();
    expect(screen.getByText("Dócil")).toBeInTheDocument();
    expect(screen.getByText("Premiada")).toBeInTheDocument();
  });

  it("botão FECHAR chama onClose quando onChat não é fornecido", async () => {
    const onClose = vi.fn();
    render(<CowProfileModal cow={mockCow} vip={false} onClose={onClose} />);

    const btn = screen.getByRole("button", { name: /fechar/i });
    await userEvent.click(btn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("botão COMUNICAR chama onChat quando disponível", async () => {
    const onChat = vi.fn();
    render(
      <CowProfileModal
        cow={mockCow}
        vip={false}
        onClose={vi.fn()}
        onChat={onChat}
      />
    );

    const btn = screen.getByRole("button", { name: /comunicar/i });
    await userEvent.click(btn);
    expect(onChat).toHaveBeenCalledTimes(1);
  });

  it("badge VIP visível quando vip=true", () => {
    render(<CowProfileModal cow={mockCow} vip={true} onClose={vi.fn()} />);
    expect(screen.getByText("VIP")).toBeInTheDocument();
  });

  it("badge mostra ABDUZIDA quando vip=false", () => {
    render(<CowProfileModal cow={mockCow} vip={false} onClose={vi.fn()} />);
    expect(screen.getByText("ABDUZIDA")).toBeInTheDocument();
  });
});
