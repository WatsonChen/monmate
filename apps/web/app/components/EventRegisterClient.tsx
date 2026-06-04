"use client";

import { type CSSProperties, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { apiFetch } from "../lib/api";
import { BrandLogo } from "./BrandLogo";

type RegistrationField = { key: "email" | "age" | "gender"; required: boolean };

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const fields = event.registrationFields ?? [];
  const showEmail = fields.some((f) => f.key === "email");
  const showAge = fields.some((f) => f.key === "age");
  const showGender = fields.some((f) => f.key === "gender");
  const emailRequired = fields.find((f) => f.key === "email")?.required ?? false;
  const ageRequired = fields.find((f) => f.key === "age")?.required ?? false;
  const genderRequired = fields.find((f) => f.key === "gender")?.required ?? false;

  async function submit() {
    if (!name.trim()) { setError("請填寫姓名"); return; }
    if (emailRequired && !email.trim()) { setError("請填寫電子郵件"); return; }
    if (ageRequired && !age) { setError("請填寫年齡"); return; }
    if (genderRequired && !gender) { setError("請選擇性別"); return; }

    setIsSubmitting(true);
    setError("");
    try {
      const res = await apiFetch(
        `/events/${event.id}/attendees/register`,
        {
          method: "POST",
          body: JSON.stringify({
            token,
            name: name.trim(),
            email: email.trim() || undefined,
            age: age ? Number(age) : undefined,
            gender: gender || undefined
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
      <div className="bg-white border-b border-charcoal/10 px-4 py-6">
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

      {/* 活動內容 */}
      {event.content && (
        <div className="bg-white border-b border-charcoal/10 px-4 py-6">
          <div
            className="mx-auto max-w-lg prose prose-sm"
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
            <label className="block text-sm font-semibold">
              姓名 <span className="text-orange">*</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 h-11 w-full rounded-lg border border-charcoal/15 bg-paper px-3 outline-none focus:border-mint"
                placeholder="請輸入姓名"
              />
            </label>

            <label className="block text-sm font-semibold">
              手機號碼
              <input
                value={attendee?.phone ?? ""}
                disabled
                className="mt-2 h-11 w-full rounded-lg border border-charcoal/10 bg-cloud px-3 text-charcoal/50 cursor-not-allowed"
              />
            </label>

            {showEmail && (
              <label className="block text-sm font-semibold">
                電子郵件 {emailRequired && <span className="text-orange">*</span>}
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 h-11 w-full rounded-lg border border-charcoal/15 bg-paper px-3 outline-none focus:border-mint"
                  placeholder="example@email.com"
                />
              </label>
            )}

            {showAge && (
              <label className="block text-sm font-semibold">
                年齡 {ageRequired && <span className="text-orange">*</span>}
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

            {showGender && (
              <div className="text-sm font-semibold">
                性別 {genderRequired && <span className="text-orange">*</span>}
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
            {isSubmitting ? "送出中…" : "完成報名，取得入場票券"}
          </button>
        </div>
      </div>
    </main>
  );
}
