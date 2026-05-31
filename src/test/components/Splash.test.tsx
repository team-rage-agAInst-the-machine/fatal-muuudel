import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/components/fatal/Saucer", () => ({ Saucer: () => null }));

const { Splash } = await import("@/components/fatal/Splash");
const { FM_COPY } = await import("@/components/fatal/data");

describe("Splash", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza o título do app (Fatal Muuudel)", () => {
    render(<Splash copy={FM_COPY} onEnter={vi.fn()} />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent(/fatal muuudel/i);
  });

  it("renderiza a tagline do app", () => {
    render(<Splash copy={FM_COPY} onEnter={vi.fn()} />);
    expect(screen.getByText(FM_COPY.slogan)).toBeInTheDocument();
  });

  it("botão de entrar chama onEnter ao ser clicado", async () => {
    const onEnter = vi.fn();
    render(<Splash copy={FM_COPY} onEnter={onEnter} />);

    const btn = screen.getByRole("button", { name: /entrar na nave/i });
    await userEvent.click(btn);
    expect(onEnter).toHaveBeenCalledTimes(1);
  });

  it("renderiza o texto do botão a partir do copy", () => {
    render(<Splash copy={FM_COPY} onEnter={vi.fn()} />);
    expect(screen.getByRole("button", { name: FM_COPY.enter })).toBeInTheDocument();
  });
});
