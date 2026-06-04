"use client";

import type { BillingStatusDTO, EventDTO, RegistrationField } from "@monmate/types";
import { CalendarPlus, CreditCard, QrCode } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DateTimePicker } from "./DateTimePicker";
import { apiFetch } from "../lib/api";
import { AdminShell } from "./AdminShell";
import { CopyLink } from "./CopyLink";
import { RichEditor } from "./RichEditor";
import { RegistrationFieldsEditor } from "./RegistrationFieldsEditor";

function toDatetimeLocal(date: Date) {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

const CREDIT_PRESETS = [50, 100, 200, 500] as const;

export function AdminNewEventClient() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [origin, setOrigin] = useState("http://localhost:3000");
  const [credits, setCredits] = useState(0);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [startAt, setStartAt] = useState(() => toDatetimeLocal(new Date()));
  const [endAt, setEndAt] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [registrationRequired, setRegistrationRequired] = useState(false);
  const [regFields, setRegFields] = useState<RegistrationField[]>([]);
  const [selectedLimit, setSelectedLimit] = useState<number>(50);
  const [customLimit, setCustomLimit] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [createdEvent, setCreatedEvent] = useState<EventDTO | null>(null);
  const [message, setMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);

  const attendeeLimit = isCustom
    ? (parseInt(customLimit, 10) || 0)
    : selectedLimit;

  useEffect(() => {
    const storedToken = window.localStorage.getItem("monmate.token") ?? "";
    setToken(storedToken);
    setOrigin(window.location.origin);
    if (!storedToken) return;
    void apiFetch<BillingStatusDTO>("/billing/status", { token: storedToken }).then((res) => {
      if (res.success && res.data) setCredits(res.data.attendeeCredits);
    });
  }, []);

  async function createEvent() {
    if (!name.trim()) { setMessage("請輸入活動名稱"); return; }
    if (attendeeLimit <= 0) { setMessage("請設定有效的人數上限"); return; }

    if (attendeeLimit > credits) {
      setShowCreditModal(true);
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
        endAt: endAt ? new Date(endAt).toISOString() : undefined,
        location: location.trim() || undefined,
        description: description.trim() || undefined,
        content: content || undefined,
        attendeeLimit,
        registrationRequired,
        registrationFields: registrationRequired ? regFields : []
      })
    });
    setIsCreating(false);
    if (!response.success || !response.data) {
      setMessage(response.error?.message ?? "建立活動失敗");
      return;
    }
    setCreatedEvent(response.data);
    setCredits((prev) => prev - attendeeLimit);
    setMessage("活動已建立！");
    setName(""); setSlug(""); setLocation(""); setDescription(""); setContent("");
  }

  const checkInUrl = createdEvent ? `${origin}/event/${createdEvent.slug}/checkin` : "";

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
        <section className={`mt-5 rounded-lg border p-4 text-sm font-semibold ${
          message.includes("已建立") ? "border-green-200 bg-green-50 text-green-700" : "border-orange/20 bg-orange/10"
        }`}>
          {message}
        </section>
      )}

      {/* Credits 不足 modal */}
      {showCreditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange/15 text-orange">
              <CreditCard size={22} />
            </div>
            <h3 className="mt-4 text-lg font-bold">人次額度不足</h3>
            <p className="mt-2 text-sm text-charcoal/70">
              設定 <strong>{attendeeLimit}</strong> 人次，但目前只有 <strong>{credits}</strong> 個可用額度。
              需要前往儲值頁面購買更多人次。
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setShowCreditModal(false)}
                className="flex-1 rounded-lg border border-charcoal/15 py-2.5 text-sm font-semibold hover:bg-paper"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => router.push("/admin/billing")}
                className="flex-1 rounded-lg bg-orange py-2.5 text-sm font-bold text-white"
              >
                前往儲值
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-5 rounded-lg border border-charcoal/10 bg-white p-5">
        <div className="flex items-center gap-3 mb-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-mint/30">
            <CalendarPlus size={20} />
          </span>
          <div>
            <h2 className="text-lg font-bold">活動基本資料</h2>
            <p className="text-sm text-charcoal/60">
              目前剩餘 <span className="font-bold text-orange">{credits}</span> 人次額度
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold">
            活動名稱
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-charcoal/15 bg-paper px-3 outline-none focus:border-mint"
            />
          </label>
          <label className="text-sm font-semibold">
            活動 Slug（網址）
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="留空自動產生"
              className="mt-2 h-11 w-full rounded-lg border border-charcoal/15 bg-paper px-3 outline-none focus:border-mint"
            />
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
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-charcoal/15 bg-paper px-3 outline-none focus:border-mint"
            />
          </label>
        </div>

        <label className="mt-4 block text-sm font-semibold">
          簡短說明
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="mt-2 w-full rounded-lg border border-charcoal/15 bg-paper p-3 text-sm outline-none focus:border-mint"
          />
        </label>

        <div className="mt-4">
          <p className="mb-2 text-sm font-semibold">活動內容（一頁式網站）</p>
          <RichEditor value={content} onChange={setContent} placeholder="活動詳細說明、注意事項…" />
        </div>

        {/* 人數上限選擇 */}
        <div className="mt-5">
          <p className="mb-2 text-sm font-semibold">
            人數上限
            <span className="ml-2 text-xs font-normal text-charcoal/55">（建立活動時從額度扣除）</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {CREDIT_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => { setIsCustom(false); setSelectedLimit(preset); }}
                className={`h-10 rounded-lg border px-4 text-sm font-bold transition-colors ${
                  !isCustom && selectedLimit === preset
                    ? "border-orange bg-orange/10 text-orange"
                    : "border-charcoal/15 bg-paper hover:border-charcoal/30"
                }`}
              >
                {preset} 人
              </button>
            ))}
            <button
              type="button"
              onClick={() => setIsCustom(true)}
              className={`h-10 rounded-lg border px-4 text-sm font-bold transition-colors ${
                isCustom
                  ? "border-orange bg-orange/10 text-orange"
                  : "border-charcoal/15 bg-paper hover:border-charcoal/30"
              }`}
            >
              自訂
            </button>
          </div>
          {isCustom && (
            <input
              type="number"
              value={customLimit}
              onChange={(e) => setCustomLimit(e.target.value)}
              placeholder="輸入人數（最少 1 人）"
              min={1}
              className="mt-2 h-11 w-48 rounded-lg border border-charcoal/15 bg-paper px-3 text-sm outline-none focus:border-mint"
            />
          )}
          {credits > 0 && attendeeLimit > 0 && (
            <p className={`mt-2 text-xs font-semibold ${attendeeLimit > credits ? "text-red-500" : "text-charcoal/55"}`}>
              {attendeeLimit > credits
                ? `⚠ 額度不足（需要 ${attendeeLimit}，剩餘 ${credits}）`
                : `扣除後剩餘 ${credits - attendeeLimit} 人次`
              }
            </p>
          )}
        </div>

        {/* 報名欄位 */}
        <div className="mt-5">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={registrationRequired}
              onChange={(e) => setRegistrationRequired(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded accent-orange"
            />
            <div>
              <p className="text-sm font-semibold">需要填寫報名資訊才能取得 QR Code</p>
              <p className="mt-0.5 text-xs text-charcoal/55">受邀者填寫完成後才會顯示 QR Code</p>
            </div>
          </label>

          {registrationRequired && (
            <div className="mt-3 ml-6">
              <RegistrationFieldsEditor fields={regFields} onChange={setRegFields} />
            </div>
          )}
        </div>

        <button
          type="button"
          disabled={!token || isCreating}
          onClick={() => void createEvent()}
          className="mt-5 flex h-11 items-center gap-2 rounded-lg bg-orange px-4 text-sm font-bold text-white disabled:opacity-40"
        >
          <CalendarPlus size={18} />
          {isCreating ? "建立中..." : "建立活動"}
        </button>
      </div>

      {/* 建立後的連結 */}
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
