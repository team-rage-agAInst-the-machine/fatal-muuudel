"use client";

import type { Cow } from "./data";

const TIPS = [
  {
    entry: "42",
    text: "A Resposta para a Grande Questão da Vida, do Universo e de Tudo. Abduzir humanos definitivamente não é a pergunta certa.",
  },
  {
    entry: "DON'T PANIC",
    text: "Primeira regra do Guia do Mochileiro. Segunda regra: humanos não são vacas, por mais que às vezes cheirem parecido.",
  },
  {
    entry: "TOALHA",
    text: "Um ser que sabe onde está sua toalha nunca deve ser abduzido. É eticamente questionável e praticamente inconveniente.",
  },
  {
    entry: "POESIA VOGON",
    text: "É a terceira pior do universo. Abduzir humanos disfarçados é disparado a primeira pior decisão intergaláctica.",
  },
  {
    entry: "MARVIN",
    text: "Já tentei avisar. 'Tem um humano aí no pasto', eu disse. Mas ninguém me ouve. Cérebro do tamanho de um planeta... para nada.",
  },
];

type Props = {
  cow: Cow;
  onDismiss: () => void;
};

export function HumanAlert({ cow, onDismiss }: Props) {
  const tip = TIPS[Math.floor(Math.random() * TIPS.length)];

  return (
    <div className="fm-human-alert">
      <div className="fm-human-alert-box">
        <div className="fm-human-alert-icon">🚨</div>
        <h2 className="fm-display fm-human-alert-title">INTRUSO DETECTADO</h2>
        <p className="fm-human-alert-sub">
          <strong>{cow.name}</strong> não é uma vaca, capitão.
          <br />
          Isso não deveria ser abduzido.
        </p>

        <div className="fm-human-alert-tip">
          <span className="fm-human-alert-tip-label fm-display">
            GUIA DO MOCHILEIRO · VERBETE: {tip.entry}
          </span>
          <p className="fm-human-alert-tip-text">{tip.text}</p>
        </div>

        <button
          className="fm-btn fm-display fm-human-alert-btn"
          onClick={onDismiss}
        >
          ENTENDIDO, CAPITÃO
        </button>
      </div>
    </div>
  );
}
