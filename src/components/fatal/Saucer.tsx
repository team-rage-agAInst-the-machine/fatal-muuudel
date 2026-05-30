type Props = { className?: string };

export function Saucer({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="dome" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#bff8ff" />
          <stop offset="100%" stopColor="#00f0ff" />
        </radialGradient>
        <linearGradient id="hull" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0b4b5c" />
          <stop offset="100%" stopColor="#031d26" />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="48" rx="26" ry="22" fill="url(#dome)" opacity="0.92" />
      <ellipse cx="60" cy="44" rx="14" ry="11" fill="#eafdff" opacity="0.5" />
      <ellipse cx="60" cy="64" rx="54" ry="18" fill="url(#hull)" stroke="#00f0ff" strokeWidth="2" />
      <ellipse cx="60" cy="62" rx="54" ry="15" fill="#06303d" />
      <circle cx="26" cy="64" r="3.4" fill="#5dff8f" />
      <circle cx="42" cy="71" r="3.4" fill="#00f0ff" />
      <circle cx="60" cy="73" r="3.4" fill="#b06bff" />
      <circle cx="78" cy="71" r="3.4" fill="#00f0ff" />
      <circle cx="94" cy="64" r="3.4" fill="#5dff8f" />
    </svg>
  );
}
