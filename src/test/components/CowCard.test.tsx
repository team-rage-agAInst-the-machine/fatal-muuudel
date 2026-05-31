import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Cow, Copy } from "@/components/fatal/data";
import { FM_COPY } from "@/components/fatal/data";

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

const { CowCard } = await import("@/components/fatal/CowCard");

const baseCow: Cow = {
  id: "mimosa",
  name: "Mimosa",
  age: 4,
  breed: "Girolando",
  farm: "Fazenda Boa Vista",
  weightKg: 512,
  milkPct: 94,
  mooLevel: 8,
  distance: "2,3 anos-luz",
  hue: 188,
  tags: ["Capim premium"],
  bio: "Topo abdução de primeira.",
};

const copy: Copy = FM_COPY;

describe("CowCard", () => {
  it("renderiza o nome da vaca", () => {
    render(<CowCard cow={baseCow} copy={copy} />);
    expect(screen.getByText("Mimosa")).toBeInTheDocument();
  });

  it("renderiza placeholder quando photoUrl é null", () => {
    render(<CowCard cow={{ ...baseCow, photoUrl: null }} copy={copy} />);
    expect(screen.getByText("🐄")).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "Mimosa" })).not.toBeInTheDocument();
  });

  it("renderiza placeholder quando photoUrl é undefined", () => {
    render(<CowCard cow={{ ...baseCow, photoUrl: undefined }} copy={copy} />);
    expect(screen.getByText("🐄")).toBeInTheDocument();
  });

  it("renderiza imagem real quando photoUrl está preenchido", () => {
    const photoUrl = "http://localhost:4566/fatal-muuudel/cows/mimosa/photo.jpg";
    render(<CowCard cow={{ ...baseCow, photoUrl }} copy={copy} />);
    const img = screen.getByRole("img", { name: "Mimosa" });
    expect(img).toHaveAttribute("src", photoUrl);
    expect(screen.queryByText("🐄")).not.toBeInTheDocument();
  });

  it("renderiza tags da vaca", () => {
    render(<CowCard cow={baseCow} copy={copy} />);
    expect(screen.getByText("Capim premium")).toBeInTheDocument();
  });

  it("renderiza badge de matchScore >= 80 com texto '🛸 85%'", () => {
    render(<CowCard cow={{ ...baseCow, matchScore: 85 }} copy={copy} />);
    expect(screen.getByText("🛸 85%")).toBeInTheDocument();
  });

  it("badge de matchScore 60-79 está presente", () => {
    render(<CowCard cow={{ ...baseCow, matchScore: 72 }} copy={copy} />);
    expect(screen.getByText("🛸 72%")).toBeInTheDocument();
  });

  it("não renderiza badge de matchScore quando ausente", () => {
    render(<CowCard cow={baseCow} copy={copy} />);
    expect(screen.queryByText(/🛸 \d+%/)).not.toBeInTheDocument();
  });

  it("renderiza badge SAGRADA com ícone de cadeado", () => {
    render(<CowCard cow={{ ...baseCow, protectionLevel: "SAGRADA" }} copy={copy} />);
    expect(screen.getByText("🔒 Sagrada")).toBeInTheDocument();
  });

  it("renderiza badge DIVINA com ícone especial", () => {
    render(<CowCard cow={{ ...baseCow, protectionLevel: "DIVINA" }} copy={copy} />);
    expect(screen.getByText("✨🔒 Divina")).toBeInTheDocument();
  });

  it("não renderiza badge de proteção para CAMPESTRE", () => {
    render(<CowCard cow={{ ...baseCow, protectionLevel: "CAMPESTRE" }} copy={copy} />);
    expect(screen.queryByText(/Sagrada|Divina|Livre/)).not.toBeInTheDocument();
  });

  it("renderiza badge EXTRAVIADA com cadeado aberto", () => {
    render(<CowCard cow={{ ...baseCow, protectionLevel: "EXTRAVIADA" }} copy={copy} />);
    expect(screen.getByText("🔓 Livre")).toBeInTheDocument();
  });
});
