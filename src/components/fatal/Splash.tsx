import type { Copy } from "./data";
import { Saucer } from "./Saucer";

type Props = { copy: Copy; onEnter: () => void };

export function Splash({ copy, onEnter }: Props) {
  return (
    <div className="fm-splash">
      <Saucer className="saucer-big" />
      <h1>
        Fatal <span className="moo">Muuudel</span>
      </h1>
      <p>{copy.slogan}</p>
      <button className="fm-btn fm-cta fm-display" onClick={onEnter}>
        {copy.enter}
      </button>
    </div>
  );
}
