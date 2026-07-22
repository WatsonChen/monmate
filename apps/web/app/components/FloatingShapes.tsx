type ShapeProps = { className?: string };

const fills = {
  mint: "#8EE6C1",
  orange: "#FF7231",
  charcoal: "#1A2421",
} as const;

export function BlobAccent({
  className = "",
  color = "mint",
}: ShapeProps & { color?: keyof typeof fills }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M50 6C70 6 93 20 94 46C95 72 72 94 47 94C23 94 5 74 6 48C7 24 30 6 50 6Z"
        fill={fills[color]}
      />
    </svg>
  );
}

export function SquareAccent({
  className = "",
  color = "orange",
}: ShapeProps & { color?: keyof typeof fills }) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{ background: fills[color] }}
      aria-hidden="true"
    />
  );
}

export function RingAccent({ className = "" }: ShapeProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <circle
        cx="50"
        cy="50"
        r="38"
        fill="none"
        stroke="#1A2421"
        strokeOpacity="0.2"
        strokeWidth="5"
        strokeDasharray="7 12"
        strokeLinecap="round"
      />
    </svg>
  );
}
