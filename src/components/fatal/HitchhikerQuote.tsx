type Props = { quote: string };

export function HitchhikerQuote({ quote }: Props) {
  return (
    <div style={{
      borderLeft: "3px solid var(--cyan)",
      background: "oklch(0.18 0.04 210 / 0.6)",
      padding: "10px 14px",
      borderRadius: "0 6px 6px 0",
      marginTop: 4,
    }}>
      <p style={{
        color: "var(--cyan)",
        fontSize: 12,
        margin: 0,
        fontStyle: "italic",
        lineHeight: 1.5,
      }}>
        "{quote}"
      </p>
    </div>
  );
}
