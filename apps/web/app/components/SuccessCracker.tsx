"use client";

import { useEffect, useState, type CSSProperties } from "react";

const RAIN_COLORS = ["#8ee6c1", "#ff7231", "#ffd166", "#06d6a0", "#4fb0e0"];

// The corner burst (.success-cracker-piece) plays once and is fully done
// by ~2100ms (1900ms animation + up to 200ms of its own per-piece delay).
// Rain delays start after that, so the two effects never overlap.
const BURST_DURATION_MS = 2100;

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

type RainPiece = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  sway1: number;
  sway2: number;
  drift: number;
  rotate: number;
  scale: number;
  color: string;
};

function buildRainPieces(count: number): RainPiece[] {
  return Array.from({ length: count }, (_, i) => {
    const wobble = randomBetween(16, 34);
    return {
      id: i,
      left: randomBetween(3, 97),
      // First appearance is staggered across ~2s *after* the burst ends;
      // once each piece's own animation loops (infinite), later cycles
      // start back-to-back with no extra gap, keeping the stagger only
      // where it matters — the very first wave.
      delay: BURST_DURATION_MS + randomBetween(0, 2000),
      // Slow, floaty fall — real paper is light enough to hit terminal
      // velocity almost immediately, so it drifts down gently rather than
      // dropping like a solid object.
      duration: randomBetween(4200, 6800),
      sway1: (Math.random() < 0.5 ? 1 : -1) * wobble,
      sway2: (Math.random() < 0.5 ? 1 : -1) * wobble,
      drift: randomBetween(-30, 30),
      rotate: randomBetween(160, 340) * (Math.random() < 0.5 ? -1 : 1),
      scale: randomBetween(0.7, 1.25),
      color: RAIN_COLORS[i % RAIN_COLORS.length]
    };
  });
}

export function SuccessCracker({ compact = false }: { compact?: boolean }) {
  // Randomized only after mount (not via useMemo on first render): this
  // component can be rendered from a Server Component (the homepage hero),
  // where Math.random() would run once during SSR and again during client
  // hydration, producing two different sets of values and a hydration
  // mismatch. Starting from an empty array and filling it in an effect
  // keeps the first client render identical to the server-rendered HTML.
  const [rainPieces, setRainPieces] = useState<RainPiece[]>([]);

  useEffect(() => {
    setRainPieces(buildRainPieces(compact ? 16 : 40));
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
            "--rain-sway1": `${p.sway1}px`,
            "--rain-sway2": `${p.sway2}px`,
            "--rain-drift": `${p.drift}px`,
            "--rain-rotate": `${p.rotate}deg`,
            "--rain-scale": p.scale
          } as CSSProperties}
        />
      ))}
    </div>
  );
}
