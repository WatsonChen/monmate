"use client";

import type {
  BillingStatusDTO,
  CheckoutSessionDTO,
  EventDTO,
  PricingTierDTO
} from "@monmate/types";
import { CalendarPlus, CreditCard, QrCode, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { DateTimePicker } from "./DateTimePicker";
import { apiFetch } from "../lib/api";
import { AdminShell } from "./AdminShell";
import { CopyLink } from "./CopyLink";
import { RichEditor } from "./RichEditor";

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
  const [endAt, setEndAt] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [registrationRequired, setRegistrationRequired] = useState(false);
  const [regFields, setRegFields] = useState({
    email: false, emailRequired: false,
    age: false, ageRequired: false,
    gender: false, genderRequired: false
  });
  const [createdEvent, setCreatedEvent] = useState<EventDTO | null>(null);
  const [message, setMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  async function loadBilling(nextToken = token) {
    if (!nextToken) return;
    const response = await apiFetch<BillingStatusDTO>("/billing/status", { token: nextToken });
    if (response.success && response.data) setBilling(response.data);
  }

  async function loadPricingTiers(nextToken = token) {
    if (!nextToken) return;
    const response = await apiFetch<PricingTierDTO[]>("/billing/pricing-tiers", { token: nextToken });
    if (response.success && response.data) {
      setPricingTiers(response.data);
      setSelectedTierId(response.data[0]?.id ?? "SMALL");
    }
  }

  useEffect(() => {
    const storedToken = window.localStorage.getItem("monmate.token") ?? "";
    setToken(storedToken);
    setOrigin(window.location.origin);
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") setMessage("付款完成！人次額度已入帳。");
    if (params.get("payment") === "cancelled") setMessage("付款已取消。");
    void loadBilling(storedToken);
    void loadPricingTiers(storedToken);
  }, []);

  async function createEvent() {
    if (!name.trim()) { setMessage("請輸入活動名稱"); return; }
    setIsCreating(true);
    setMessage("");
    const response = await apiFetch<EventDTO>("/events", {
      method: "POST",
      token,
      body: JSON.stringify({
        name: name.trim(),
        slug: slug.trim() || undefined,
        startAt: new Date(startAt).toISOString(),
        endAt: endAt ? new Date(endAt).toISOString() : undefined,
        location: location.trim() || undefined,
        description: description.trim() || undefined,
        content: content || undefined,
        registrationRequired,
        registrationFields: registrationRequired ? [
          ...(regFields.email ? [{ key: "email" as const, required: regFields.emailRequired }] : []),
          ...(regFields.age ? [{ key: "age" as const, required: regFields.ageRequired }] : []),
          ...(regFields.gender ? [{ key: "gender" as const, required: regFields.genderRequired }] : [])
        ] : []
      })
    });
    setIsCreating(false);
    if (!response.success || !response.data) { setMessage(response.error?.message ?? "建立活動失敗"); return; }
    setCreatedEvent(response.data);
    setMessage("活動已建立！");
    setName(""); setSlug(""); setLocation(""); setDescription(""); setContent("");
  }

  async function checkout() {
    setIsCheckingOut(true);
    setMessage("");
    const response = await apiFetch<CheckoutSessionDTO>("/billing/checkout-session", {
      method: "POST",
      token,
      body: JSON.stringify({ tierId: selectedTierId })
    });
    setIsCheckingOut(false);
    if (!response.success || !response.data) { setMessage(response.error?.message ?? "建立付款連結失敗"); return; }
    const form = document.createElement("form");
    form.method = response.data.method;
    form.action = response.data.action;
    Object.entries(response.data.fields).forEach(([n, v]) => {
      const input = document.createElement("input");
      input.type = "hidden"; input.name = n; input.value = v;
      form.append(input);
    });
    document.body.append(form);
    form.submit();
  }

  const checkInUrl = createdEvent ? `${origin}/event/${createdEvent.slug}/checkin` : "";
  const credits = billing?.attendeeCredits ?? 0;
  const selectedTier = pricingTiers.find((t) => t.id === selectedTierId);

  return (
    <AdminShell>
      <div>
        <p className="text-sm font-bold text-orange">新增活動</p>
        <h1 className="text-2xl font-bold">建立活動並產生報到 URL</h1>
      </div>

      {!token && (
        <section className="mt-5 rounded-lg border border-charcoal/10 bg-white p-5">
          <p className="text-sm font-semibold text-charcoal/70">請先登入後台。</p>
        </section>
      )}

      {message && (
        <section className="mt-5 rounded-lg border border-orange/20 bg-orange/10 p-4 text-sm font-semibold">
          {message}
        </section>
      )}

      <section className="mt-5 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-lg border border-charcoal/10 bg-white p-5">
          <div className="flex items-center gap-3 mb-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-mint/30">
              <CalendarPlus size={20} />
            </span>
            <div>
              <h2 className="text-lg font-bold">活動基本資料</h2>
              <p className="text-sm text-charcoal/60">建立活動免費，匯入名單時扣除人次額度</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              活動名稱
              <input value={name} onChange={(e) => setName(e.target.value)}
                className="mt-2 h-11 w-full rounded-lg border border-charcoal/15 bg-paper px-3 outline-none focus:border-mint accent-orange" />
            </label>
            <label className="text-sm font-semibold">
              活動 Slug（網址）
              <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="留空自動產生"
                className="mt-2 h-11 w-full rounded-lg border border-charcoal/15 bg-paper px-3 outline-none focus:border-mint accent-orange" />
            </label>
            <label className="text-sm font-semibold">
              開始時間
              <DateTimePicker value={startAt} onChange={setStartAt} />
            </label>
            <label className="text-sm font-semibold">
              結束時間
              <DateTimePicker value={endAt} onChange={setEndAt} placeholder="選擇結束時間（選填）" />
            </label>
            <label className="sm:col-span-2 text-sm font-semibold">
              地點
              <input value={location} onChange={(e) => setLocation(e.target.value)}
                className="mt-2 h-11 w-full rounded-lg border border-charcoal/15 bg-paper px-3 outline-none focus:border-mint accent-orange" />
            </label>
          </div>

          <label className="mt-4 block text-sm font-semibold">
            簡短說明
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
              className="mt-2 w-full rounded-lg border border-charcoal/15 bg-paper p-3 text-sm outline-none focus:border-mint" />
          </label>

          <div className="mt-4">
            <p className="mb-2 text-sm font-semibold">活動內容（一頁式網站）</p>
            <RichEditor value={content} onChange={setContent} placeholder="活動詳細說明、注意事項…" />
          </div>

          <div className="mt-4">
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" checked={registrationRequired}
                onChange={(e) => setRegistrationRequired(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded accent-orange" />
              <div>
                <p className="text-sm font-semibold">需要填寫報名資訊才能取得 QR Code</p>
                <p className="mt-0.5 text-xs text-charcoal/55">發送報到簡訊時附上報名表連結；受邀者填寫完成後才會顯示 QR Code</p>
              </div>
            </label>

            {registrationRequired && (
              <div className="mt-3 ml-6 rounded-lg border border-charcoal/10 bg-paper p-4 space-y-2">
                <p className="text-xs font-bold text-charcoal/60 mb-3">額外收集的欄位（姓名、手機永遠必填）</p>
                {([
                  { key: "email", label: "電子郵件", field: "email" as const, reqField: "emailRequired" as const },
                  { key: "age", label: "年齡", field: "age" as const, reqField: "ageRequired" as const },
                  { key: "gender", label: "性別", field: "gender" as const, reqField: "genderRequired" as const }
                ]).map(({ key, label, field, reqField }) => (
                  <div key={key} className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold">
                      <input type="checkbox"
                        checked={regFields[field]}
                        onChange={(e) => setRegFields((p) => ({ ...p, [field]: e.target.checked, ...(e.target.checked ? {} : { [reqField]: false }) }))}
                        className="h-4 w-4 rounded accent-orange" />
                      {label}
                    </label>
                    {regFields[field] && (
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-charcoal/60">
                        <input type="checkbox"
                          checked={regFields[reqField]}
                          onChange={(e) => setRegFields((p) => ({ ...p, [reqField]: e.target.checked }))}
                          className="h-3.5 w-3.5 rounded accent-orange" />
                        必填
                      </label>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="button" disabled={!token || isCreating} onClick={() => void createEvent()}
            className="mt-5 flex h-11 items-center gap-2 rounded-lg bg-orange px-4 text-sm font-bold text-white disabled:opacity-40">
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
              <h2 className="text-lg font-bold">人次額度儲值</h2>
              <p className="text-sm text-charcoal/60">剩餘 {credits} 人次</p>
            </div>
          </div>
          <div className="mt-5 rounded-lg border border-dashed border-charcoal/20 bg-paper p-4">
            <p className="text-sm font-semibold text-charcoal/60 mb-3">購買人次額度，匯入報名名單時扣除</p>
            <div className="space-y-2">
              {pricingTiers.map((tier) => (
                <label key={tier.id} className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm ${
                  selectedTierId === tier.id ? "border-orange bg-orange/10" : "border-charcoal/10 bg-white"
                }`}>
                  <span>
                    <span className="block font-bold">{tier.label}</span>
                    <span className="text-xs text-charcoal/55">{tier.attendeeRange}</span>
                  </span>
                  <span className="flex items-center gap-2 font-bold">
                    NT$ {tier.amount}
                    <input type="radio" name="pricingTier" value={tier.id}
                      checked={selectedTierId === tier.id}
                      onChange={(e) => setSelectedTierId(e.target.value)}
                      className="accent-orange" />
                  </span>
                </label>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <button type="button" disabled={!token || isCheckingOut} onClick={() => void checkout()}
                className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-orange text-xs font-bold text-white disabled:opacity-40">
                <CreditCard size={14} />
                {isCheckingOut ? "前往付款..." : "購買額度"}
              </button>
              <button type="button" disabled={!token} onClick={() => void loadBilling()}
                className="flex h-9 items-center gap-1.5 rounded-lg border border-charcoal/15 bg-white px-3 text-xs font-bold disabled:opacity-50">
                <RefreshCcw size={14} />
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
            <p className="text-sm text-charcoal/60">{createdEvent ? createdEvent.name : "建立活動後會在這裡出現"}</p>
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
