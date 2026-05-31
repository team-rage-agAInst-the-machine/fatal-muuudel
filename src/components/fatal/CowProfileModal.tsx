"use client";

import { useState } from "react";
import type { Cow } from "./data";
import { stripedBg } from "./data";

type Props = {
  cow: Cow;
  vip: boolean;
  onClose: () => void;
  onChat?: () => void;
  onRelease?: (cowId: string) => void;
};

export function CowProfileModal({ cow, vip, onClose, onChat, onRelease }: Props) {
  const [liberando, setLiberando] = useState(false);

  const handleRelease = () => {
    if (!onRelease) return;
    setLiberando(true);
    setTimeout(() => onRelease(cow.id), 2200);
  };

  return (
    <div className="fm-profile">
      {/* Overlay de liberação — aparece sobre tudo quando devolve ao pasto */}
      {liberando && (
        <div className="fm-liberdade">
          <div className="fm-liberdade-vaca">🐄💨</div>
          <div className="fm-liberdade-texto fm-display">MUUUU!</div>
          <div className="fm-liberdade-sub">De volta ao pasto, {cow.name}!</div>
        </div>
      )}

      <div className="fm-profile-header">
        <button className="fm-profile-back" onClick={onClose} aria-label="Voltar">
          ←
        </button>
        <span className="fm-profile-header-name fm-display">{cow.name}</span>
        <span className={`fm-profile-badge fm-display${vip ? " vip" : ""}`}>
          {vip ? "VIP" : "ABDUZIDA"}
        </span>
      </div>

      <div className="fm-profile-scroll">
        <div className="fm-profile-photo" style={cow.photoUrl ? undefined : stripedBg(cow.hue)}>
          {cow.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cow.photoUrl}
              alt={cow.name}
              className="fm-profile-photo-img"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                (e.currentTarget.nextSibling as HTMLElement).style.display = "block";
              }}
            />
          ) : null}
          <div
            className="fm-profile-cow"
            style={{ display: cow.photoUrl ? "none" : "block" }}
          >
            🐄
          </div>
          <div className="fm-profile-scrim" />
        </div>

        <div className="fm-profile-body">
          <div className="fm-profile-name-row">
            <h2 className="fm-display">{cow.name}</h2>
            <span className="fm-profile-age">{cow.age} anos</span>
          </div>

          <div className="fm-profile-meta">
            <span>🧬 {cow.breed}</span>
            <span className="dot">·</span>
            <span>📍 {cow.farm}</span>
            <span className="dot">·</span>
            <span>🛸 {cow.distance}</span>
          </div>

          <p className="fm-profile-bio">{cow.bio}</p>

          <div className="fm-profile-stats">
            <div className="fm-profile-stat">
              <span className="v">{cow.weightKg}</span>
              <span className="l">kg</span>
            </div>
            <div className="fm-profile-stat">
              <span className="v">{cow.milkPct}%</span>
              <span className="l">leite</span>
            </div>
            <div className="fm-profile-stat">
              <span className="v">{cow.mooLevel}/10</span>
              <span className="l">mugido</span>
            </div>
          </div>

          {cow.tags.length > 0 && (
            <div className="fm-profile-tags">
              {cow.tags.map((tag, i) => (
                <span key={i} className="fm-chip">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="fm-profile-footer">
        {onRelease && (
          <button
            className="fm-btn fm-display fm-btn-release"
            onClick={handleRelease}
            disabled={liberando}
          >
            DEVOLVER AO PASTO 🐄
          </button>
        )}
        {onChat ? (
          <button
            className="fm-btn fm-btn-cta fm-display fm-profile-chat-btn"
            onClick={onChat}
          >
            COMUNICAR
          </button>
        ) : (
          <button
            className="fm-btn fm-btn-ghost fm-display fm-profile-chat-btn"
            onClick={onClose}
          >
            FECHAR
          </button>
        )}
      </div>
    </div>
  );
}
