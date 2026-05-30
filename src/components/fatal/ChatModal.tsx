"use client";

import { useState, useEffect, useRef } from "react";
import type { Cow } from "./data";

type ChatMessage = {
  id: string;
  from: "alien" | "cow";
  text: string;
};

const MOCK_REPLIES = [
  "Muu mu mumu muuu... (Oi capitão! Que bom que você apareceu, tava com saudade do pasto 😔)",
  "Mooo muu mu! Moo muu muuu! (Recebi seu sinal sim! Aqui no porão tá gelado mas tô bem!)",
  "Muuu... mu moo muu mumu! (Capitão, quando você vai me levar visitar o planeta de vocês?)",
  "Moo muu! Mu muu mooooo! (Esse disco voador é incrível! A minha fazenda não tinha nada assim!)",
  "Muuu mu moo... muu? (Tem capim aí? Esse negócio sintético da nave não tem sabor nenhum...)",
  "Mooo muu mumu mu muuu! (Você é o melhor ET que já me abduziu, capitão! Pode me abduzir de novo!)",
  "Muu? Mu moo muu moooo! (Isso que você falou... eu não entendi muito mas MUUU de coração!)",
  "Muuu mu moo muu! (Tô aqui ruminando e pensando na vida... 5 estrelas pra essa abdução!)",
  "Moo muu! Muuu mu mumu moo! (Sabe o que eu mais gosto daqui? As estrelas! Nunca via isso do pasto!)",
  "Muuu moo mu muu... moooo! (Mandei abraço de volta pra você! Cuida do disco voador tá? 🛸)",
];

let msgCounter = 0;
function newId(from: string) {
  return `${from}-${++msgCounter}-${Math.random().toString(36).slice(2, 7)}`;
}

type Props = {
  cow: Cow;
  onClose: () => void;
};

export function ChatModal({ cow, onClose }: Props) {
  const storageKey = `fm-chat-${cow.id}`;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const msgsEndRef = useRef<HTMLDivElement>(null);

  // Hidratação segura: lê localStorage só no cliente
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

  const dispatchMessage = (text: string) => {
    if (!text.trim() || typing) return;

    setMessages((prev) => [
      ...prev,
      { id: newId("alien"), from: "alien", text: text.trim() },
    ]);
    setInput("");
    setTyping(true);

    const delay = 1200 + Math.random() * 900;
    setTimeout(() => {
      const reply = MOCK_REPLIES[Math.floor(Math.random() * MOCK_REPLIES.length)];
      setMessages((prev) => [
        ...prev,
        { id: newId("cow"), from: "cow", text: reply },
      ]);
      setTyping(false);
    }, delay);
  };

  return (
    <div className="fm-chat">
      <div className="fm-chat-header">
        <button className="fm-chat-back" onClick={onClose} aria-label="Voltar">
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
          const moo = msg.text.replace(/\s*\(.*\)$/, "").trim();
          const translation = msg.text.match(/\(([^)]+)\)$/)?.[1] ?? "";
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
    </div>
  );
}
