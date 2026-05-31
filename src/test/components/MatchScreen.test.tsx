import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("@/components/fatal/CowCard", () => ({ CowCard: () => null }));
vi.mock("@/components/fatal/Saucer", () => ({ Saucer: () => null }));
vi.mock("@/components/fatal/Starfield", () => ({ Starfield: () => null }));

import { MatchScreen } from "@/components/fatal/MatchScreen";
import { FM_COPY } from "@/components/fatal/data";

const mockCow = {
  id: "test-cow",
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
  bio: "Uma vaca de personalidade.",
  photoUrl: null,
  isHuman: false,
};

describe("MatchScreen", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renderiza nome e raça da vaca após animação (phase 3)", () => {
    render(
      <MatchScreen
        cow={mockCow}
        copy={FM_COPY}
        isVip={false}
        onContinue={vi.fn()}
      />
    );

    expect(screen.getByText("Mimosa")).toBeInTheDocument();
    expect(screen.getByText(/girolando/i)).toBeInTheDocument();
  });

  it("botão matchCta chama onContinue ao ser clicado", () => {
    const onContinue = vi.fn();
    render(
      <MatchScreen
        cow={mockCow}
        copy={FM_COPY}
        isVip={false}
        onContinue={onContinue}
      />
    );

    const btn = screen.getByRole("button", { name: FM_COPY.matchCta });
    fireEvent.click(btn);
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it("badge VIP (ABDUÇÃO VIP) aparece quando isVip=true", () => {
    render(
      <MatchScreen
        cow={mockCow}
        copy={FM_COPY}
        isVip={true}
        onContinue={vi.fn()}
      />
    );

    expect(screen.getByText(new RegExp(FM_COPY.superLike))).toBeInTheDocument();
  });

  it("badge VIP não aparece quando isVip=false", () => {
    render(
      <MatchScreen
        cow={mockCow}
        copy={FM_COPY}
        isVip={false}
        onContinue={vi.fn()}
      />
    );

    expect(screen.queryByText(new RegExp(FM_COPY.superLike))).toBeNull();
  });
});
