import { FEATURE_UNLOCK_COSTS } from "@monmate/types";

export type PricingTier = { credits: number; price: number; fit: string };

// 與後端 billing.service.ts 的 pricingTiers 一致；不要在這裡調整價格
export const PRICING_TIERS: PricingTier[] = [
  { credits: 199, price: 590, fit: "小型講座首選" },
  { credits: 599, price: 790, fit: "品牌活動熱門" },
  { credits: 999, price: 990, fit: "大型展覽適用" },
];

export const BRANDING_CREDITS = FEATURE_UNLOCK_COSTS.BRANDING;

export const EXAMPLE_HEADCOUNTS = [50, 100, 300, 500, 1000];

// 以最低總價湊足所需點數（方案可重複購買）
export function cheapestPlan(needed: number, tiers: PricingTier[] = PRICING_TIERS) {
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
  const credits = counts.reduce((sum, n, i) => sum + n * tiers[i].credits, 0);
  return { total: bestCost, counts, credits };
}

export function describePlan(counts: number[], tiers: PricingTier[] = PRICING_TIERS) {
  return tiers
    .map((t, i) => (counts[i] ? `${t.credits} 點 × ${counts[i]}` : null))
    .filter(Boolean)
    .join("、");
}

export function estimateCost(headcount: number, withBranding = false) {
  const needed = headcount + (withBranding ? BRANDING_CREDITS : 0);
  return { needed, ...cheapestPlan(needed) };
}

export function formatTwd(amount: number) {
  return `NT$${amount.toLocaleString("en-US")}`;
}
