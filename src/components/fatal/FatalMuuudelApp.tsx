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
import { HumanAlert } from "./HumanAlert";
import { TowelAlert } from "./TowelAlert";

type Screen = "splash" | "swipe" | "list";

export function FatalMuuudelApp() {
  const copy = FM_COPY;

  const [rebanho, setRebanho] = useState<Cow[]>([]);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState<Screen>("swipe");
  const [current, setCurrent] = useState(0);
  const [abducted, setAbducted] = useState<Abducted[]>([]);
  const [match, setMatch] = useState<{ cow: Cow; vip: boolean } | null>(null);
  const [chatCow, setChatCow] = useState<{ cow: Cow; vip: boolean } | null>(null);
  const [alertaIntruso, setAlertaIntruso] = useState<Cow | null>(null);
  const [profileCow, setProfileCow] = useState<{ cow: Cow; vip: boolean } | null>(null);
  const [searchRange, setSearchRange] = useState(50);
  const [hasRejected, setHasRejected] = useState(false);
  const [towelAlert, setTowelAlert] = useState<{ cow: Cow } | null>(null);

  const buscarRebanho = (range = 50) => {
    setLoading(true);
    fetch(`/api/cows?range=${range}`)
      .then((r) => r.json())
      .then((data) => {
        setRebanho(data.cows ?? []);
        setHasRejected(data.hasRejected ?? false);
      })
      .finally(() => setLoading(false));
  };

  const buscarAbduzidas = () => {
    fetch("/api/abductions")
      .then((r) => {
        if (!r.ok) return;
        return r.json();
      })
      .then((data) => {
        if (data) setAbducted(data.abductions ?? []);
      })
      .catch((err) => console.error("🛸 [abductions] porão da nave corrompido — lista de abduzidas inacessível:", err));
  };

  useEffect(() => {
    buscarRebanho(searchRange);
    buscarAbduzidas();
  }, []);

  const handleDecide = async (cow: Cow, dir: SwipeDir) => {
    if (cow.isHuman && (dir === "like" || dir === "super")) {
      setCurrent((c) => c + 1);
      setAlertaIntruso(cow);
      fetch("/api/swipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cowId: cow.id, direction: "pass" }),
      }).catch(() => {});
      return;
    }

    let res: Response;
    try {
      res = await fetch("/api/swipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cowId: cow.id, direction: dir }),
      });
    } catch (err) {
      console.error("🐄 [swipe] raio trator falhou — vaca escapou sem ser registrada:", err);
      return;
    }

    if (res.status === 403) {
      const data = await res.json().catch(() => ({}));
      if (data.error === "NO_TOWEL") {
        setTowelAlert({ cow });
        return;
      }
    }

    setCurrent((c) => c + 1);
    if (dir === "like" || dir === "super") {
      const vip = dir === "super";
      setAbducted((a) => [{ cow, vip }, ...a]);
      setMatch({ cow, vip });
    }
  };

  const resetarPasto = () => {
    setCurrent(0);
    setAbducted([]);
    setMatch(null);
    setSearchRange(50);
    setHasRejected(false);
    buscarRebanho(50);
    buscarAbduzidas();
    setScreen("swipe");
  };

  const ampliarRadar = (novoAlcance: number) => {
    setSearchRange(novoAlcance);
    setCurrent(0);
    buscarRebanho(novoAlcance);
  };

  const devolverAoPasto = async (cowId: string) => {
    const liberada = abducted.find((x) => x.cow.id === cowId);
    await fetch(`/api/swipes?cowId=${cowId}`, { method: "DELETE" });
    setAbducted((a) => a.filter((x) => x.cow.id !== cowId));
    if (liberada) {
      setRebanho((prev) => [...prev.filter((c) => c.id !== cowId), liberada.cow]);
    }
    setProfileCow(null);
  };

  const pastoVazio = !loading && current >= rebanho.length;

  // Ao esvaziar o deck, re-verifica hasRejected no servidor para evitar estado stale
  const checkedPastoVazio = useRef(false);
  useEffect(() => {
    if (pastoVazio && !checkedPastoVazio.current) {
      checkedPastoVazio.current = true;
      fetch("/api/cows?range=50")
        .then((r) => r.json())
        .then((data) => setHasRejected(data.hasRejected ?? false));
    }
    if (!pastoVazio) checkedPastoVazio.current = false;
  }, [pastoVazio]);

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

        {screen === "swipe" && !loading && !pastoVazio && (
          <SwipeDeck
            cows={rebanho}
            current={current}
            copy={copy}
            onDecide={handleDecide}
          />
        )}

        {screen === "swipe" && pastoVazio && hasRejected && (
          <EmptyDeck
            copy={copy}
            searchRange={searchRange}
            onExpandRange={ampliarRadar}
            onViewList={() => setScreen("list")}
            onReset={resetarPasto}
          />
        )}

        {screen === "swipe" && pastoVazio && !hasRejected && (
          <div className="fm-empty" style={{ margin: "auto" }}>
            <div className="big">🌌</div>
            <h3>{copy.emptyTitle}</h3>
            <p>{copy.emptySub}</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button className="fm-btn fm-ghost fm-display" onClick={() => setScreen("list")}>
                VER ABDUZIDAS
              </button>
              <button className="fm-btn fm-cta fm-display" onClick={resetarPasto}>
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
            onRelease={devolverAoPasto}
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

        {alertaIntruso && (
          <HumanAlert cow={alertaIntruso} onDismiss={() => setAlertaIntruso(null)} />
        )}

        {match && (
          <MatchScreen
            cow={match.cow}
            copy={copy}
            isVip={match.vip}
            onContinue={() => setMatch(null)}
          />
        )}

        <TowelAlert
          open={towelAlert !== null}
          protectionLevel={towelAlert?.cow.protectionLevel}
          onClose={() => setTowelAlert(null)}
        />
      </div>
    </div>
  );
}

const UNIVERSO_INTEIRO = 1001;

function labelAlcance(range: number): string {
  if (range >= UNIVERSO_INTEIRO) return "UNIVERSO OBSERVÁVEL";
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

  const pct = ((pendingRange - 51) / (UNIVERSO_INTEIRO - 51)) * 100;
  const displayValue = pendingRange >= UNIVERSO_INTEIRO ? "∞" : `${pendingRange} anos-luz`;

  return (
    <div className="fm-empty fm-empty-range" style={{ margin: "auto" }}>
      <div className="big">🌌</div>
      <h3>{copy.emptyTitle}</h3>
      <p>{copy.emptySub}</p>

      <div className="fm-range-block">
        <p className="fm-range-label">📡 ALCANCE DO RAIO TRATOR</p>
        <div className="fm-range-value">{displayValue}</div>
        <div className="fm-range-tag">{labelAlcance(pendingRange)}</div>

        <input
          type="range"
          className="fm-range-slider"
          min={51}
          max={UNIVERSO_INTEIRO}
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
