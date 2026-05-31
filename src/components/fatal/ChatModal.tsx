"use client";

import { useState, useEffect, useRef } from "react";
import type { Cow } from "./data";
import { CowProfileModal } from "./CowProfileModal";

type ChatMessage = {
  id: string;
  from: "alien" | "cow";
  text: string;
};

let msgCounter = 0;
function newId(from: string) {
  return `${from}-${++msgCounter}-${Math.random().toString(36).slice(2, 7)}`;
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

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setMessages(JSON.parse(saved) as ChatMessage[]);
    } catch {
      // localStorage indisponível
    }
  }, [storageKey]);

  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch {
      // localStorage indisponível
    }
  }, [messages, storageKey]);

  const dispatchMessage = async (text: string) => {
    if (!text.trim() || typing) return;

    setMessages((prev) => [
      ...prev,
      { id: newId("alien"), from: "alien", text: text.trim() },
    ]);
    setInput("");
    setTyping(true);

    try {
      const res = await fetch("/api/chat/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          cowName: cow.name,
          cowBio: cow.bio,
          cowBreed: cow.breed,
          cowMooLevel: cow.mooLevel,
        }),
      });

      if (!res.ok || !res.body) throw new Error("falha na transmissão");

      const cowMsgId = newId("cow");
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
          setMessages((prev) => [
            ...prev,
            { id: cowMsgId, from: "cow", text: accumulated },
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
        <div className="fm-chat-avatar">🐄</div>
        <div className="fm-chat-header-info">
          <div className="fm-chat-header-name fm-display">{cow.name}</div>
          <div className="fm-chat-header-sub">
            {cow.breed} · {cow.distance}
          </div>
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
          if (msg.from === "alien") {
            return (
              <div key={msg.id} className="fm-chat-bubble alien">
                <span className="fm-chat-alien-script">{msg.text.toUpperCase()}</span>
                <span className="fm-chat-alien-translation">({msg.text})</span>
              </div>
            );
          }
          const flat = msg.text.replace(/\n/g, " ").trim();
          const moo = flat.replace(/\s*\([^)]*\)\s*$/, "").trim();
          const translation = flat.match(/\(([^)]+)\)\s*$/)?.[1] ?? "";
          return (
            <div key={msg.id} className="fm-chat-bubble cow">
              <span className="fm-chat-cow-script">{moo}</span>
              {translation && (
                <span className="fm-chat-cow-translation">({translation})</span>
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
          <button
            className="fm-chat-gift"
            onClick={() => dispatchMessage("Mandei 🌽 milho pra você!")}
            disabled={typing}
          >
            🌽 MILHO
          </button>
          <button
            className="fm-chat-gift"
            onClick={() => dispatchMessage("Mandei 🧂 sal mineral pra você!")}
            disabled={typing}
          >
            🧂 SAL
          </button>
          <button
            className="fm-chat-gift"
            onClick={() => dispatchMessage("Mandei 🛸 um disco voador de brinquedo pra você!")}
            disabled={typing}
          >
            🛸 DISCO
          </button>
        </div>
        <form
          className="fm-chat-form"
          onSubmit={(e) => {
            e.preventDefault();
            dispatchMessage(input);
          }}
        >
          <input
            className="fm-chat-input-field"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Fala pro gado, capitão..."
            disabled={typing}
            autoComplete="off"
          />
          <button
            type="submit"
            className="fm-chat-send fm-display"
            disabled={!input.trim() || typing}
          >
            ENVIAR
          </button>
        </form>
      </div>

      {showProfile && (
        <CowProfileModal
          cow={cow}
          vip={vip}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  );
}
