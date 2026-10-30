"use client";

import { useEffect, useRef, useState } from "react";
import { BRANDING_CREDITS, cheapestPlan, describePlan, formatTwd } from "../lib/pricing";

const QUICK_PICKS = [50, 100, 300, 500, 1000];
const SLIDER_MAX = 1000;
const MAX_HEADCOUNT = 100000;

// 數字隨目標值平滑變動；使用者設定減少動態時直接跳到目標值。
// 只用在「點數」這種連續的量；金額是離散的方案價格，不做滾動，以免出現不存在的價格。
function useTween(target: number, ms = 450) {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      fromRef.current = target;
      setValue(target);
      return;
    }
    const from = fromRef.current;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      const next = from + (target - from) * (1 - Math.pow(1 - t, 3));
      fromRef.current = next;
      setValue(next);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return value;
}

export function PricingPlayground() {
  const [headcount, setHeadcount] = useState(100);
  const [branding, setBranding] = useState(false);

  const people = Math.min(MAX_HEADCOUNT, Math.max(0, Math.floor(headcount) || 0));
  const needed = people + (branding ? BRANDING_CREDITS : 0);
  const plan = needed > 0 ? cheapestPlan(needed) : null;
  const leftover = plan ? plan.credits - needed : 0;
  const usedPct = plan ? Math.min(100, (needed / plan.credits) * 100) : 0;

  const leftoverShown = Math.round(useTween(leftover));

  return (
    <div className="rounded-2xl border border-charcoal/10 bg-white p-5 shadow-soft sm:p-7">
      <div className="grid gap-6 md:grid-cols-[1.05fr_1fr] md:gap-10">
        <div>
          <label htmlFor="pricing-headcount" className="text-sm font-semibold">
            預計報名人數（含攜伴）
          </label>
          <div className="mt-2 flex items-center gap-3">
            <input
              id="pricing-headcount"
              type="number"
              inputMode="numeric"
              min={0}
              max={MAX_HEADCOUNT}
              value={headcount}
              onChange={(e) => setHeadcount(Number(e.target.value))}
              className="h-12 w-32 rounded-lg border border-charcoal/15 bg-paper px-3 text-xl font-bold tabular-nums outline-none transition-colors focus:border-orange"
            />
            <span className="text-sm text-charcoal/60">人</span>
          </div>

          <input
            type="range"
            aria-label="拖動調整報名人數"
            min={1}
            max={SLIDER_MAX}
            value={Math.min(Math.max(people, 1), SLIDER_MAX)}
            onChange={(e) => setHeadcount(Number(e.target.value))}
            className="pricing-range mt-5 w-full"
            style={{ "--fill": `${((Math.min(Math.max(people, 1), SLIDER_MAX) - 1) / (SLIDER_MAX - 1)) * 100}%` } as React.CSSProperties}
          />
          <div className="mt-1 flex justify-between text-xs tabular-nums text-charcoal/40">
            <span>1</span>
            <span>{SLIDER_MAX.toLocaleString("en-US")}</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {QUICK_PICKS.map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={people === n}
                onClick={() => setHeadcount(n)}
                className={`h-9 rounded-full border px-4 text-sm font-semibold tabular-nums transition-colors ${
                  people === n
                    ? "border-orange bg-orange text-white"
                    : "border-charcoal/15 bg-white text-charcoal/70 hover:border-orange/50 hover:text-orange"
                }`}
              >
                {n.toLocaleString("en-US")} 人
              </button>
            ))}
          </div>

          <label className="mt-5 flex cursor-pointer items-center gap-2.5 text-sm">
            <input
              type="checkbox"
              checked={branding}
              onChange={(e) => setBranding(e.target.checked)}
              className="h-4 w-4 accent-orange"
            />
            加購品牌客製化（每場 {BRANDING_CREDITS} 點，選用）
          </label>
        </div>

        <div className="flex flex-col justify-center">
          {plan ? (
            <>
              <p className="text-sm text-charcoal/60">帳戶沒有餘額時，這場需要購買</p>
              <p
                key={plan.total}
                className="pricing-pop mt-1 text-5xl font-bold tabular-nums tracking-tight text-charcoal"
              >
                {formatTwd(plan.total)}
              </p>
              <p className="mt-1 text-sm text-charcoal/60">{describePlan(plan.counts)}</p>

              <div
                className="mt-6 flex h-4 overflow-hidden rounded-full bg-cloud"
                role="img"
                aria-label={`購買 ${plan.credits} 點，本場使用 ${needed} 點，剩餘 ${leftover} 點`}
              >
                <div
                  className="h-full bg-orange transition-[width] duration-500 ease-out motion-reduce:transition-none"
                  style={{ width: `${usedPct}%` }}
                />
                <div className="h-full flex-1 bg-mint" />
              </div>
              <div className="mt-2 flex flex-col gap-1 text-sm sm:flex-row sm:justify-between sm:gap-4">
                <span>
                  <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full bg-orange align-middle" />
                  本場使用 <strong className="tabular-nums">{needed}</strong> 點
                </span>
                <span className="sm:text-right">
                  <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full bg-mint align-middle" />
                  剩餘 <strong className="tabular-nums">{leftoverShown}</strong> 點，留到下一場
                </span>
              </div>
              <p className="sr-only" aria-live="polite">
                {`${people} 人需要 ${needed} 點，購買 ${describePlan(plan.counts)}，共 ${formatTwd(plan.total)}，活動後剩餘 ${leftover} 點。`}
              </p>
            </>
          ) : (
            <p className="text-charcoal/60">輸入或拖動人數，就能看到這場需要多少點與金額。</p>
          )}
        </div>
      </div>
    </div>
  );
}
