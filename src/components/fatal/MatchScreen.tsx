"use client";

import { useEffect, useState } from "react";
import type { Cow, Copy } from "./data";
import { Saucer } from "./Saucer";
import { Starfield } from "./Starfield";

type Props = {
  cow: Cow;
  copy: Copy;
  isVip: boolean;
  speed?: number;
  onContinue: () => void;
};

export function MatchScreen({ cow, copy, isVip, speed = 1, onContinue }: Props) {
  const [phase, setPhase] = useState(0);
  const sp = Math.max(0.2, speed);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 80 / sp);
    const t2 = setTimeout(() => setPhase(2), 1300 / sp);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [sp]);

  const riseDur = 1500 / sp + "ms";

  return (
    <div className="fm-match">
      <Starfield enabled count={50} />
      <div
        className="fm-beam"
        style={{
          opacity: phase >= 1 ? 1 : 0,
          transition: `opacity ${600 / sp}ms ease`,
          animation: phase >= 1 ? `fm-beam-pulse ${1600 / sp}ms ease-in-out infinite` : "none",
        }}
      ></div>

      <div
        style={{
          position: "absolute",
          top: 60,
          left: "50%",
          animation: `fm-ufo-bob ${3200 / sp}ms ease-in-out infinite`,
        }}
      >
        <Saucer className="ufo-top" />
      </div>

      <div
        className="fm-abductee"
        style={{
          bottom: phase >= 1 ? 360 : 150,
          opacity: phase >= 2 ? 0.15 : 1,
          transform: `translateX(-50%) scale(${phase >= 1 ? 0.4 : 1})`,
          transition: `bottom ${riseDur} cubic-bezier(.4,0,.6,1), transform ${riseDur} ease-in, opacity ${500 / sp}ms ease`,
        }}
      >
        🐄
      </div>

      <div
        className="fm-match-text"
        style={{
          opacity: phase >= 2 ? 1 : 0,
          animation: phase >= 2 ? `fm-fade-up ${500 / sp}ms ease both` : "none",
        }}
      >
        {isVip && (
          <div
            style={{
              fontFamily: "var(--font-orbitron), sans-serif",
              color: "var(--violet)",
              fontSize: 13,
              letterSpacing: ".15em",
              marginBottom: 8,
              textShadow: "0 0 14px rgba(176,107,255,.8)",
            }}
          >
            ★ {copy.superLike} ★
          </div>
        )}
        <h2>{copy.matchTitle}</h2>
        <p>{copy.matchSub}</p>
        <div
          style={{
            fontFamily: "var(--font-orbitron), sans-serif",
            color: "#fff",
            fontSize: 18,
            marginBottom: 22,
          }}
        >
          {cow.nome}{" "}
          <span style={{ color: "var(--ink-soft)", fontSize: 13 }}>· {cow.raca}</span>
        </div>
        <button className="fm-btn fm-cta fm-display" onClick={onContinue}>
          {copy.matchCta}
        </button>
      </div>
    </div>
  );
}
