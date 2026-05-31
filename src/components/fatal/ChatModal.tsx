"use client";

import { useState, useEffect, useRef } from "react";
import type { Cow } from "./data";
import { CowProfileModal } from "./CowProfileModal";

type ChatMessage = {
  id: string;
  from: "alien" | "cow" | "system";
  text: string;
  timestamp?: number;
  status?: "sent" | "read";
};

let msgCounter = 0;
function newId(from: string) {
  return `${from}-${++msgCounter}-${Math.random().toString(36).slice(2, 7)}`;
}

function galacticTime(ts: number): string {
  const d = new Date(ts);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `ÓRB. ${h}:${m}`;
}

type Props = {
  cow: Cow;
  vip: boolean;
  onClose: () => void;
};

export function ChatModal({ cow, vip, onClose }: Props) {
  const storageKey = `fm-chat-${cow.id}`;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const msgsEndRef = useRef<HTMLDivElement>(null);

  // Restaura histórico — insere separador de sessão se havia mensagens salvas
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const stored = JSON.parse(saved) as ChatMessage[];
        if (stored.length > 0) {
          setMessages([
            { id: "session-break", from: "system", text: "📡 transmissão anterior" },
            ...stored,
          ]);
        }
      }
    } catch {
      // localStorage indisponível
    }
  }, [storageKey]);

  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Persiste histórico, sem salvar separadores de sessão
  useEffect(() => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify(messages.filter((m) => m.from !== "system"))
      );
    } catch {
      // localStorage indisponível
    }
  }, [messages, storageKey]);

  const dispatchMessage = async (text: string) => {
    if (!text.trim() || typing) return;

    setMessages((prev) => [
      ...prev,
      { id: newId("alien"), from: "alien", text: text.trim(), timestamp: Date.now(), status: "sent" },
    ]);
    setInput("");
    setTyping(true);

    try {
      const res = await fetch("/api/chat/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim(), cowId: cow.id }),
      });

      if (!res.ok || !res.body) throw new Error("falha na transmissão");

      const cowMsgId = newId("cow");
      const cowTs = Date.now();
      let accumulated = "";
      let started = false;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        accumulated += decoder.decode(value, { stream: true });

        if (!started) {
          started = true;
          setTyping(false);
          // Marca mensagens do alien como lidas e insere resposta da vaca
          setMessages((prev) => [
            ...prev.map((m) =>
              m.from === "alien" && m.status === "sent" ? { ...m, status: "read" as const } : m
            ),
            { id: cowMsgId, from: "cow", text: accumulated, timestamp: cowTs },
          ]);
        } else {
          setMessages((prev) => {
            const idx = prev.findIndex((m) => m.id === cowMsgId);
            if (idx === -1) return prev;
            const updated = [...prev];
            updated[idx] = { ...updated[idx], text: accumulated };
            return updated;
          });
        }
      }
    } catch {
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: newId("cow"),
          from: "cow",
          text: "Muu... muuu moo! (Nave com defeito, tenta de novo, capitão 📡)",
          timestamp: Date.now(),
        },
      ]);
    }
  };

  return (
    <div className="fm-chat">
      <div
        className="fm-chat-header fm-chat-header--clickable"
        onClick={() => setShowProfile(true)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setShowProfile(true); }}
        role="button"
        tabIndex={0}
        aria-label="Ver perfil da vaca"
      >
        <button
          className="fm-chat-back"
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          aria-label="Voltar"
        >
          ←
        </button>
        <div className="fm-chat-avatar">
          {cow.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cow.photoUrl}
              alt={cow.name}
              className="fm-chat-avatar-img"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
                (e.currentTarget.nextSibling as HTMLElement).style.display = "block";
              }}
            />
          ) : null}
          <span style={{ display: cow.photoUrl ? "none" : "block" }}>🐄</span>
        </div>
        <div className="fm-chat-header-info">
          <div className="fm-chat-header-name fm-display">{cow.name}</div>
          <div className="fm-chat-header-sub">{cow.breed} · {cow.distance}</div>
        </div>
        <div className="fm-chat-online">📡</div>
      </div>

      <div className="fm-chat-msgs">
        {messages.length === 0 && (
          <div className="fm-chat-empty">
            <div className="fm-chat-empty-icon">🛸</div>
            <p>
              Canal interestelar aberto com {cow.name}.
              <br />
              Manda o primeiro sinal, capitão!
            </p>
          </div>
        )}

        {messages.map((msg) => {
          // Separador de sessão anterior
          if (msg.from === "system") {
            return (
              <div key={msg.id} style={{
                display: "flex", alignItems: "center", gap: 10,
                margin: "8px 0", opacity: 0.5,
              }}>
                <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
                <span style={{ fontSize: 10, color: "var(--ink-soft)", fontFamily: "var(--fm-body)", whiteSpace: "nowrap" }}>
                  {msg.text}
                </span>
                <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
              </div>
            );
          }

          // Bolha do alien
          if (msg.from === "alien") {
            return (
              <div key={msg.id} className="fm-chat-bubble alien">
                <span className="fm-chat-alien-script">{msg.text.toUpperCase()}</span>
                <span className="fm-chat-alien-translation">({msg.text})</span>
                <div style={{
                  display: "flex", justifyContent: "flex-end", alignItems: "center",
                  gap: 4, marginTop: 4,
                }}>
                  {msg.timestamp && (
                    <span style={{ fontSize: 9, color: "var(--ink-soft)", fontFamily: "var(--fm-body)" }}>
                      {galacticTime(msg.timestamp)}
                    </span>
                  )}
                  {msg.status && (
                    <span style={{
                      fontSize: 11,
                      color: msg.status === "read" ? "var(--cyan)" : "var(--ink-soft)",
                      lineHeight: 1,
                    }}>
                      ✓✓
                    </span>
                  )}
                </div>
              </div>
            );
          }

          // Bolha da vaca
          const flat = msg.text.replace(/\n/g, " ").trim();
          const moo = flat.replace(/\s*\([^)]*\)\s*$/, "").trim();
          const translation = flat.match(/\(([^)]+)\)\s*$/)?.[1] ?? "";
          return (
            <div key={msg.id} className="fm-chat-bubble cow">
              <span className="fm-chat-cow-script">{moo}</span>
              {translation && (
                <span className="fm-chat-cow-translation">({translation})</span>
              )}
              {msg.timestamp && (
                <div style={{ marginTop: 4 }}>
                  <span style={{ fontSize: 9, color: "var(--ink-soft)", fontFamily: "var(--fm-body)" }}>
                    {galacticTime(msg.timestamp)}
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {typing && (
          <div className="fm-chat-typing">{cow.name} está mugindo... 🐄</div>
        )}
        <div ref={msgsEndRef} />
      </div>

      <div className="fm-chat-bottom">
        <div className="fm-chat-gifts">
          <button className="fm-chat-gift" onClick={() => dispatchMessage("Mandei 🌽 milho pra você!")} disabled={typing}>
            🌽 MILHO
          </button>
          <button className="fm-chat-gift" onClick={() => dispatchMessage("Mandei 🧂 sal mineral pra você!")} disabled={typing}>
            🧂 SAL
          </button>
          <button className="fm-chat-gift" onClick={() => dispatchMessage("Mandei 🛸 um disco voador de brinquedo pra você!")} disabled={typing}>
            🛸 DISCO
          </button>
        </div>
        <form
          className="fm-chat-form"
          onSubmit={(e) => { e.preventDefault(); dispatchMessage(input); }}
        >
          <input
            className="fm-chat-input-field"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Fala pro gado, capitão..."
            disabled={typing}
            autoComplete="off"
          />
          <button type="submit" className="fm-chat-send fm-display" disabled={!input.trim() || typing}>
            ENVIAR
          </button>
        </form>
      </div>

      {showProfile && (
        <CowProfileModal cow={cow} vip={vip} onClose={() => setShowProfile(false)} />
      )}
    </div>
  );
}
