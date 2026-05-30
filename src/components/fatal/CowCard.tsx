import { forwardRef, type CSSProperties, type Ref } from "react";
import Image from "next/image";
import type { Cow, Copy } from "./data";
import { stripedBg } from "./data";

type Props = {
  cow: Cow;
  copy: Copy;
  style?: CSSProperties;
  isTop?: boolean;
  stampRef?: Ref<HTMLDivElement>;
};

export const CowCard = forwardRef<HTMLDivElement, Props>(function CowCard(
  { cow, copy, style, isTop, stampRef },
  ref
) {
  return (
    <div className={"fm-card" + (isTop ? " top" : "")} style={style} ref={isTop ? ref : null}>
      <div className="fm-card-photo" style={cow.photoUrl ? undefined : stripedBg(cow.hue)}>
        {cow.photoUrl ? (
          <Image src={cow.photoUrl} alt={cow.name} fill sizes="400px" style={{ objectFit: "cover" }} />
        ) : (
          <>
            <span className="ph-label">// FOTO_ESPÉCIME · {cow.id.toUpperCase()}</span>
            <div className="ph-cow">🐄</div>
          </>
        )}
        <div className="fm-card-scrim"></div>
      </div>

      {isTop && (
        <div ref={stampRef}>
          <div className="fm-stamp like" data-stamp="like">
            {copy.like}
          </div>
          <div className="fm-stamp nope" data-stamp="nope">
            {copy.nope}
          </div>
          <div className="fm-stamp super" data-stamp="super">
            {copy.superLike}
          </div>
        </div>
      )}

      <div className="fm-card-info">
        <div className="fm-card-name">
          <h2>{cow.name}</h2>
          <span className="age">{cow.age}</span>
        </div>
        <div className="fm-card-meta">
          <span>🧬 {cow.breed}</span>
          <span className="dot">•</span>
          <span>📍 {cow.farm}</span>
          <span className="dot">•</span>
          <span>🛸 {cow.distance}</span>
        </div>
        <p className="fm-card-bio">{cow.bio}</p>
        <div className="fm-stats">
          <div className="fm-stat">
            <span className="v">{cow.weightKg}</span>
            <span className="l">peso (kg)</span>
          </div>
          <div className="fm-stat">
            <span className="v">{cow.milkPct}%</span>
            <span className="l">leite</span>
          </div>
          <div className="fm-stat">
            <span className="v">{cow.mooLevel}/10</span>
            <span className="l">mugido</span>
          </div>
        </div>
        <div className="fm-tags">
          {cow.tags.map((t, i) => (
            <span className="fm-chip" key={i}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
});
