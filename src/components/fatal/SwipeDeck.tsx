"use client";

import { useEffect, useImperativeHandle, useRef, type PointerEvent } from "react";
import type { Cow, Copy } from "./data";
import { CowCard } from "./CowCard";

export type SwipeDir = "like" | "nope" | "super";

export type SwipeHandle = {
  swipe: (dir: SwipeDir) => void;
};

type Props = {
  cows: Cow[];
  current: number;
  copy: Copy;
  onDecide: (cow: Cow, dir: SwipeDir) => void;
  handleRef?: React.Ref<SwipeHandle>;
};

export function SwipeDeck({ cows, current, copy, onDecide, handleRef }: Props) {
  const dragRef = useRef<HTMLDivElement | null>(null);
  const stampRef = useRef<HTMLDivElement | null>(null);
  const state = useRef({ down: false, x0: 0, y0: 0, dx: 0, dy: 0, busy: false });

  const visible = cows.slice(current, current + 3);

  const setStamps = (dx: number, dy: number) => {
    const el = stampRef.current;
    if (!el) return;
    const like = Math.max(0, Math.min(1, dx / 100));
    const nope = Math.max(0, Math.min(1, -dx / 100));
    const sup =
      dy < 0 && Math.abs(dy) > Math.abs(dx) ? Math.max(0, Math.min(1, -dy / 110)) : 0;
    const q = (sel: string) => el.querySelector(sel) as HTMLElement | null;
    const eLike = q('[data-stamp="like"]');
    const eNope = q('[data-stamp="nope"]');
    const eSup = q('[data-stamp="super"]');
    if (eLike) eLike.style.opacity = String(sup ? 0 : like);
    if (eNope) eNope.style.opacity = String(sup ? 0 : nope);
    if (eSup) eSup.style.opacity = String(sup);
  };

  const apply = (dx: number, dy: number, withTransition: boolean) => {
    const c = dragRef.current;
    if (!c) return;
    c.style.transition = withTransition ? "transform .3s cubic-bezier(.2,.7,.3,1)" : "none";
    c.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx * 0.05}deg)`;
  };

  const flyOut = (dir: SwipeDir) => {
    if (state.current.busy) return;
    state.current.busy = true;
    const c = dragRef.current;
    const cow = cows[current];
    const dur = 360;
    if (c) {
      c.style.transition = `transform ${dur}ms ease-in, opacity ${dur}ms ease-in`;
      const W = 700;
      if (dir === "like") c.style.transform = `translate(${W}px, -40px) rotate(22deg)`;
      else if (dir === "nope") c.style.transform = `translate(${-W}px, -40px) rotate(-22deg)`;
      else c.style.transform = `translate(0, -900px) rotate(0deg)`;
      c.style.opacity = "0";
    }
    setTimeout(() => {
      state.current.busy = false;
      state.current.dx = 0;
      state.current.dy = 0;
      onDecide(cow, dir);
    }, dur);
  };

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (state.current.busy) return;
    state.current.down = true;
    state.current.x0 = e.clientX;
    state.current.y0 = e.clientY;
    dragRef.current?.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!state.current.down) return;
    state.current.dx = e.clientX - state.current.x0;
    state.current.dy = e.clientY - state.current.y0;
    apply(state.current.dx, state.current.dy, false);
    setStamps(state.current.dx, state.current.dy);
  };
  const onUp = () => {
    if (!state.current.down) return;
    state.current.down = false;
    const { dx, dy } = state.current;
    if (dy < -130 && Math.abs(dy) > Math.abs(dx)) {
      flyOut("super");
      return;
    }
    if (dx > 115) {
      flyOut("like");
      return;
    }
    if (dx < -115) {
      flyOut("nope");
      return;
    }
    apply(0, 0, true);
    setStamps(0, 0);
  };

  useImperativeHandle(
    handleRef,
    () => ({
      swipe: (dir: SwipeDir) => {
        const c = dragRef.current;
        if (c && (dir === "like" || dir === "nope")) {
          c.style.transition = "transform .12s";
          c.style.transform = `translate(${dir === "like" ? 40 : -40}px,0) rotate(${dir === "like" ? 4 : -4}deg)`;
          setStamps(dir === "like" ? 60 : -60, 0);
          setTimeout(() => flyOut(dir), 90);
        } else {
          flyOut(dir);
        }
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [current]
  );

  // Reset transforms when current advances (new top card)
  useEffect(() => {
    const c = dragRef.current;
    if (c) {
      c.style.transition = "none";
      c.style.transform = "translate(0,0) rotate(0deg)";
      c.style.opacity = "1";
    }
    setStamps(0, 0);
  }, [current]);

  return (
    <>
      <div className="fm-deck" onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}>
        {visible
          .slice()
          .reverse()
          .map((cow) => {
            const depth = visible.indexOf(cow);
            const isTop = depth === 0;
            const scale = 1 - depth * 0.045;
            const ty = depth * 14;
            const style = {
              zIndex: 10 - depth,
              transform: `translateY(${ty}px) scale(${scale})`,
              opacity: depth > 1 ? 0.5 : 1,
              transition: "transform .25s, opacity .25s",
            };
            return (
              <div
                key={cow.id}
                onPointerDown={isTop ? onDown : undefined}
                style={{ position: "absolute", inset: 0 }}
              >
                <CowCard
                  cow={cow}
                  copy={copy}
                  style={style}
                  isTop={isTop}
                  ref={dragRef}
                  stampRef={stampRef}
                />
              </div>
            );
          })}
      </div>

      <div className="fm-actions">
        <button className="fm-pill nope" onClick={() => flyOut("nope")}>
          <span className="fm-pill-label">{copy.nope}</span>
        </button>
        <button className="fm-pill like" onClick={() => flyOut("like")}>
          <span className="fm-pill-label">{copy.like}</span>
        </button>
      </div>
    </>
  );
}
