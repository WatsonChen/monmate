"use client";

import { useEffect, useRef } from "react";

type Vec2 = { x: number; y: number };
type ParticleColor = {
  front: string;
  back: string;
  highlight: string;
};

const COLORS: ParticleColor[] = [
  { front: "#8ee6c1", back: "#67d7bd", highlight: "#d9fff0" },
  { front: "#ff7231", back: "#e45c20", highlight: "#ffd8c4" },
  { front: "#f0eee9", back: "#d8d4cc", highlight: "#ffffff" }
];

const FRAME_MS = 1000 / 60;
const CHARGE_DURATION = 760;
const COMPACT_CHARGE_DURATION = 580;
const MAX_ANIMATION_DURATION = 4200;

function randomRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function pickColor() {
  return COLORS[Math.floor(randomRange(0, COLORS.length))];
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const safeRadius = Math.min(radius, Math.abs(width) / 2, Math.abs(height) / 2);
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, safeRadius);
}

class Confetto {
  color = pickColor();
  dimensions = { x: randomRange(6, 10), y: randomRange(11, 18) };
  rotation = randomRange(0, Math.PI * 2);
  angularVelocity = randomRange(-0.07, 0.07);
  flipPhase = randomRange(0, Math.PI * 2);
  swayPhase = randomRange(0, Math.PI * 2);
  age = 0;
  maxAge = randomRange(2800, 3800);

  constructor(
    public position: Vec2,
    public velocity: Vec2,
    private gravity: number,
    private drag: number,
    private terminalVelocity: number
  ) {}

  update(deltaMs: number) {
    const frameScale = Math.min(deltaMs, 34) / FRAME_MS;
    this.age += deltaMs;
    this.velocity.x *= Math.pow(1 - this.drag, frameScale);
    this.velocity.y = Math.min(
      this.velocity.y + this.gravity * frameScale,
      this.terminalVelocity
    );
    const sway = Math.sin(this.age * 0.004 + this.swayPhase) * 0.18;
    this.position.x += (this.velocity.x + sway) * frameScale;
    this.position.y += this.velocity.y * frameScale;
    this.rotation += this.angularVelocity * frameScale;
  }

  isAlive(height: number) {
    return this.age < this.maxAge && this.position.y < height + 30;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const flip = Math.cos(this.age * 0.012 + this.flipPhase);
    const width = this.dimensions.x;
    const height = this.dimensions.y;

    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.rotation);
    ctx.scale(1, Math.max(0.16, Math.abs(flip)));
    ctx.shadowColor = "rgba(26, 36, 33, 0.14)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;

    roundedRect(ctx, -width / 2, -height / 2, width, height, 2.8);
    ctx.fillStyle = flip >= 0 ? this.color.front : this.color.back;
    ctx.fill();

    ctx.shadowColor = "transparent";
    roundedRect(
      ctx,
      -width * 0.28,
      -height * 0.38,
      width * 0.22,
      height * 0.52,
      1.5
    );
    ctx.globalAlpha = 0.52;
    ctx.fillStyle = this.color.highlight;
    ctx.fill();
    ctx.restore();
  }
}

class SoftDot {
  color = pickColor();
  radius = randomRange(1.6, 3.2);
  age = 0;
  maxAge = randomRange(2200, 3200);

  constructor(
    public position: Vec2,
    public velocity: Vec2,
    private gravity: number,
    private drag: number,
    private terminalVelocity: number
  ) {}

  update(deltaMs: number) {
    const frameScale = Math.min(deltaMs, 34) / FRAME_MS;
    this.age += deltaMs;
    this.velocity.x *= Math.pow(1 - this.drag, frameScale);
    this.velocity.y = Math.min(
      this.velocity.y + this.gravity * frameScale,
      this.terminalVelocity
    );
    this.position.x += this.velocity.x * frameScale;
    this.position.y += this.velocity.y * frameScale;
  }

  isAlive(height: number) {
    return this.age < this.maxAge && this.position.y < height + 20;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.shadowColor = "rgba(26, 36, 33, 0.12)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = this.color.front;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function makeBurstConfetto(originX: number, originY: number) {
  const angle = randomRange(Math.PI * 1.08, Math.PI * 1.92);
  const speed = randomRange(5.4, 9.2);
  return new Confetto(
    {
      x: originX + randomRange(-7, 7),
      y: originY + randomRange(-5, 5)
    },
    {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed
    },
    0.13,
    0.018,
    1.9
  );
}

function makeBurstDot(originX: number, originY: number) {
  const angle = randomRange(Math.PI * 1.08, Math.PI * 1.92);
  const speed = randomRange(4.8, 8);
  return new SoftDot(
    {
      x: originX + randomRange(-5, 5),
      y: originY + randomRange(-4, 4)
    },
    {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed
    },
    0.16,
    0.022,
    2.1
  );
}

function makeDriftConfetto(width: number) {
  return new Confetto(
    {
      x: randomRange(width * 0.08, width * 0.92),
      y: randomRange(-24, -8)
    },
    {
      x: randomRange(-0.7, 0.7),
      y: randomRange(0.15, 0.55)
    },
    0.045,
    0.01,
    1.15
  );
}

function makeDriftDot(width: number) {
  return new SoftDot(
    {
      x: randomRange(width * 0.08, width * 0.92),
      y: randomRange(-18, -6)
    },
    {
      x: randomRange(-0.45, 0.45),
      y: randomRange(0.1, 0.4)
    },
    0.04,
    0.012,
    1
  );
}

export function SuccessCracker({ compact = false }: { compact?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = canvas?.parentElement;
    if (!canvas || !stage) return;
    const canvasElement: HTMLCanvasElement = canvas;
    const stageElement: HTMLElement = stage;

    const ctx = canvasElement.getContext("2d");
    if (!ctx) return;
    const context: CanvasRenderingContext2D = ctx;

    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      const rect = stageElement.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvasElement.width = Math.max(1, Math.round(width * dpr));
      canvasElement.height = Math.max(1, Math.round(height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener("resize", resize);

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduceMotion) {
      return () => window.removeEventListener("resize", resize);
    }

    let confetti: Confetto[] = [];
    let dots: SoftDot[] = [];
    let animationFrame = 0;
    let startedAt = 0;
    let previousFrame = 0;
    let didBurst = false;
    let driftWave = 0;
    const chargeDuration = compact
      ? COMPACT_CHARGE_DURATION
      : CHARGE_DURATION;
    const driftWaveTimes = compact
      ? [chargeDuration + 520, chargeDuration + 1050]
      : [
          chargeDuration + 500,
          chargeDuration + 900,
          chargeDuration + 1320,
          chargeDuration + 1760
        ];

    function burst() {
      const originX = width / 2;
      const originY = height * (compact ? 0.5 : 0.47);
      const confettiCount = compact ? 18 : 38;
      const dotCount = compact ? 7 : 14;
      confetti.push(
        ...Array.from({ length: confettiCount }, () =>
          makeBurstConfetto(originX, originY)
        )
      );
      dots.push(
        ...Array.from({ length: dotCount }, () =>
          makeBurstDot(originX, originY)
        )
      );
    }

    function addDriftWave() {
      const confettiCount = compact ? 3 : 6;
      const dotCount = compact ? 1 : 2;
      confetti.push(
        ...Array.from({ length: confettiCount }, () =>
          makeDriftConfetto(width)
        )
      );
      dots.push(
        ...Array.from({ length: dotCount }, () => makeDriftDot(width))
      );
    }

    function drawFrame(timestamp: number) {
      if (!startedAt) {
        startedAt = timestamp;
        previousFrame = timestamp;
      }

      const elapsed = timestamp - startedAt;
      const deltaMs = timestamp - previousFrame;
      previousFrame = timestamp;

      if (!didBurst && elapsed >= chargeDuration) {
        didBurst = true;
        burst();
      }

      while (
        driftWave < driftWaveTimes.length &&
        elapsed >= driftWaveTimes[driftWave]
      ) {
        addDriftWave();
        driftWave += 1;
      }

      context.clearRect(0, 0, width, height);
      confetti = confetti.filter((piece) => piece.isAlive(height));
      dots = dots.filter((dot) => dot.isAlive(height));

      for (const piece of confetti) {
        piece.update(deltaMs);
        piece.draw(context);
      }
      for (const dot of dots) {
        dot.update(deltaMs);
        dot.draw(context);
      }

      const hasParticles = confetti.length > 0 || dots.length > 0;
      if (elapsed < MAX_ANIMATION_DURATION || hasParticles) {
        animationFrame = requestAnimationFrame(drawFrame);
      } else {
        context.clearRect(0, 0, width, height);
      }
    }

    animationFrame = requestAnimationFrame(drawFrame);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
    };
  }, [compact]);

  return (
    <div
      className={`success-cracker-stage${compact ? " success-cracker-stage--compact" : ""}`}
      aria-hidden="true"
    >
      <span className="success-cracker-charge" />
      <canvas ref={canvasRef} className="success-cracker-canvas" />
    </div>
  );
}
