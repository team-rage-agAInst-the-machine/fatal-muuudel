"use client";

import { useRouter } from "next/navigation";
import { randomQuote } from "@/lib/hitchhiker";
import { useMemo } from "react";

interface TowelAlertProps {
  open: boolean;
  protectionLevel?: string;
  onClose: () => void;
}

const TOWEL_QUOTES = [
  "O Guia do Mochileiro das Galáxias dedica 17 páginas à toalha. Apenas 2 à abdução bovina. A proporção não é acidente.",
  "Um ET sem toalha tentando abduzir uma vaca de nível SAGRADA é, segundo o Guia, 'o ato mais otimista e mal calculado do universo conhecido'.",
  "A toalha serve para se enrolar quando está com frio, deitar quando está com calor, usar como vela improvisada numa emergência hiperespacial, e — criticamente — para mostrar que você sabe o que está fazendo. Você claramente não sabe.",
  "Capítulo 42 do Guia: 'Vacas de proteção DIVINA não são abduzidas por ETs sem toalha. Isso não é preconceito. É física.'",
  "Zaphod Beeblebrox tentou abduzir uma vaca SAGRADA sem toalha uma vez. O resultado foi classificado como 'inacreditavelmente imprudente, mesmo para ele'.",
  "Se você souber onde sua toalha está, você está no controle.",
];

export function TowelAlert({ open, protectionLevel, onClose }: TowelAlertProps) {
  const router = useRouter();
  const quote = useMemo(() => TOWEL_QUOTES[Math.floor(Math.random() * TOWEL_QUOTES.length)], [open]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null;

  function handleGoToProfile() {
    onClose();
    router.push("/profile");
  }

  return (
    <div className="fm-towel-overlay" role="dialog" aria-modal="true" aria-label="Alerta de toalha">
      <div className="fm-towel-modal">
        <div className="fm-towel-header">
          <span className="fm-towel-panic">NÃO ENTRE EM PÂNICO</span>
          <span className="fm-towel-icon">🚿</span>
        </div>

        <div className="fm-towel-body">
          <p className="fm-towel-title">
            PROTOCOLO DE SEGURANÇA INTERGALÁCTICA
          </p>

          <p className="fm-towel-level">
            Esta vaca possui proteção cósmica nível{" "}
            <strong className="fm-glow-magenta">{protectionLevel ?? "PROTEGIDA"}</strong>.
          </p>

          <blockquote className="fm-towel-quote">
            "{quote}"
          </blockquote>

          <p className="fm-towel-conclusion">
            Você claramente não sabe onde está sua toalha.
          </p>
        </div>

        <div className="fm-towel-actions">
          <button className="fm-btn fm-btn-cta" onClick={handleGoToProfile}>
            DEFINIR STATUS DA TOALHA
          </button>
          <button className="fm-btn fm-btn-ghost" onClick={onClose}>
            VOLTAR AO PASTO
          </button>
        </div>

        <p className="fm-towel-footer">
          — O Guia do Mochileiro das Galáxias, 15ª edição revisada
        </p>
      </div>
    </div>
  );
}
