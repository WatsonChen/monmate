"use client";

import { useMemo, type CSSProperties } from "react";

const RAIN_COLORS = ["#8ee6c1", "#ff7231", "#ffd166", "#06d6a0", "#4fb0e0"];

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function SuccessCracker({ compact = false }: { compact?: boolean }) {
  // Continuous rain: many small pieces fall straight down from above the
  // stage, each with its own random delay/duration/drift so they land at
  // staggered times — this is what actually reads as "still falling" after
  // the burst, rather than a single arc that settles and fades.
  const rainPieces = useMemo(() => {
    const count = compact ? 10 : 22;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: randomBetween(4, 96),
      delay: randomBetween(0, 1500),
      duration: randomBetween(2200, 3600),
      drift: randomBetween(-36, 36),
      rotate: randomBetween(-260, 260) + (Math.random() < 0.5 ? -360 : 360),
      scale: randomBetween(0.75, 1.2),
      color: RAIN_COLORS[i % RAIN_COLORS.length]
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compact]);

  return (
    <div
      className={`success-cracker-stage${compact ? " success-cracker-stage--compact" : ""}`}
      aria-hidden="true"
    >
      <span className="success-cracker-piece success-cracker-piece--left-1" />
      <span className="success-cracker-piece success-cracker-piece--left-2" />
      <span className="success-cracker-piece success-cracker-piece--left-3" />
      <span className="success-cracker-piece success-cracker-piece--left-4" />
      <span className="success-cracker-piece success-cracker-piece--left-5" />
      <span className="success-cracker-piece success-cracker-piece--right-1" />
      <span className="success-cracker-piece success-cracker-piece--right-2" />
      <span className="success-cracker-piece success-cracker-piece--right-3" />
      <span className="success-cracker-piece success-cracker-piece--right-4" />
      <span className="success-cracker-piece success-cracker-piece--right-5" />
      {rainPieces.map((p) => (
        <span
          key={p.id}
          className="success-cracker-rain"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            "--rain-delay": `${p.delay}ms`,
            "--rain-duration": `${p.duration}ms`,
            "--rain-drift": `${p.drift}px`,
            "--rain-rotate": `${p.rotate}deg`,
            "--rain-scale": p.scale
          } as CSSProperties}
        />
      ))}
    </div>
  );
}
