"use client";

import { FEATURE_UNLOCK_COSTS } from "@monmate/types";
import { ChevronDown, Calculator } from "lucide-react";
import { useState } from "react";

type Tier = { credits: number; price: number };

const MAX_HEADCOUNT = 100000;

// 以最低總價湊足所需點數（方案可重複購買）
function cheapestPlan(needed: number, tiers: Tier[]) {
  const maxCredits = Math.max(...tiers.map((t) => t.credits));
  const limit = needed + maxCredits;
  const best: number[] = Array(limit + 1).fill(Infinity);
  const pick: number[] = Array(limit + 1).fill(-1);
  best[0] = 0;
  for (let c = 1; c <= limit; c++) {
    tiers.forEach((t, i) => {
      const prev = Math.max(0, c - t.credits);
      if (best[prev] + t.price < best[c]) {
        best[c] = best[prev] + t.price;
        pick[c] = i;
      }
    });
  }
  let target = needed;
  let bestCost = Infinity;
  for (let c = needed; c <= limit; c++) {
    if (best[c] < bestCost) {
      bestCost = best[c];
      target = c;
    }
  }
  const counts = tiers.map(() => 0);
  let c = target;
  while (c > 0) {
    counts[pick[c]] += 1;
    c = Math.max(0, c - tiers[pick[c]].credits);
  }
  return { total: bestCost, counts };
}

export function CreditEstimator({ tiers }: { tiers: Tier[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [headcount, setHeadcount] = useState("100");
  const [branding, setBranding] = useState(false);

  const people = Math.min(MAX_HEADCOUNT, Math.max(0, Math.floor(Number(headcount) || 0)));
  const brandingCost = branding ? FEATURE_UNLOCK_COSTS.BRANDING : 0;
  const needed = people + brandingCost;
  const plan = needed > 0 ? cheapestPlan(needed, tiers) : null;

  return (
    <div className="overflow-hidden rounded-lg border border-charcoal/10 bg-paper">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="flex items-center gap-2">
          <Calculator size={18} className="shrink-0 text-orange" />
          <span className="text-base font-bold">預算試算：一場活動要多少點？</span>
        </span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-charcoal/40 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-5">
            <p className="text-xs leading-5 text-charcoal/60">
              1 位報名者 = 1 點，攜伴者每人各算 1
              點；建立活動免費，活動人數上限只是容量設定、不會扣點。
            </p>
            <div className="mt-4 flex flex-wrap items-end gap-4">
              <label className="block">
                <span className="text-sm font-semibold">預計報到人數（含攜伴）</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={MAX_HEADCOUNT}
                  value={headcount}
                  onChange={(e) => setHeadcount(e.target.value)}
                  className="mt-1 block h-11 w-40 rounded-lg border border-charcoal/15 bg-white px-3 text-base"
                />
              </label>
              <label className="flex h-11 items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={branding}
                  onChange={(e) => setBranding(e.target.checked)}
                  className="h-4 w-4 accent-orange"
                />
                解鎖品牌客製化（每場 {FEATURE_UNLOCK_COSTS.BRANDING} 點，選用）
              </label>
            </div>

            <div className="mt-5 rounded-lg bg-white p-4 text-sm" aria-live="polite">
              {plan ? (
                <>
                  <p>
                    報名扣點 <span className="font-bold">{people}</span> 點
                    {branding ? (
                      <>
                        ＋ 品牌客製化 <span className="font-bold">{brandingCost}</span> 點
                      </>
                    ) : null}
                    ＝ 共需 <span className="font-bold text-orange">{needed}</span> 點
                  </p>
                  <p className="mt-2 text-charcoal/70">
                    最划算的購買方式：
                    {tiers
                      .map((t, i) =>
                        plan.counts[i] ? `${t.credits} 點 × ${plan.counts[i]}` : null,
                      )
                      .filter(Boolean)
                      .join("、")}
                    ，約{" "}
                    <span className="font-bold text-charcoal">
                      NT$ {plan.total.toLocaleString()}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-charcoal/50">
                    點數可跨活動使用，用不完會保留在帳號中。
                  </p>
                </>
              ) : (
                <p className="text-charcoal/60">輸入預計人數，即可看到需要多少點與預估費用。</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
