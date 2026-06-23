"use client";

import { type CSSProperties, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import type { RegistrationField } from "@monmate/types";
import { apiFetch } from "../lib/api";
import { BrandLogo } from "./BrandLogo";
import { DotsLoading } from "./DotsLoading";

const PRESET_KEYS = ["email", "age", "gender"] as const;

type Props = {
  event: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    content?: string | null;
    startAt: string;
    endAt?: string | null;
    location?: string | null;
    registrationFields: RegistrationField[];
  };
  attendee: {
    id: string;
    name: string;
    phone: string;
    checkInStatus: string;
  } | null;
  token: string;
};

const genderOptions = [
  { value: "M", label: "男" },
  { value: "F", label: "女" },
  { value: "OTHER", label: "其他" }
];

export function EventRegisterClient({ event, attendee, token }: Props) {
  const router = useRouter();
  const [name, setName] = useState(attendee?.name ?? "");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const fields = event.registrationFields ?? [];
  const presetMap = Object.fromEntries(
    PRESET_KEYS.map((k) => [k, fields.find((f) => f.key === k) ?? null])
  );
  const customFields = fields.filter((f) => !PRESET_KEYS.includes(f.key as typeof PRESET_KEYS[number]));

  async function submit() {
    if (!name.trim()) { setError("請填寫姓名"); return; }
    if (presetMap.email?.required && !email.trim()) { setError("請填寫電子郵件"); return; }
    if (presetMap.age?.required && !age) { setError("請填寫年齡"); return; }
    if (presetMap.gender?.required && !gender) { setError("請選擇性別"); return; }
    for (const f of customFields) {
      if (f.required && !customValues[f.key]?.trim()) {
        setError(`請填寫「${f.label ?? f.key}」`);
        return;
      }
    }

    setIsSubmitting(true);
    setError("");
    try {
      const customPayload: Record<string, string | number> = {};
      for (const [k, v] of Object.entries(customValues)) {
        const field = customFields.find((f) => f.key === k);
        if (!field || !v.trim()) continue;
        customPayload[k] = field.type === "number" ? Number(v) : v.trim();
      }

      const res = await apiFetch(
        `/events/${event.id}/attendees/register`,
        {
          method: "POST",
          body: JSON.stringify({
            token,
            name: name.trim(),
            email: email.trim() || undefined,
            age: age ? Number(age) : undefined,
            gender: gender || undefined,
            customFields: Object.keys(customPayload).length > 0 ? customPayload : undefined
          })
        }
      );
      if (!res.success) { setError(res.error?.message ?? "報名失敗，請稍後再試"); return; }
      setDone(true);
      setTimeout(() => router.push(`/event/${event.slug}/ticket?token=${token}`), 1800);
    } catch {
      setError("無法連線，請稍後再試");
    } finally {
      setIsSubmitting(false);
    }
  }

  const startDate = new Date(event.startAt);

  if (done) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-5">
        <div className="relative w-full overflow-hidden rounded-xl border border-charcoal/10 bg-white px-5 py-12 text-center shadow-soft">
          <span className="success-firework left-7 top-40" style={{ "--rotate": "-44deg" } as CSSProperties} />
          <span className="success-firework right-9 top-36" style={{ "--delay": "0.45s", "--rotate": "40deg" } as CSSProperties} />
          <div className="relative z-10">
            <BrandLogo variant="horizontal" className="mx-auto h-16 w-48 object-contain" />
            <div className="mx-auto mt-8 flex h-28 w-28 items-center justify-center rounded-full bg-mint shadow-soft">
              <Check className="text-white" size={68} strokeWidth={2.6} />
            </div>
            <h2 className="mt-6 text-3xl font-bold">報名完成！</h2>
            <p className="mt-2 text-sm font-semibold text-charcoal/60">正在前往您的入場票券…</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-paper pb-10">
      {/* 活動資訊 */}
      <div className="border-b border-charcoal/10 bg-white px-4 py-6">
        <div className="mx-auto max-w-lg">
          <BrandLogo variant="horizontal" className="h-10 w-32 object-contain object-left" />
          <h1 className="mt-4 text-2xl font-bold">{event.name}</h1>
          <div className="mt-2 flex flex-col gap-1 text-sm text-charcoal/60">
            <span>
              📅 {startDate.toLocaleString("zh-TW", { year: "numeric", month: "long", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit" })}
            </span>
            {event.endAt && (
              <span>⏰ 結束 {new Date(event.endAt).toLocaleString("zh-TW", { hour: "2-digit", minute: "2-digit" })}</span>
            )}
            {event.location && <span>📍 {event.location}</span>}
          </div>
          {event.description && (
            <p className="mt-3 text-sm leading-relaxed text-charcoal/70">{event.description}</p>
          )}
        </div>
      </div>

      {event.content && (
        <div className="border-b border-charcoal/10 bg-white px-4 py-6">
          <div
            className="prose prose-sm mx-auto max-w-lg"
            dangerouslySetInnerHTML={{ __html: event.content }}
          />
        </div>
      )}

      {/* 報名表單 */}
      <div className="mx-auto mt-4 max-w-lg px-4">
        <div className="rounded-xl border border-charcoal/10 bg-white p-5 shadow-soft">
          <h2 className="text-lg font-bold">填寫報名資料</h2>
          <p className="mt-0.5 text-xs text-charcoal/50">填寫完成後即可取得入場 QR Code</p>

          <div className="mt-5 space-y-4">
            {/* 姓名（永遠必填） */}
            <label className="block text-sm font-semibold">
              姓名 <span className="text-orange">*</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 h-11 w-full rounded-lg border border-charcoal/15 bg-paper px-3 outline-none focus:border-mint"
                placeholder="請輸入姓名"
              />
            </label>

            {/* Email */}
            {presetMap.email && (
              <label className="block text-sm font-semibold">
                電子郵件 {presetMap.email.required && <span className="text-orange">*</span>}
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 h-11 w-full rounded-lg border border-charcoal/15 bg-paper px-3 outline-none focus:border-mint"
                  placeholder="example@email.com"
                />
              </label>
            )}

            {/* 年齡 */}
            {presetMap.age && (
              <label className="block text-sm font-semibold">
                年齡 {presetMap.age.required && <span className="text-orange">*</span>}
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="mt-2 h-11 w-full rounded-lg border border-charcoal/15 bg-paper px-3 outline-none focus:border-mint"
                  placeholder="請輸入年齡"
                />
              </label>
            )}

            {/* 性別 */}
            {presetMap.gender && (
              <div className="text-sm font-semibold">
                性別 {presetMap.gender.required && <span className="text-orange">*</span>}
                <div className="mt-2 flex gap-3">
                  {genderOptions.map((opt) => (
                    <label key={opt.value} className={`flex flex-1 cursor-pointer items-center justify-center rounded-lg border py-2.5 text-sm font-semibold transition-colors ${
                      gender === opt.value ? "border-orange bg-orange/10 text-orange" : "border-charcoal/15 bg-paper"
                    }`}>
                      <input
                        type="radio"
                        name="gender"
                        value={opt.value}
                        checked={gender === opt.value}
                        onChange={() => setGender(opt.value)}
                        className="sr-only"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* 自訂欄位 */}
            {customFields.map((f) => {
              const label = f.label ?? f.key;
              const val = customValues[f.key] ?? "";
              const setVal = (v: string) => setCustomValues((prev) => ({ ...prev, [f.key]: v }));

              if (f.type === "select" && f.options && f.options.length > 0) {
                return (
                  <div key={f.key} className="text-sm font-semibold">
                    {label} {f.required && <span className="text-orange">*</span>}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {f.options.map((opt) => (
                        <label key={opt} className={`flex cursor-pointer items-center rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                          val === opt ? "border-orange bg-orange/10 text-orange" : "border-charcoal/15 bg-paper"
                        }`}>
                          <input type="radio" name={f.key} value={opt} checked={val === opt} onChange={() => setVal(opt)} className="sr-only" />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <label key={f.key} className="block text-sm font-semibold">
                  {label} {f.required && <span className="text-orange">*</span>}
                  <input
                    type={f.type === "number" ? "number" : "text"}
                    value={val}
                    onChange={(e) => setVal(e.target.value)}
                    className="mt-2 h-11 w-full rounded-lg border border-charcoal/15 bg-paper px-3 outline-none focus:border-mint"
                    placeholder={`請輸入${label}`}
                  />
                </label>
              );
            })}
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>
          )}

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => void submit()}
            className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-orange text-base font-bold text-white shadow-soft disabled:opacity-50"
          >
            {isSubmitting ? <>送出中<DotsLoading /></> : "完成報名，取得入場票券"}
          </button>
        </div>
      </div>
    </main>
  );
}
