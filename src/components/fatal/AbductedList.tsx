"use client";

import { useState } from "react";
import Image from "next/image";
import type { Cow, Copy } from "./data";
import { stripedBg } from "./data";

export type Abducted = { cow: Cow; vip: boolean };

type Props = {
  abducted: Abducted[];
  copy: Copy;
  onBack: () => void;
  onProfile: (cow: Cow, vip: boolean) => void;
  onChat: (cow: Cow, vip: boolean) => void;
};

function GridItem({
  a,
  onProfile,
  onChat,
}: {
  a: Abducted;
  onProfile: (cow: Cow, vip: boolean) => void;
  onChat: (cow: Cow, vip: boolean) => void;
}) {
  const [imgError, setImgError] = useState(false);
  const showPhoto = !!a.cow.photoUrl && !imgError;

  return (
    <div className="fm-grid-item" onClick={() => onProfile(a.cow, a.vip)}>
      <div className="gi-photo" style={showPhoto ? undefined : stripedBg(a.cow.hue)}>
        {showPhoto ? (
          <Image
            src={a.cow.photoUrl!}
            alt={a.cow.name}
            fill
            unoptimized
            style={{ objectFit: "cover" }}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="gi-cow">🐄</div>
        )}
      </div>
      <div className="gi-scrim"></div>
      <div className={"gi-badge" + (a.vip ? " vip" : "")}>
        {a.vip ? "VIP" : "ABDUZIDA"}
      </div>
      <div className="gi-info">
        <div className="gi-name">{a.cow.name}</div>
        <div className="gi-sub">{a.cow.breed}</div>
        <button
          className="gi-chat-btn fm-display"
          onClick={(e) => { e.stopPropagation(); onChat(a.cow, a.vip); }}
        >
          COMUNICAR
        </button>
      </div>
    </div>
  );
}

export function AbductedList({ abducted, copy, onBack, onProfile, onChat }: Props) {
  return (
    <div className="fm-list">
      <h2>
        {copy.listTitle} · {abducted.length}
      </h2>
      {abducted.length === 0 ? (
        <div className="fm-empty">
          <div className="big">🛸</div>
          <h3>{copy.emptyTitle}</h3>
          <p>{copy.listEmpty}</p>
          <button className="fm-btn fm-ghost fm-display" onClick={onBack}>
            VOLTAR AO PASTO
          </button>
        </div>
      ) : (
        <div className="fm-grid">
          {abducted.map((a, i) => (
            <GridItem key={`cow-${a.cow.id}`} a={a} onProfile={onProfile} onChat={onChat} />
          ))}
        </div>
      )}
    </div>
  );
}
