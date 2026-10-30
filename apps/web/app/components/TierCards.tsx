"use client";

import { useEffect, useRef, useState } from "react";

type Tier = { credits: number; price: string; perPoint: string; fit: string };

// 每點單價以長條呈現：進入畫面時長條由左長出（只播一次）。
// 沒有 JS 或使用者要求減少動態時，長條直接以最終長度顯示。
export function TierCards({ tiers }: { tiers: Tier[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [grown, setGrown] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setAnimate(true);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setGrown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const max = Math.max(...tiers.map((t) => Number(t.perPoint)));

  return (
    <div ref={ref} className="grid gap-4 sm:grid-cols-3">
      {tiers.map((t, i) => {
        const pct = (Number(t.perPoint) / max) * 100;
        const width = !animate || grown ? `${pct}%` : "0%";
        return (
          <div
            key={t.credits}
            className="rounded-2xl border border-charcoal/10 bg-white p-5"
          >
            <p className="text-3xl font-bold tabular-nums text-charcoal">{t.price}</p>
            <p className="mt-1 text-sm font-semibold text-charcoal/60">{t.credits} 點</p>
            <p className="mt-3 text-sm">{t.fit}</p>

            <div className="mt-5">
              <div className="h-2 overflow-hidden rounded-full bg-cloud">
                <div
                  className="h-full rounded-full bg-orange transition-[width] duration-700 ease-out motion-reduce:transition-none"
                  style={{ width, transitionDelay: `${i * 140}ms` }}
                />
              </div>
              <p className="mt-2 text-xs tabular-nums text-charcoal/60">每點約 NT$ {t.perPoint}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
