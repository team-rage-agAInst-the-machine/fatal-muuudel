"use client";

import { useEffect, useState } from "react";

type Star = { x: number; y: number; s: number; d: number; delay: number };

type Props = { enabled?: boolean; count?: number };

export function Starfield({ enabled = true, count = 70 }: Props) {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const arr: Star[] = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        s: Math.random() * 2 + 0.6,
        d: Math.random() * 4 + 2,
        delay: Math.random() * 4,
      });
    }
    setStars(arr);
  }, [count]);

  if (!enabled) return null;

  return (
    <div className="fm-stars">
      {stars.map((st, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: st.x + "%",
            top: st.y + "%",
            width: st.s,
            height: st.s,
            borderRadius: "50%",
            background: i % 7 === 0 ? "#b06bff" : i % 5 === 0 ? "#5dff8f" : "#bff8ff",
            boxShadow: "0 0 6px currentColor",
            color: i % 7 === 0 ? "#b06bff" : "#bff8ff",
            animation: `fm-twinkle ${st.d}s ease-in-out ${st.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
