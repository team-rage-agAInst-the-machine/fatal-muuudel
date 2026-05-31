import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element
    const { fill: _fill, unoptimized: _unoptimized, ...rest } = props;
    return <img {...(rest as React.ImgHTMLAttributes<HTMLImageElement>)} />;
  },
}));

import { AbductedList } from "@/components/fatal/AbductedList";
import { FM_COPY } from "@/components/fatal/data";
import type { Cow } from "@/components/fatal/data";
import type { Abducted } from "@/components/fatal/AbductedList";

const mockCow: Cow = {
  id: "cow-1",
  name: "Mimosa",
  age: 4,
  breed: "Girolando",
  farm: "Fazenda Intergaláctica",
  weightKg: 512,
  milkPct: 94,
  mooLevel: 8,
  distance: "2,3 anos-luz",
  hue: 188,
  tags: ["Leiteira", "Gordinha"],
  bio: "A melhor vaca do universo.",
  photoUrl: "https://example.com/mimosa.jpg",
  isHuman: false,
};

const mockCow2: Cow = {
  ...mockCow,
  id: "cow-2",
  name: "Beladona",
  breed: "Nelore",
};

function makeAbducted(overrides: Partial<Abducted> = {}): Abducted {
  return { cow: mockCow, vip: false, ...overrides };
}

describe("AbductedList", () => {
  const onBack = vi.fn();
  const onProfile = vi.fn();
  const onChat = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza mensagem de lista vazia quando abducted=[]", () => {
    render(
      <AbductedList
        abducted={[]}
        copy={FM_COPY}
        onBack={onBack}
        onProfile={onProfile}
        onChat={onChat}
      />
    );
    expect(screen.getByText(FM_COPY.listEmpty)).toBeInTheDocument();
    expect(screen.getByText(FM_COPY.emptyTitle)).toBeInTheDocument();
  });

  it("renderiza cards com nome e raça das vacas", () => {
    const abducted: Abducted[] = [
      makeAbducted({ cow: mockCow }),
      makeAbducted({ cow: mockCow2 }),
    ];
    render(
      <AbductedList
        abducted={abducted}
        copy={FM_COPY}
        onBack={onBack}
        onProfile={onProfile}
        onChat={onChat}
      />
    );
    expect(screen.getByText("Mimosa")).toBeInTheDocument();
    expect(screen.getByText("Girolando")).toBeInTheDocument();
    expect(screen.getByText("Beladona")).toBeInTheDocument();
    expect(screen.getByText("Nelore")).toBeInTheDocument();
  });

  it("badge VIP visível em abduções com vip: true", () => {
    const abducted: Abducted[] = [
      makeAbducted({ cow: mockCow, vip: true }),
      makeAbducted({ cow: mockCow2, vip: false }),
    ];
    render(
      <AbductedList
        abducted={abducted}
        copy={FM_COPY}
        onBack={onBack}
        onProfile={onProfile}
        onChat={onChat}
      />
    );
    expect(screen.getByText("VIP")).toBeInTheDocument();
    expect(screen.getByText("ABDUZIDA")).toBeInTheDocument();
  });

  it("clique no card chama onProfile(cow, vip)", async () => {
    const abducted: Abducted[] = [makeAbducted({ cow: mockCow, vip: true })];
    render(
      <AbductedList
        abducted={abducted}
        copy={FM_COPY}
        onBack={onBack}
        onProfile={onProfile}
        onChat={onChat}
      />
    );
    await userEvent.click(screen.getByText("Mimosa"));
    expect(onProfile).toHaveBeenCalledWith(mockCow, true);
    expect(onProfile).toHaveBeenCalledTimes(1);
  });

  it("botão COMUNICAR chama onChat(cow, vip) sem chamar onProfile (stopPropagation)", async () => {
    const abducted: Abducted[] = [makeAbducted({ cow: mockCow, vip: false })];
    render(
      <AbductedList
        abducted={abducted}
        copy={FM_COPY}
        onBack={onBack}
        onProfile={onProfile}
        onChat={onChat}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: /comunicar/i }));
    expect(onChat).toHaveBeenCalledWith(mockCow, false);
    expect(onProfile).not.toHaveBeenCalled();
  });

  it("botão VOLTAR chama onBack", async () => {
    render(
      <AbductedList
        abducted={[]}
        copy={FM_COPY}
        onBack={onBack}
        onProfile={onProfile}
        onChat={onChat}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: /voltar/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
