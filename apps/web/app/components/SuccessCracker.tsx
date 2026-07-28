"use client";

import { useEffect, useRef } from "react";

type Vec2 = { x: number; y: number };

const COLORS = [
  { front: "#8ee6c1", back: "#5fbf95" },
  { front: "#ff7231", back: "#d4581c" },
  { front: "#ffd166", back: "#e0ac2e" },
  { front: "#4fb0e0", back: "#2e86b3" }
];

function randomRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function pickColor() {
  return COLORS[Math.floor(randomRange(0, COLORS.length))];
}

// Weighted spread, not uniform random: most pieces travel a moderate
// distance and only a few go furthest, which is how a real confetti
// cannon actually disperses (adapted from the codepen.io/coopergoeke
// "Confetti Button" reference).
function burstVelocity(xRange: [number, number], yRange: [number, number]): Vec2 {
  const x = randomRange(xRange[0], xRange[1]);
  const range = yRange[1] - yRange[0] + 1;
  let y = yRange[1] - Math.abs(randomRange(0, range) + randomRange(0, range) - range);
  if (y >= yRange[1] - 1 && Math.random() < 0.25) y += randomRange(1, 3);
  return { x, y: -y };
}

class Confetto {
  color = pickColor();
  dimensions = { x: randomRange(5, 9), y: randomRange(8, 15) };
  rotation = randomRange(0, Math.PI * 2);
  scale = { x: 1, y: 1 };
  randomModifier = randomRange(0, 99);

  constructor(
    public position: Vec2,
    public velocity: Vec2
  ) {}

  update(gravity: number, drag: number, terminalVelocity: number) {
    this.velocity.x -= this.velocity.x * drag;
    this.velocity.y = Math.min(this.velocity.y + gravity, terminalVelocity);
    this.velocity.x += Math.random() > 0.5 ? Math.random() : -Math.random();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    // Oscillating y-scale = a continuous tumble; sign flips the fill
    // between front/back color, mimicking a flat card flipping in the air.
    this.scale.y = Math.cos((this.position.y + this.randomModifier) * 0.09);
  }

  draw(ctx: CanvasRenderingContext2D) {
    const w = this.dimensions.x * this.scale.x;
    const h = this.dimensions.y * this.scale.y;
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.rotation);
    ctx.fillStyle = this.scale.y > 0 ? this.color.front : this.color.back;
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.restore();
  }
}

class Sequin {
  color = pickColor().back;
  radius = randomRange(1, 2);

  constructor(
    public position: Vec2,
    public velocity: Vec2
  ) {}

  update(gravity: number, drag: number) {
    this.velocity.x -= this.velocity.x * drag;
    this.velocity.y += gravity;
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// The codepen.io reference launches confetti inside a full 100vh canvas,
// so its velocities give an arc a couple hundred px tall. Our stage is a
// bounded card, not the whole viewport — the same velocities sent pieces
// well above the origin, overlapping the logo/header instead of staying
// near the checkmark. These ranges are scaled down to fit that headroom.
function makeBurstConfetto(originX: number, originY: number, spread: number) {
  const position = { x: originX + randomRange(-spread, spread), y: originY + randomRange(-8, 8) };
  return new Confetto(position, burstVelocity([-6, 6], [3.5, 7]));
}

function makeBurstSequin(originX: number, originY: number, spread: number) {
  const position = { x: originX + randomRange(-spread, spread), y: originY + randomRange(-8, 8) };
  return new Sequin(position, { x: randomRange(-4, 4), y: randomRange(-7, -4) });
}

// Rain pieces enter above the canvas with a gentle, mostly-downward
// initial velocity — gravity does the rest — so they read as falling
// from above rather than another burst from the middle.
function makeRainConfetto(width: number) {
  const position = { x: randomRange(0, width), y: randomRange(-30, -6) };
  return new Confetto(position, { x: randomRange(-1.2, 1.2), y: randomRange(0, 1.4) });
}

function makeRainSequin(width: number) {
  const position = { x: randomRange(0, width), y: randomRange(-30, -6) };
  return new Sequin(position, { x: randomRange(-1, 1), y: randomRange(0, 1.2) });
}

const GRAVITY_CONFETTI = 0.28;
const GRAVITY_SEQUINS = 0.5;
const DRAG_CONFETTI = 0.07;
const DRAG_SEQUINS = 0.02;
const TERMINAL_VELOCITY = 2.6;

export function SuccessCracker({ compact = false }: { compact?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = canvas?.parentElement;
    if (!canvas || !stage) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    const dpr = window.devicePixelRatio || 1;

    function resize() {
      const rect = stage!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    let confetti: Confetto[] = [];
    let sequins: Sequin[] = [];

    function burst(confettiCount: number, sequinCount: number) {
      const originX = width / 2;
      const originY = height * (compact ? 0.5 : 0.47);
      const spread = (compact ? 0.08 : 0.16) * width;
      for (let i = 0; i < confettiCount; i++) confetti.push(makeBurstConfetto(originX, originY, spread));
      for (let i = 0; i < sequinCount; i++) sequins.push(makeBurstSequin(originX, originY, spread));
    }

    function rain(confettiCount: number, sequinCount: number) {
      for (let i = 0; i < confettiCount; i++) confetti.push(makeRainConfetto(width));
      for (let i = 0; i < sequinCount; i++) sequins.push(makeRainSequin(width));
    }

    function drawFrame() {
      ctx!.clearRect(0, 0, width, height);
      confetti = confetti.filter((c) => c.position.y < height + 20);
      sequins = sequins.filter((s) => s.position.y < height + 20);
      confetti.forEach((c) => {
        c.update(GRAVITY_CONFETTI, DRAG_CONFETTI, TERMINAL_VELOCITY);
        c.draw(ctx!);
      });
      sequins.forEach((s) => {
        s.update(GRAVITY_SEQUINS, DRAG_SEQUINS);
        s.draw(ctx!);
      });
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      burst(compact ? 8 : 16, compact ? 4 : 8);
      drawFrame();
      return () => window.removeEventListener("resize", resize);
    }

    burst(compact ? 16 : 42, compact ? 8 : 22);

    let rafId = 0;
    function loop() {
      drawFrame();
      rafId = requestAnimationFrame(loop);
    }
    loop();

    const spawnId = window.setInterval(
      () => rain(compact ? 2 : 5, compact ? 1 : 2),
      compact ? 900 : 620
    );

    return () => {
      cancelAnimationFrame(rafId);
      window.clearInterval(spawnId);
      window.removeEventListener("resize", resize);
    };
  }, [compact]);

  return (
    <div
      className={`success-cracker-stage${compact ? " success-cracker-stage--compact" : ""}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}
