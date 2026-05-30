import { forwardRef, type CSSProperties, type Ref } from "react";
import type { Cow, Copy } from "./data";
import { stripedBg } from "./data";

type Props = {
  cow: Cow;
  bio: string;
  copy: Copy;
  style?: CSSProperties;
  isTop?: boolean;
  stampRef?: Ref<HTMLDivElement>;
};

export const CowCard = forwardRef<HTMLDivElement, Props>(function CowCard(
  { cow, bio, copy, style, isTop, stampRef },
  ref
) {
  return (
    <div className={"fm-card" + (isTop ? " top" : "")} style={style} ref={isTop ? ref : null}>
      <div className="fm-card-photo" style={stripedBg(cow.hue)}>
        <span className="ph-label">// FOTO_ESPÉCIME · {cow.id.toUpperCase()}</span>
        <div className="ph-cow">🐄</div>
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
          <h2>{cow.nome}</h2>
          <span className="age">{cow.idade}</span>
        </div>
        <div className="fm-card-meta">
          <span>🧬 {cow.raca}</span>
          <span className="dot">•</span>
          <span>📍 {cow.fazenda}</span>
          <span className="dot">•</span>
          <span>🛸 {cow.distancia}</span>
        </div>
        <p className="fm-card-bio">{bio}</p>
        <div className="fm-stats">
          <div className="fm-stat">
            <span className="v">{cow.peso}</span>
            <span className="l">peso (kg)</span>
          </div>
          <div className="fm-stat">
            <span className="v">{cow.leite}%</span>
            <span className="l">leite</span>
          </div>
          <div className="fm-stat">
            <span className="v">{cow.mugido}/10</span>
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
