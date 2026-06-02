"use client";

import type {
  BillingStatusDTO,
  CheckoutSessionDTO,
  EventDTO,
  PricingTierDTO
} from "@monmate/types";
import {
  CalendarPlus,
  CreditCard,
  QrCode,
  RefreshCcw
} from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { AdminShell } from "./AdminShell";
import { CopyLink } from "./CopyLink";

function toDatetimeLocal(date: Date) {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function AdminNewEventClient() {
  const [token, setToken] = useState("");
  const [origin, setOrigin] = useState("http://localhost:3000");
  const [billing, setBilling] = useState<BillingStatusDTO | null>(null);
  const [pricingTiers, setPricingTiers] = useState<PricingTierDTO[]>([]);
  const [selectedTierId, setSelectedTierId] = useState("SMALL");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [startAt, setStartAt] = useState(() => toDatetimeLocal(new Date()));
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [createdEvent, setCreatedEvent] = useState<EventDTO | null>(null);
  const [message, setMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  async function loadBilling(nextToken = token) {
    if (!nextToken) {
      return;
    }

    const response = await apiFetch<BillingStatusDTO>("/billing/status", {
      token: nextToken
    });

    if (!response.success || !response.data) {
      setMessage(response.error?.message ?? "讀取儲值狀態失敗");
      return;
    }

    setBilling(response.data);
  }

  async function loadPricingTiers(nextToken = token) {
    if (!nextToken) {
      return;
    }

    const response = await apiFetch<PricingTierDTO[]>("/billing/pricing-tiers", {
      token: nextToken
    });

    if (!response.success || !response.data) {
      setMessage(response.error?.message ?? "讀取價格方案失敗");
      return;
    }

    setPricingTiers(response.data);
    setSelectedTierId(response.data[0]?.id ?? "SMALL");
  }

  useEffect(() => {
    const storedToken = window.localStorage.getItem("monmate.token") ?? "";
    setToken(storedToken);
    setOrigin(window.location.origin);

    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      setMessage("付款完成，正在確認入帳狀態。");
    }
    if (params.get("payment") === "cancelled") {
      setMessage("付款已取消。");
    }

    void loadBilling(storedToken);
    void loadPricingTiers(storedToken);
  }, []);

  async function createEvent() {
    if (!name.trim()) {
      setMessage("請輸入活動名稱");
      return;
    }

    setIsCreating(true);
    setMessage("");

    const response = await apiFetch<EventDTO>("/events", {
      method: "POST",
      token,
      body: JSON.stringify({
        name: name.trim(),
        slug: slug.trim() || undefined,
        startAt: new Date(startAt).toISOString(),
        location: location.trim() || undefined,
        description: description.trim() || undefined
      })
    });

    setIsCreating(false);

    if (!response.success || !response.data) {
      setMessage(response.error?.message ?? "建立活動失敗");
      return;
    }

    setCreatedEvent(response.data);
    setMessage("活動已建立，已扣除 1 個可建立場次。");
    setName("");
    setSlug("");
    setLocation("");
    setDescription("");
    await loadBilling();
  }

  async function checkout() {
    setIsCheckingOut(true);
    setMessage("");

    const response = await apiFetch<CheckoutSessionDTO>(
      "/billing/checkout-session",
      {
        method: "POST",
        token,
        body: JSON.stringify({ tierId: selectedTierId })
      }
    );

    setIsCheckingOut(false);

    if (!response.success || !response.data) {
      setMessage(response.error?.message ?? "建立付款連結失敗");
      return;
    }

    const form = document.createElement("form");
    form.method = response.data.method;
    form.action = response.data.action;

    Object.entries(response.data.fields).forEach(([name, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.append(input);
    });

    document.body.append(form);
    form.submit();
  }

  const checkInUrl = createdEvent
    ? `${origin}/event/${createdEvent.slug}/checkin`
    : "";
  const credits = billing?.eventCredits ?? 0;
  const selectedTier = pricingTiers.find((tier) => tier.id === selectedTierId);

  return (
    <AdminShell>
      <div>
        <p className="text-sm font-bold text-orange">新增活動</p>
        <h1 className="text-2xl font-bold">建立活動並產生報到 URL</h1>
      </div>

      {!token ? (
        <section className="mt-5 rounded-lg border border-charcoal/10 bg-white p-5">
          <p className="text-sm font-semibold text-charcoal/70">請先登入後台。</p>
        </section>
      ) : null}

      {message ? (
        <section className="mt-5 rounded-lg border border-orange/20 bg-orange/10 p-4 text-sm font-semibold">
          {message}
        </section>
      ) : null}

      <section className="mt-5 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-lg border border-charcoal/10 bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-mint/30">
              <CalendarPlus size={20} />
            </span>
            <div>
              <h2 className="text-lg font-bold">活動基本資料</h2>
              <p className="text-sm text-charcoal/60">剩餘可建立場次：{credits}</p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              活動名稱
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-2 h-11 w-full rounded-lg border border-charcoal/15 bg-paper px-3 outline-none focus:border-mint"
              />
            </label>
            <label className="text-sm font-semibold">
              活動 Slug
              <input
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                className="mt-2 h-11 w-full rounded-lg border border-charcoal/15 bg-paper px-3 outline-none focus:border-mint"
              />
            </label>
            <label className="text-sm font-semibold">
              開始時間
              <input
                type="datetime-local"
                value={startAt}
                onChange={(event) => setStartAt(event.target.value)}
                className="mt-2 h-11 w-full rounded-lg border border-charcoal/15 bg-paper px-3 outline-none focus:border-mint"
              />
            </label>
            <label className="text-sm font-semibold">
              地點
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className="mt-2 h-11 w-full rounded-lg border border-charcoal/15 bg-paper px-3 outline-none focus:border-mint"
              />
            </label>
          </div>
          <label className="mt-4 block text-sm font-semibold">
            活動描述
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="mt-2 min-h-24 w-full rounded-lg border border-charcoal/15 bg-paper p-3 text-sm outline-none focus:border-mint"
            />
          </label>
          <button
            type="button"
            disabled={!token || isCreating || credits <= 0}
            onClick={createEvent}
            className="mt-5 flex h-11 items-center gap-2 rounded-lg bg-orange px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-charcoal/25"
          >
            <CalendarPlus size={18} />
            {isCreating ? "建立中..." : "建立活動"}
          </button>
        </div>

        <div className="rounded-lg border border-charcoal/10 bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange/15 text-orange">
              <CreditCard size={20} />
            </span>
            <div>
              <h2 className="text-lg font-bold">單場儲值</h2>
              <p className="text-sm text-charcoal/60">目前可建立 {credits} 場</p>
            </div>
          </div>
          <div className="mt-5 rounded-lg border border-dashed border-charcoal/20 bg-paper p-5 text-center">
            <p className="text-2xl font-bold">單場活動</p>
            <p className="mt-1 text-sm font-semibold text-charcoal/60">
              {selectedTier
                ? `${selectedTier.attendeeRange} · NT$ ${selectedTier.amount}`
                : "建立活動權限"}
            </p>
            <div className="mt-4 grid gap-2 text-left">
              {pricingTiers.map((tier) => (
                <label
                  key={tier.id}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-3 text-sm ${
                    selectedTierId === tier.id
                      ? "border-orange bg-orange/10"
                      : "border-charcoal/10 bg-white"
                  }`}
                >
                  <span>
                    <span className="block font-bold">{tier.label}</span>
                    <span className="mt-1 block font-semibold text-charcoal/55">
                      {tier.attendeeRange}
                    </span>
                  </span>
                  <span className="flex items-center gap-2 font-bold">
                    NT$ {tier.amount}
                    <input
                      type="radio"
                      name="pricingTier"
                      value={tier.id}
                      checked={selectedTierId === tier.id}
                      onChange={(event) => setSelectedTierId(event.target.value)}
                    />
                  </span>
                </label>
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                disabled={!token || isCheckingOut}
                onClick={checkout}
                className="flex h-10 items-center justify-center gap-2 rounded-lg bg-orange px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-charcoal/25"
              >
                <CreditCard size={16} />
                {isCheckingOut ? "前往付款..." : "儲值建立"}
              </button>
              <button
                type="button"
                disabled={!token}
                onClick={() => void loadBilling()}
                className="flex h-10 items-center justify-center gap-2 rounded-lg border border-charcoal/15 bg-white px-4 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCcw size={16} />
                更新狀態
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-lg border border-charcoal/10 bg-white p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-mint/30">
            <QrCode size={20} />
          </span>
          <div>
            <h2 className="text-lg font-bold">建立後的報到連結</h2>
            <p className="text-sm text-charcoal/60">
              {createdEvent ? createdEvent.name : "建立活動後會在這裡出現"}
            </p>
          </div>
        </div>
        <div className="mt-5">
          {checkInUrl ? (
            <CopyLink value={checkInUrl} />
          ) : (
            <div className="rounded-lg border border-dashed border-charcoal/20 bg-paper p-5 text-sm font-semibold text-charcoal/55">
              尚未建立活動
            </div>
          )}
        </div>
      </section>
    </AdminShell>
  );
}
