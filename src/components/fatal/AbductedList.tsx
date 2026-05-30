import type { Cow, Copy } from "./data";
import { stripedBg } from "./data";

export type Abducted = { cow: Cow; vip: boolean };

type Props = {
  abducted: Abducted[];
  copy: Copy;
  onBack: () => void;
  onChat: (cow: Cow) => void;
};

export function AbductedList({ abducted, copy, onBack, onChat }: Props) {
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
            <div className="fm-grid-item" key={a.cow.id + i}>
              <div className="gi-photo" style={stripedBg(a.cow.hue)}></div>
              <div className="gi-cow">🐄</div>
              <div className="gi-scrim"></div>
              <div className={"gi-badge" + (a.vip ? " vip" : "")}>
                {a.vip ? "VIP" : "ABDUZIDA"}
              </div>
              <div className="gi-info">
                <div className="gi-name">{a.cow.name}</div>
                <div className="gi-sub">{a.cow.breed}</div>
                <button
                  className="gi-chat-btn fm-display"
                  onClick={() => onChat(a.cow)}
                >
                  COMUNICAR
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
