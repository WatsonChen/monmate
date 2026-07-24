"use client";

import type { BillingStatusDTO, EventDTO, RegistrationField } from "@monmate/types";
import { CalendarPlus, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DateTimePicker } from "./DateTimePicker";
import { apiFetch } from "../lib/api";
import { LogoUploadField } from "./LogoUploadField";
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
  const [credits, setCredits] = useState(0);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [startAt, setStartAt] = useState(() => toDatetimeLocal(new Date()));
  const [endAt, setEndAt] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [registrationRequired, setRegistrationRequired] = useState(false);
  const [openRegistration, setOpenRegistration] = useState(false);
  const [allowOverCapacity, setAllowOverCapacity] = useState(false);
  const [selfCheckInBufferMinutes, setSelfCheckInBufferMinutes] = useState("");
  const [regFields, setRegFields] = useState<RegistrationField[]>([]);
  const [selectedLimit, setSelectedLimit] = useState<number>(50);
  const [customLimit, setCustomLimit] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [message, setMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const attendeeLimit = isCustom
    ? (parseInt(customLimit, 10) || 0)
    : selectedLimit;

  useEffect(() => {
    const storedToken = window.localStorage.getItem("monmate.token") ?? "";
    setToken(storedToken);
    if (!storedToken) return;
    void apiFetch<BillingStatusDTO>("/billing/status", { token: storedToken }).then((res) => {
      if (res.success && res.data) setCredits(res.data.attendeeCredits);
    });
  }, []);

  async function createEvent() {
    if (!name.trim()) { setMessage("請輸入活動名稱"); return; }
    if (attendeeLimit <= 0) { setMessage("請設定有效的人數上限"); return; }

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
        logoUrl: logoUrl || undefined,
        attendeeLimit,
        allowOverCapacity,
        registrationRequired,
        openRegistration,
        selfCheckInBufferMinutes: selfCheckInBufferMinutes.trim() === "" ? undefined : parseInt(selfCheckInBufferMinutes, 10),
        registrationFields: registrationRequired ? regFields : []
      })
    });
    setIsCreating(false);
    if (!response.success || !response.data) {
      setMessage(response.error?.message ?? "建立活動失敗");
      return;
    }
    const ev = response.data;
    router.push(`/admin/events/${ev.id}?created=1`);
  }


  return (
    <>
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
            <span className="flex items-center gap-1.5">
              活動網址代號
              <div className="group relative inline-flex">
                <Info size={13} className="text-charcoal/40 cursor-help" />
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-64 -translate-x-1/2 rounded-lg bg-charcoal p-3 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                  <p className="text-white/80">會用於報到連結，例如 /event/你的代號/checkin</p>
                </div>
              </div>
            </span>
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
          <LogoUploadField value={logoUrl} onChange={setLogoUrl} token={token} />
        </div>

        <div className="mt-4">
          <p className="mb-2 text-sm font-semibold">活動內容（一頁式網站）</p>
          <RichEditor value={content} onChange={setContent} placeholder="活動流程、講者陣容、交通資訊、注意事項…寫得越完整，越能提高報名意願" />
        </div>

        {/* 人數上限選擇 */}
        <div className="mt-5">
          <p className="mb-2 text-sm font-semibold">
            人數上限
            <span className="ml-2 text-xs font-normal text-charcoal/55">（僅作為報名容量上限，實際扣點依新增/匯入的報名人數計算）</span>
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

        {/* 公開報名開關 */}
        <div className="mt-4">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={openRegistration}
              onChange={(e) => setOpenRegistration(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded accent-orange"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold">開放公開報名</p>
                <div className="group relative inline-flex">
                  <Info size={13} className="text-charcoal/40 cursor-help" />
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-64 -translate-x-1/2 rounded-lg bg-charcoal p-3 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                    <p className="font-semibold mb-1">開啟：公開報名</p>
                    <p className="text-white/80 mb-2">活動頁面會顯示「我要報名」按鈕，任何收到連結的人都能直接報名。</p>
                    <p className="font-semibold mb-1">關閉：純展示頁面</p>
                    <p className="text-white/80">頁面僅供受邀者查看活動資訊，無法自行報名。</p>
                  </div>
                </div>
              </div>
              <p className="mt-0.5 text-xs text-charcoal/55">開啟後，收到連結的人可直接在活動頁面報名</p>
            </div>
          </label>
        </div>

        {/* 允許超額報名開關 */}
        <div className="mt-4">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={allowOverCapacity}
              onChange={(e) => setAllowOverCapacity(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded accent-orange"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold">允許超額報名</p>
                <div className="group relative inline-flex">
                  <Info size={13} className="text-charcoal/40 cursor-help" />
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-64 -translate-x-1/2 rounded-lg bg-charcoal p-3 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                    <p className="font-semibold mb-1">開啟：允許超過人數上限</p>
                    <p className="text-white/80 mb-2">超過上限仍可繼續報名，超出的人頭費用照常計入額度（可先超支、之後補繳）。</p>
                    <p className="font-semibold mb-1">關閉：達上限即停止</p>
                    <p className="text-white/80">報名人頭達到人數上限後，新增／匯入／公開報名都會被擋下。</p>
                  </div>
                </div>
              </div>
              <p className="mt-0.5 text-xs text-charcoal/55">關閉時達人數上限即停止收單；開啟則允許超額（費用候補）</p>
            </div>
          </label>
        </div>

        {/* 自助報到開放時間 */}
        <div className="mt-4">
          <label className="text-sm font-semibold">
            <span className="flex items-center gap-1.5">
              自助報到開放時間
              <div className="group relative inline-flex">
                <Info size={13} className="text-charcoal/40 cursor-help" />
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-72 -translate-x-1/2 rounded-lg bg-charcoal p-3 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                  <p className="text-white/80">
                    留空：不限制，來賓隨時可自助報到（預設）
                  </p>
                  <p className="mt-1 text-white/80">
                    設定 0：活動開始時間到才能報到
                  </p>
                  <p className="mt-1 text-white/80">
                    設定 30：開始前 30 分鐘開放報到
                  </p>
                </div>
              </div>
            </span>
            <input
              type="number"
              min={0}
              value={selfCheckInBufferMinutes}
              onChange={(e) => setSelfCheckInBufferMinutes(e.target.value)}
              placeholder="留空 = 不限制；0 = 開始才能報到"
              className="mt-2 h-11 w-full max-w-xs rounded-lg border border-charcoal/15 bg-paper px-3 outline-none focus:border-mint sm:w-48"
            />
          </label>
          <p className="mt-1 text-xs text-charcoal/55">僅影響來賓自助報到，工作人員現場報到不受限制</p>
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

    </>
  );
}