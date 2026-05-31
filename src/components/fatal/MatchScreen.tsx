"use client";

import { useEffect, useState } from "react";
import type { Cow, Copy } from "./data";
import { Saucer } from "./Saucer";
import { Starfield } from "./Starfield";
import { CowCard } from "./CowCard";

const RAIO_EXPIRA_EM_MS = 5000;

type Props = {
  cow: Cow;
  copy: Copy;
  isVip: boolean;
  speed?: number;
  onContinue: () => void;
};

export function MatchScreen({ cow, copy, isVip, speed = 1, onContinue }: Props) {
  const [phase, setPhase] = useState(0);
  const [raioAtivo, setRaioAtivo] = useState(false);
  const [progress, setProgress] = useState(0);
  const sp = Math.max(0.2, speed);

  useEffect(() => {
    // UFO enters at 80ms, 700ms transition → centered at ~780ms; beam fires 50ms after
    const t1 = setTimeout(() => setPhase(1), 80 / sp);
    const t2 = setTimeout(() => setRaioAtivo(true), 830 / sp);
    const t3 = setTimeout(() => setPhase(2), 1200 / sp);
    const t4 = setTimeout(() => setPhase(3), 1800 / sp);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [sp]);

  // Auto-dismiss countdown starts when match text appears (phase 3)
  useEffect(() => {
    if (phase < 3) return;
    const start = Date.now();
    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(1, elapsed / RAIO_EXPIRA_EM_MS);
      setProgress(pct);
      if (pct >= 1) {
        clearInterval(tick);
        onContinue();
      }
    }, 50);
    return () => clearInterval(tick);
  // onContinue é estável (definida inline no pai), sem necessidade de incluir
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const ufoX = phase === 0 ? 460 : phase >= 3 ? -460 : 0;
  const ufoTransition =
    phase === 0
      ? "none"
      : phase >= 3
        ? `transform ${450 / sp}ms cubic-bezier(0.55,0,1,0.45)`
        : `transform ${700 / sp}ms cubic-bezier(0.25,0.46,0.45,0.94)`;

  return (
    <div className="fm-match">
      <Starfield enabled count={50} />

      {/* Cow card – centered, vanishes when flash fires */}
      <div
        className="fm-match-card"
        style={{ opacity: phase >= 3 ? 0 : 1 }}
      >
        <CowCard cow={cow} copy={copy} />
      </div>

      {/* UFO container – handles horizontal enter/exit */}
      <div
        className="fm-match-ufo"
        style={{
          transform: `translateX(calc(-50% + ${ufoX}px))`,
          transition: ufoTransition,
        }}
      >
        {/* Bob wrapper – position:relative so beam is anchored to hull */}
        <div
          style={{
            position: "relative",
            animation:
              phase >= 1 && phase < 3
                ? `fm-ufo-bob-inner ${3200 / sp}ms ease-in-out infinite`
                : "none",
          }}
        >
          <Saucer className="ufo-top" />
          <div
            className="fm-beam"
            style={{
              opacity: raioAtivo && phase < 3 ? 1 : 0,
              transition: `opacity ${300 / sp}ms ease`,
            }}
          />
        </div>
      </div>

      {/* White flash */}
      <div
        className="fm-flash"
        style={{
          opacity: phase === 2 ? 1 : 0,
          transition:
            phase === 2
              ? `opacity ${220 / sp}ms ease-in`
              : `opacity ${700 / sp}ms ease-out`,
        }}
      />

      {/* Match text */}
      <div
        className="fm-match-text"
        style={{
          opacity: phase >= 3 ? 1 : 0,
          animation: phase >= 3 ? `fm-fade-up ${500 / sp}ms ease both` : "none",
        }}
      >
        {isVip && (
          <div
            style={{
              fontFamily: "var(--fm-display), sans-serif",
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
            fontFamily: "var(--fm-display), sans-serif",
            color: "#fff",
            fontSize: 18,
            marginBottom: 22,
          }}
        >
          {cow.name}{" "}
          <span style={{ color: "var(--ink-soft)", fontSize: 13 }}>
            · {cow.breed}
          </span>
        </div>
        <div className="fm-match-progress">
          <div
            className="fm-match-progress-bar"
            style={{ transform: `scaleX(${1 - progress})` }}
          />
        </div>
        <button className="fm-btn fm-cta fm-display" onClick={onContinue}>
          {copy.matchCta}
        </button>
      </div>
    </div>
  );
}
