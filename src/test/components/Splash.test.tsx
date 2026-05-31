import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/components/fatal/Saucer", () => ({ Saucer: () => null }));

import { Splash } from "@/components/fatal/Splash";
import { FM_COPY } from "@/components/fatal/data";

describe("Splash", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza o título do app (Fatal Muuudel)", () => {
    render(<Splash copy={FM_COPY} onEnter={vi.fn()} />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent(new RegExp(FM_COPY.nome, "i"));
  });

  it("renderiza a tagline do app", () => {
    render(<Splash copy={FM_COPY} onEnter={vi.fn()} />);
    expect(screen.getByText(FM_COPY.slogan)).toBeInTheDocument();
  });

  it("botão de entrar chama onEnter ao ser clicado", async () => {
    const onEnter = vi.fn();
    render(<Splash copy={FM_COPY} onEnter={onEnter} />);

    const btn = screen.getByRole("button", { name: FM_COPY.enter });
    await userEvent.click(btn);
    expect(onEnter).toHaveBeenCalledTimes(1);
  });

  it("renderiza o texto do botão a partir do copy", () => {
    render(<Splash copy={FM_COPY} onEnter={vi.fn()} />);
    expect(screen.getByRole("button", { name: FM_COPY.enter })).toBeInTheDocument();
  });
});
