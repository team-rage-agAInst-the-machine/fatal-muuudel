import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const { TowelAlert } = await import("@/components/fatal/TowelAlert");

describe("TowelAlert", () => {
  it("não renderiza quando open=false", () => {
    render(<TowelAlert open={false} onClose={vi.fn()} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renderiza quando open=true", () => {
    render(<TowelAlert open={true} onClose={vi.fn()} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("exibe NÃO ENTRE EM PÂNICO", () => {
    render(<TowelAlert open={true} onClose={vi.fn()} />);
    expect(screen.getByText("NÃO ENTRE EM PÂNICO")).toBeInTheDocument();
  });

  it("exibe o protectionLevel quando fornecido", () => {
    render(<TowelAlert open={true} protectionLevel="DIVINA" onClose={vi.fn()} />);
    expect(screen.getByText("DIVINA")).toBeInTheDocument();
  });

  it("botão VOLTAR AO PASTO chama onClose", () => {
    const onClose = vi.fn();
    render(<TowelAlert open={true} onClose={onClose} />);
    fireEvent.click(screen.getByText("VOLTAR AO PASTO"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("botão DEFINIR STATUS DA TOALHA chama onClose e navega para /profile", () => {
    const onClose = vi.fn();
    render(<TowelAlert open={true} onClose={onClose} />);
    fireEvent.click(screen.getByText("DEFINIR STATUS DA TOALHA"));
    expect(onClose).toHaveBeenCalledOnce();
    expect(mockPush).toHaveBeenCalledWith("/profile");
  });
});
