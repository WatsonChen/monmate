"use client";

import type {
  BillingStatusDTO,
  CheckoutSessionDTO,
  PricingTierDTO
} from "@monmate/types";
import { CreditCard, RefreshCcw, Receipt } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { AdminShell } from "./AdminShell";

function formatDate(value: string) {
  return new Date(value).toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

const statusLabel: Record<string, string> = {
  PENDING: "待付款",
  PAID: "已付款",
  FAILED: "付款失敗",
  EXPIRED: "已過期",
  CANCELED: "已取消",
  REFUNDED: "已退款"
};

const statusColor: Record<string, string> = {
  PAID: "text-green-600",
  PENDING: "text-yellow-600",
  FAILED: "text-red-500",
  EXPIRED: "text-charcoal/40",
  CANCELED: "text-charcoal/40",
  REFUNDED: "text-blue-500"
};

export function AdminBillingClient() {
  const [token, setToken] = useState("");
  const [billing, setBilling] = useState<BillingStatusDTO | null>(null);
  const [pricingTiers, setPricingTiers] = useState<PricingTierDTO[]>([]);
  const [selectedTierId, setSelectedTierId] = useState("SMALL");
  const [message, setMessage] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  async function loadBilling(nextToken = token) {
    if (!nextToken) return;
    const res = await apiFetch<BillingStatusDTO>("/billing/status", { token: nextToken });
    if (res.success && res.data) setBilling(res.data);
  }

  async function loadPricingTiers(nextToken = token) {
    if (!nextToken) return;
    const res = await apiFetch<PricingTierDTO[]>("/billing/pricing-tiers", { token: nextToken });
    if (res.success && res.data) {
      setPricingTiers(res.data);
      setSelectedTierId(res.data[0]?.id ?? "SMALL");
    }
  }

  useEffect(() => {
    const storedToken = window.localStorage.getItem("monmate.token") ?? "";
    setToken(storedToken);
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") setMessage("付款完成！人次額度已入帳。");
    if (params.get("payment") === "cancelled") setMessage("付款已取消。");
    if (params.get("payment") === "failed") setMessage("付款失敗，請重試。");
    void loadBilling(storedToken);
    void loadPricingTiers(storedToken);
  }, []);

  async function checkout() {
    setIsCheckingOut(true);
    setMessage("");
    const res = await apiFetch<CheckoutSessionDTO>("/billing/checkout-session", {
      method: "POST",
      token,
      body: JSON.stringify({ tierId: selectedTierId })
    });
    setIsCheckingOut(false);
    if (!res.success || !res.data) {
      setMessage(res.error?.message ?? "建立付款連結失敗");
      return;
    }
    const form = document.createElement("form");
    form.method = res.data.method;
    form.action = res.data.action;
    Object.entries(res.data.fields).forEach(([n, v]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = n;
      input.value = v;
      form.append(input);
    });
    document.body.append(form);
    form.submit();
  }

  const credits = billing?.attendeeCredits ?? 0;
  const selectedTier = pricingTiers.find((t) => t.id === selectedTierId);

  return (
    <AdminShell>
      <div>
        <p className="text-sm font-bold text-orange">儲值</p>
        <h1 className="text-2xl font-bold">人次額度管理</h1>
      </div>

      {message && (
        <section className={`mt-5 rounded-lg border p-4 text-sm font-semibold ${
          message.includes("完成") ? "border-green-200 bg-green-50 text-green-700" : "border-orange/20 bg-orange/10"
        }`}>
          {message}
        </section>
      )}

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1fr]">
        {/* 餘額卡片 */}
        <section className="rounded-lg border border-charcoal/10 bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange/15 text-orange">
              <CreditCard size={20} />
            </span>
            <div>
              <h2 className="text-lg font-bold">目前人次額度</h2>
              <p className="text-sm text-charcoal/60">可用於創建活動的報到名額</p>
            </div>
            <button
              type="button"
              onClick={() => void loadBilling()}
              className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg border border-charcoal/15 hover:bg-paper"
            >
              <RefreshCcw size={14} />
            </button>
          </div>
          <div className="mt-5 flex items-end gap-2">
            <span className="text-5xl font-bold text-orange">{credits}</span>
            <span className="mb-1 text-lg font-semibold text-charcoal/60">人次</span>
          </div>
          <p className="mt-2 text-xs text-charcoal/50">
            創建活動時依設定的人數上限扣除，活動建立後不退回
          </p>
        </section>

        {/* 購買方案 */}
        <section className="rounded-lg border border-charcoal/10 bg-white p-5">
          <h2 className="text-lg font-bold">購買人次額度</h2>
          <p className="mt-1 text-sm text-charcoal/60">選擇方案後前往藍新金流付款</p>

          <div className="mt-4 space-y-2">
            {pricingTiers.map((tier) => (
              <label
                key={tier.id}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-3 text-sm transition-colors ${
                  selectedTierId === tier.id
                    ? "border-orange bg-orange/10"
                    : "border-charcoal/10 bg-paper hover:border-charcoal/20"
                }`}
              >
                <span>
                  <span className="block font-bold">{tier.label}</span>
                  <span className="text-xs text-charcoal/55">
                    {tier.attendeeCredits} 人次 · {tier.attendeeRange}
                  </span>
                </span>
                <span className="flex items-center gap-2 font-bold">
                  NT$ {tier.amount.toLocaleString()}
                  <input
                    type="radio"
                    name="pricingTier"
                    value={tier.id}
                    checked={selectedTierId === tier.id}
                    onChange={(e) => setSelectedTierId(e.target.value)}
                    className="accent-orange"
                  />
                </span>
              </label>
            ))}
          </div>

          {selectedTier && (
            <div className="mt-4 rounded-lg bg-paper p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-charcoal/60">購買人次</span>
                <span className="font-bold">{selectedTier.attendeeCredits} 人次</span>
              </div>
              <div className="mt-1 flex justify-between">
                <span className="text-charcoal/60">單價</span>
                <span className="font-semibold">
                  NT$ {(selectedTier.amount / selectedTier.attendeeCredits).toFixed(1)} / 人次
                </span>
              </div>
              <div className="mt-2 flex justify-between border-t border-charcoal/10 pt-2">
                <span className="font-semibold">總計</span>
                <span className="text-lg font-bold text-orange">
                  NT$ {selectedTier.amount.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          <button
            type="button"
            disabled={!token || isCheckingOut || pricingTiers.length === 0}
            onClick={() => void checkout()}
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-orange text-sm font-bold text-white disabled:opacity-40"
          >
            <CreditCard size={16} />
            {isCheckingOut ? "前往付款…" : "立即購買"}
          </button>
        </section>
      </div>

      {/* 付款紀錄 */}
      {billing && billing.recentPayments.length > 0 && (
        <section className="mt-5 rounded-lg border border-charcoal/10 bg-white p-5">
          <div className="flex items-center gap-2">
            <Receipt size={18} />
            <h2 className="text-lg font-bold">付款紀錄</h2>
          </div>
          <div className="mt-4 overflow-x-auto">
            <div className="min-w-[560px] overflow-hidden rounded-lg border border-charcoal/10">
              <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr] bg-cloud px-4 py-3 text-sm font-bold">
                <span>方案</span>
                <span>人次</span>
                <span>金額</span>
                <span>狀態</span>
                <span>日期</span>
              </div>
              {billing.recentPayments.map((p) => (
                <div
                  key={p.id}
                  className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr] items-center border-t border-charcoal/10 px-4 py-3 text-sm"
                >
                  <span className="font-semibold">{p.pricingTier ?? "—"}</span>
                  <span>{p.creditsGranted > 0 ? `+${p.creditsGranted}` : "—"}</span>
                  <span>NT$ {p.amountTotal?.toLocaleString() ?? "—"}</span>
                  <span className={`font-bold ${statusColor[p.status] ?? ""}`}>
                    {statusLabel[p.status] ?? p.status}
                  </span>
                  <span className="text-charcoal/60">{p.paidAt ? formatDate(p.paidAt) : formatDate(p.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </AdminShell>
  );
}
