import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Cow, Copy } from "@/components/fatal/data";

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}));

const { SwipeDeck } = await import("@/components/fatal/SwipeDeck");

const makeCow = (id: string, name: string): Cow => ({
  id,
  name,
  age: 4,
  breed: "Girolando",
  farm: "Fazenda Teste",
  weightKg: 512,
  milkPct: 94,
  mooLevel: 8,
  distance: "2,3 anos-luz",
  hue: 188,
  tags: ["Tag 1"],
  bio: "Bio de teste.",
  photoUrl: null,
  isHuman: false,
});

const mockCows: Cow[] = [
  makeCow("vaca-1", "Mimosa"),
  makeCow("vaca-2", "Rosinha"),
  makeCow("vaca-3", "Branquinha"),
  makeCow("vaca-4", "Moreninha"),
];

const mockCopy: Copy = {
  nome: "Fatal Muuudel",
  slogan: "O pasto inteiro na palma do raio trator",
  enter: "ENTRAR NA NAVE",
  swipeTitle: "Escolhe a vaca, capitão",
  nope: "DEIXA PASTAR",
  like: "ABDUZIR",
  superNope: "ANO-LUZ DE DISTÂNCIA",
  superLike: "ABDUÇÃO VIP",
  matchTitle: "ABDUÇÃO INICIADA",
  matchSub: "Liga o raio trator que essa vaca é nossa!",
  matchCta: "PRÓXIMA VÍTIMA",
  emptyTitle: "Pasto vazio, parceiro",
  emptySub: "Já abduziu tudo que era bom.",
  listTitle: "MINHAS VACAS ABDUZIDAS",
  listEmpty: "Nenhuma vaca no porão da nave ainda.",
  again: "ABDUZIR DE NOVO",
};

describe("SwipeDeck", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza o card da vaca no topo", () => {
    const onDecide = vi.fn();
    render(
      <SwipeDeck cows={mockCows} current={0} copy={mockCopy} onDecide={onDecide} />
    );
    // A vaca no topo (índice 0) deve estar visível
    expect(screen.getAllByText("Mimosa")[0]).toBeInTheDocument();
  });

  it("renderiza até 3 cards empilhados", () => {
    const onDecide = vi.fn();
    render(
      <SwipeDeck cows={mockCows} current={0} copy={mockCopy} onDecide={onDecide} />
    );
    // Com 4 vacas e current=0, apenas os 3 primeiros são renderizados no deck
    expect(screen.getByText("Mimosa")).toBeInTheDocument();
    expect(screen.getByText("Rosinha")).toBeInTheDocument();
    expect(screen.getByText("Branquinha")).toBeInTheDocument();
    expect(screen.queryByText("Moreninha")).not.toBeInTheDocument();
  });

  it("botão PASS/nope chama onDecide com 'nope'", async () => {
    const onDecide = vi.fn();
    render(
      <SwipeDeck cows={mockCows} current={0} copy={mockCopy} onDecide={onDecide} />
    );
    const nopeButton = screen.getByRole("button", { name: /deixa pastar/i });
    await userEvent.click(nopeButton);
    // flyOut usa setTimeout de 360ms antes de chamar onDecide
    await waitFor(() => expect(onDecide).toHaveBeenCalled(), { timeout: 1000 });
    expect(onDecide).toHaveBeenCalledWith(mockCows[0], "nope");
  });

  it("botão LIKE chama onDecide com 'like'", async () => {
    const onDecide = vi.fn();
    render(
      <SwipeDeck cows={mockCows} current={0} copy={mockCopy} onDecide={onDecide} />
    );
    const likeButton = screen.getByRole("button", { name: /abduzir/i });
    await userEvent.click(likeButton);
    // flyOut usa setTimeout de 360ms antes de chamar onDecide
    await waitFor(() => expect(onDecide).toHaveBeenCalled(), { timeout: 1000 });
    expect(onDecide).toHaveBeenCalledWith(mockCows[0], "like");
  });
});
