"use client";

import { CREDIT_FLOOR, type CheckoutSessionDTO, type PricingTierDTO } from "@monmate/types";
import { CreditCard, X } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { DotsLoading } from "./DotsLoading";

type Props = {
  open: boolean;
  token: string;
  onClose: () => void;
  // 本次實際新增的計費人數（含攜伴），也就是這次操作需要的點數
  needed: number;
  // 目前餘額
  balance: number;
  // 付款完成後要回到的站內後台路徑（會原樣帶回付款結果與匯入作業編號）
  returnTo: string;
  title?: string;
  description?: string;
};

export function TopUpDialog({ open, token, onClose, needed, balance, returnTo, title = "點數不足，請先儲值", description = "付款完成後會自動回到這個操作，不需要重新選檔。" }: Props) {
  const [tiers, setTiers] = useState<PricingTierDTO[]>([]);
  const [tierId, setTierId] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState("");

  const balanceAfter = balance - needed;
  // 至少要補到操作後餘額不低於臨時額度下限
  const minTopUp = Math.max(0, CREDIT_FLOOR - balanceAfter);

  useEffect(() => {
    if (!open || !token) return;
    void apiFetch<PricingTierDTO[]>("/billing/pricing-tiers", { token }).then((res) => {
      if (!res.success || !res.data) {
        setError(res.error?.message ?? "讀取方案失敗");
        return;
      }
      setTiers(res.data);
      const sorted = [...res.data].sort((a, b) => a.attendeeCredits - b.attendeeCredits);
      const enough = sorted.find((t) => t.attendeeCredits >= minTopUp) ?? sorted[sorted.length - 1];
      setTierId(enough?.id ?? "");
    });
  }, [open, token, minTopUp]);

  if (!open) return null;
  const selected = tiers.find((t) => t.id === tierId);
  const afterPurchase = selected ? balanceAfter + selected.attendeeCredits : balanceAfter;

  async function checkout() {
    setIsCheckingOut(true);
    setError("");
    const res = await apiFetch<CheckoutSessionDTO>("/billing/checkout-session", {
      method: "POST",
      token,
      body: JSON.stringify({ tierId, returnTo })
    });
    if (!res.success || !res.data) {
      setIsCheckingOut(false);
      setError(res.error?.message ?? "建立付款連結失敗");
      return;
    }
    const form = document.createElement("form");
    form.method = res.data.method;
    form.action = res.data.action;
    Object.entries(res.data.fields).forEach(([name, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.append(input);
    });
    document.body.append(form);
    form.submit();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-charcoal/40 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:max-w-md sm:rounded-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">{title}</h2>
            <p className="mt-1 text-sm text-charcoal/60">{description}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="關閉" className="rounded-lg p-1.5 text-charcoal/50 hover:bg-paper">
            <X size={18} />
          </button>
        </div>

        <dl className="mt-4 grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 rounded-lg bg-paper p-4 text-sm">
          <dt className="text-charcoal/60">本次實際新增的計費人數</dt>
          <dd className="font-bold">{needed} 人</dd>
          <dt className="text-charcoal/60">本次所需點數</dt>
          <dd className="font-bold">{needed} 點</dd>
          <dt className="text-charcoal/60">目前餘額</dt>
          <dd className="font-bold">{balance} 點</dd>
          <dt className="text-charcoal/60">操作後預計餘額</dt>
          <dd className="font-bold text-red-600">{balanceAfter} 點</dd>
        </dl>
        <p className="mt-2 text-xs text-charcoal/50">
          帳戶最多可先使用 {Math.abs(CREDIT_FLOOR)} 點臨時額度，操作後餘額需在 {CREDIT_FLOOR} 點以上；
          至少需再購買 <strong>{minTopUp}</strong> 點。
        </p>

        <div className="mt-4 space-y-2">
          {tiers.map((tier) => {
            const enough = tier.attendeeCredits >= minTopUp;
            return (
              <label
                key={tier.id}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-3 text-sm ${
                  tierId === tier.id ? "border-orange bg-orange/10" : "border-charcoal/10 hover:border-charcoal/20"
                }`}
              >
                <span>
                  <span className="block font-bold">{tier.attendeeCredits} 點</span>
                  <span className="text-xs text-charcoal/55">
                    {tier.label}{enough ? "" : "・仍不足本次所需"}
                  </span>
                </span>
                <span className="flex items-center gap-2 font-bold">
                  NT$ {tier.amount.toLocaleString()}
                  <input
                    type="radio"
                    name="topup-tier"
                    checked={tierId === tier.id}
                    onChange={() => setTierId(tier.id)}
                    className="accent-orange"
                  />
                </span>
              </label>
            );
          })}
        </div>

        {selected ? (
          <p className="mt-3 text-sm">
            購買後、完成本次操作的預計餘額：<strong className={afterPurchase < CREDIT_FLOOR ? "text-red-600" : "text-green-700"}>{afterPurchase} 點</strong>
            {afterPurchase < CREDIT_FLOOR ? "（仍低於下限，請改選較大的方案或分次購買）" : ""}
          </p>
        ) : null}

        {error ? <p className="mt-3 text-sm font-semibold text-red-600">{error}</p> : null}

        <div className="mt-5 flex gap-2">
          <button type="button" onClick={onClose} className="h-11 flex-1 rounded-lg border border-charcoal/15 text-sm font-semibold hover:bg-paper">
            稍後再說
          </button>
          <button
            type="button"
            disabled={!tierId || isCheckingOut}
            onClick={() => void checkout()}
            className="flex h-11 flex-[2] items-center justify-center gap-2 rounded-lg bg-orange text-sm font-bold text-white disabled:opacity-40"
          >
            <CreditCard size={16} />
            {isCheckingOut ? <>前往付款<DotsLoading /></> : "前往付款"}
          </button>
        </div>
      </div>
    </div>
  );
}
