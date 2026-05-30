"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { FM_COPY, type Cow, type Copy } from "./data";
import { Saucer } from "./Saucer";
import { Starfield } from "./Starfield";
import { Splash } from "./Splash";
import { SwipeDeck, type SwipeDir } from "./SwipeDeck";
import { MatchScreen } from "./MatchScreen";
import { AbductedList, type Abducted } from "./AbductedList";
import { ChatModal } from "./ChatModal";
import { CowProfileModal } from "./CowProfileModal";

type Screen = "splash" | "swipe" | "list";

export function FatalMuuudelApp() {
  const copy = FM_COPY;

  const [cows, setCows] = useState<Cow[]>([]);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState<Screen>("swipe");
  const [current, setCurrent] = useState(0);
  const [abducted, setAbducted] = useState<Abducted[]>([]);
  const [match, setMatch] = useState<{ cow: Cow; vip: boolean } | null>(null);
  const [profileCow, setProfileCow] = useState<{ cow: Cow; vip: boolean } | null>(null);
  const [chatCow, setChatCow] = useState<{ cow: Cow; vip: boolean } | null>(null);
  const [searchRange, setSearchRange] = useState(50);
  const [hasRejected, setHasRejected] = useState(false);

  const fetchCows = (range = 50) => {
    setLoading(true);
    fetch(`/api/cows?range=${range}`)
      .then((r) => r.json())
      .then((data) => {
        setCows(data.cows ?? []);
        setHasRejected(data.hasRejected ?? false);
      })
      .finally(() => setLoading(false));
  };

  const fetchAbductions = () => {
    fetch("/api/abductions")
      .then((r) => {
        if (!r.ok) return;
        return r.json();
      })
      .then((data) => {
        if (data) setAbducted(data.abductions ?? []);
      })
      .catch((err) => console.error("Falha ao buscar abduções:", err));
  };

  useEffect(() => {
    fetchCows(searchRange);
    fetchAbductions();
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
    setSearchRange(50);
    setHasRejected(false);
    fetchCows(50);
    fetchAbductions();
    setScreen("swipe");
  };

  const handleExpandRange = (newRange: number) => {
    setSearchRange(newRange);
    setCurrent(0);
    fetchCows(newRange);
  };

  const handleRelease = async (cowId: string) => {
    const released = abducted.find((x) => x.cow.id === cowId);
    await fetch(`/api/swipes?cowId=${cowId}`, { method: "DELETE" });
    setAbducted((a) => a.filter((x) => x.cow.id !== cowId));
    if (released) {
      setCows((prev) => [...prev.filter((c) => c.id !== cowId), released.cow]);
    }
    setProfileCow(null);
  };

  const noMore = !loading && current >= cows.length;

  // Ao esvaziar o deck, re-verifica hasRejected no servidor para evitar estado stale
  const checkedNoMore = useRef(false);
  useEffect(() => {
    if (noMore && !checkedNoMore.current) {
      checkedNoMore.current = true;
      fetch("/api/cows?range=50")
        .then((r) => r.json())
        .then((data) => setHasRejected(data.hasRejected ?? false));
    }
    if (!noMore) checkedNoMore.current = false;
  }, [noMore]);

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
              <Link href="/profile" className="fm-tab" title="Perfil ET">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              </Link>
              <button
                className="fm-tab"
                title="Sair da nave"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
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

        {screen === "swipe" && noMore && hasRejected && (
          <EmptyDeck
            copy={copy}
            searchRange={searchRange}
            onExpandRange={handleExpandRange}
            onViewList={() => setScreen("list")}
            onReset={resetAll}
          />
        )}

        {screen === "swipe" && noMore && !hasRejected && (
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
          <AbductedList
            abducted={abducted}
            copy={copy}
            onBack={() => setScreen("swipe")}
            onProfile={(cow, vip) => setProfileCow({ cow, vip })}
            onChat={(cow, vip) => setChatCow({ cow, vip })}
          />
        )}

        {profileCow && (
          <CowProfileModal
            cow={profileCow.cow}
            vip={profileCow.vip}
            onClose={() => setProfileCow(null)}
            onRelease={handleRelease}
            onChat={() => {
              setChatCow({ cow: profileCow.cow, vip: profileCow.vip });
              setProfileCow(null);
            }}
          />
        )}

        {chatCow && (
          <ChatModal
            cow={chatCow.cow}
            vip={chatCow.vip}
            onClose={() => setChatCow(null)}
          />
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

const RANGE_INFINITY = 1001;

function getRangeLabel(range: number): string {
  if (range >= RANGE_INFINITY) return "UNIVERSO OBSERVÁVEL";
  if (range > 500)  return "PLANETA INTEIRO";
  if (range > 250)  return "SISTEMA SOLAR";
  if (range > 100)  return "CONTINENTE BOVINO";
  if (range > 50)   return "FAZENDA REGIONAL";
  return "PASTO LOCAL";
}

function EmptyDeck({
  copy,
  searchRange,
  onExpandRange,
  onViewList,
  onReset,
}: {
  copy: Copy;
  searchRange: number;
  onExpandRange: (range: number) => void;
  onViewList: () => void;
  onReset: () => void;
}) {
  const [pendingRange, setPendingRange] = useState(Math.max(searchRange, 51));

  const pct = ((pendingRange - 51) / (RANGE_INFINITY - 51)) * 100;
  const displayValue = pendingRange >= RANGE_INFINITY ? "∞" : `${pendingRange} anos-luz`;

  return (
    <div className="fm-empty fm-empty-range" style={{ margin: "auto" }}>
      <div className="big">🌌</div>
      <h3>{copy.emptyTitle}</h3>
      <p>{copy.emptySub}</p>

      <div className="fm-range-block">
        <p className="fm-range-label">📡 ALCANCE DO RAIO TRATOR</p>
        <div className="fm-range-value">{displayValue}</div>
        <div className="fm-range-tag">{getRangeLabel(pendingRange)}</div>

        <input
          type="range"
          className="fm-range-slider"
          min={51}
          max={RANGE_INFINITY}
          step={1}
          value={pendingRange}
          onChange={(e) => setPendingRange(Number(e.target.value))}
          style={{ "--pct": `${pct}%` } as React.CSSProperties}
        />

        <div className="fm-range-ends">
          <span>50 al</span>
          <span>∞</span>
        </div>

        <button
          className="fm-btn fm-cta fm-display"
          style={{ width: "100%", fontSize: 12, marginTop: 8 }}
          onClick={() => onExpandRange(pendingRange)}
        >
          CONFIRMAR DISTÂNCIA
        </button>

        {searchRange > 50 && (
          <p className="fm-range-hint">👽 Vacas rejeitadas do passado voltaram ao radar!</p>
        )}
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        <button className="fm-btn fm-ghost fm-display" onClick={onViewList}>
          VER ABDUZIDAS
        </button>
        <button className="fm-btn fm-ghost fm-display" onClick={onReset}>
          {copy.again}
        </button>
      </div>
    </div>
  );
}
