"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";

const MAX_COMPANIONS = 8;

// 用人數圖示說明「報名者與攜伴分別計算」：每加一位同伴，就多一個點、多扣 1 點
export function CompanionDemo() {
  const [companions, setCompanions] = useState(2);
  const total = companions + 1;

  return (
    <div className="rounded-2xl border border-charcoal/10 bg-white p-5">
      <p className="text-sm font-semibold">試試看：1 位報名者帶幾位同伴？</p>

      <div className="mt-4 flex min-h-[44px] flex-wrap items-center gap-2" aria-hidden="true">
        <span className="pricing-dot flex h-10 w-10 items-center justify-center rounded-full bg-orange text-xs font-bold text-white">
          報名
        </span>
        {Array.from({ length: companions }, (_, i) => (
          <span key={i} className="pricing-dot h-10 w-10 rounded-full bg-mint" />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-sm" aria-live="polite">
          共 <strong className="tabular-nums">{total}</strong> 人，扣 <strong className="tabular-nums text-orange">{total}</strong> 點
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="減少一位同伴"
            disabled={companions === 0}
            onClick={() => setCompanions((n) => Math.max(0, n - 1))}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-charcoal/15 transition-colors hover:border-orange hover:text-orange disabled:opacity-30 disabled:hover:border-charcoal/15 disabled:hover:text-inherit"
          >
            <Minus size={16} />
          </button>
          <span className="w-16 text-center text-sm tabular-nums text-charcoal/70">同伴 {companions}</span>
          <button
            type="button"
            aria-label="增加一位同伴"
            disabled={companions === MAX_COMPANIONS}
            onClick={() => setCompanions((n) => Math.min(MAX_COMPANIONS, n + 1))}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-charcoal/15 transition-colors hover:border-orange hover:text-orange disabled:opacity-30 disabled:hover:border-charcoal/15 disabled:hover:text-inherit"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
