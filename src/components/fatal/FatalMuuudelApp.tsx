"use client";

import { useState, useEffect } from "react";
import { FM_COPY, type Cow } from "./data";
import { Saucer } from "./Saucer";
import { Starfield } from "./Starfield";
import { Splash } from "./Splash";
import { SwipeDeck, type SwipeDir } from "./SwipeDeck";
import { MatchScreen } from "./MatchScreen";
import { AbductedList, type Abducted } from "./AbductedList";

type Screen = "splash" | "swipe" | "list";

export function FatalMuuudelApp() {
  const copy = FM_COPY;

  const [cows, setCows] = useState<Cow[]>([]);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState<Screen>("splash");
  const [current, setCurrent] = useState(0);
  const [abducted, setAbducted] = useState<Abducted[]>([]);
  const [match, setMatch] = useState<{ cow: Cow; vip: boolean } | null>(null);

  const fetchCows = () => {
    setLoading(true);
    fetch("/api/cows")
      .then((r) => r.json())
      .then((data) => setCows(data.cows ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCows();
  }, []);

  const handleDecide = async (cow: Cow, dir: SwipeDir) => {
    try {
      await fetch("/api/swipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cowId: cow.id, direction: dir }),
      });
    } catch (err) {
      console.error("Falha ao registrar swipe:", err);
      return;
    }
    setCurrent((c) => c + 1);
    if (dir === "like" || dir === "super") {
      const vip = dir === "super";
      setAbducted((a) => [{ cow, vip }, ...a]);
      setMatch({ cow, vip });
    }
  };

  const resetAll = () => {
    setCurrent(0);
    setAbducted([]);
    setMatch(null);
    fetchCows();
    setScreen("swipe");
  };

  const noMore = !loading && current >= cows.length;

  return (
    <div className="fm-stage">
      <Starfield enabled count={90} />
      <div className="fm-app">
        {screen !== "splash" && (
          <div className="fm-topbar">
            <div className="fm-logo">
              <Saucer className="saucer" />
              <span>FATAL MUUUDEL</span>
            </div>
            <div className="fm-tabs">
              <button
                className={"fm-tab" + (screen === "swipe" ? " active" : "")}
                onClick={() => setScreen("swipe")}
                title="Pasto"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="4" y="3" width="16" height="18" rx="3" />
                  <path d="M9 21v-4h6v4" />
                </svg>
              </button>
              <button
                className={"fm-tab" + (screen === "list" ? " active" : "")}
                onClick={() => setScreen("list")}
                title="Abduzidas"
                style={{ position: "relative" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <ellipse cx="12" cy="11" rx="9" ry="4" />
                  <path d="M5 11c0 3 3 5 7 5s7-2 7-5" />
                </svg>
                {abducted.length > 0 && <span className="count">{abducted.length}</span>}
              </button>
            </div>
          </div>
        )}

        {screen === "splash" && <Splash copy={copy} onEnter={() => setScreen("swipe")} />}

        {screen === "swipe" && loading && (
          <div className="fm-empty" style={{ margin: "auto" }}>
            <div className="big">🛸</div>
            <p style={{ color: "var(--ink-soft)" }}>Buscando vacas na galáxia...</p>
          </div>
        )}

        {screen === "swipe" && !loading && !noMore && (
          <SwipeDeck
            cows={cows}
            current={current}
            copy={copy}
            onDecide={handleDecide}
          />
        )}

        {screen === "swipe" && noMore && (
          <div className="fm-empty" style={{ margin: "auto" }}>
            <div className="big">🌌</div>
            <h3>{copy.emptyTitle}</h3>
            <p>{copy.emptySub}</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button className="fm-btn fm-ghost fm-display" onClick={() => setScreen("list")}>
                VER ABDUZIDAS
              </button>
              <button className="fm-btn fm-cta fm-display" onClick={resetAll}>
                {copy.again}
              </button>
            </div>
          </div>
        )}

        {screen === "list" && (
          <AbductedList abducted={abducted} copy={copy} onBack={() => setScreen("swipe")} />
        )}

        {match && (
          <MatchScreen
            cow={match.cow}
            copy={copy}
            isVip={match.vip}
            onContinue={() => setMatch(null)}
          />
        )}
      </div>
    </div>
  );
}
