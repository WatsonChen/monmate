"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Calendar, Clock, MapPin } from "lucide-react";
import { BrandLogo } from "./BrandLogo";

// Hand-rolled instead of Date#toLocaleString: the "zh-TW" weekday+date
// combo is formatted with different spacing by the server's ICU (Node)
// vs. the browser's, which fails hydration on every event page. Reading
// via getUTC* after shifting by a fixed +8h also sidesteps whatever local
// timezone the server process happens to run in (commonly UTC on Vercel),
// so events always render true Taiwan wall-clock time on both sides.
const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];
const TAIPEI_OFFSET_MS = 8 * 60 * 60 * 1000;

function toTaipei(date: Date) {
  return new Date(date.getTime() + TAIPEI_OFFSET_MS);
}

function formatEventDate(date: Date) {
  const d = toTaipei(date);
  const weekday = WEEKDAYS[d.getUTCDay()];
  return `${d.getUTCFullYear()}年${d.getUTCMonth() + 1}月${d.getUTCDate()}日週${weekday} ${formatEventTime(date)}`;
}

function formatEventTime(date: Date) {
  const d = toTaipei(date);
  const hours24 = d.getUTCHours();
  const period = hours24 < 12 ? "上午" : "下午";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const minutes = String(d.getUTCMinutes()).padStart(2, "0");
  return `${period}${hours12}:${minutes}`;
}

type Props = {
  event: {
    slug: string;
    name: string;
    description?: string | null;
    content?: string | null;
    startAt: string;
    endAt?: string | null;
    location?: string | null;
    registrationRequired: boolean;
    openRegistration: boolean;
  };
  token: string | null;
};

export function EventLandingClient({ event, token }: Props) {
  const router = useRouter();
  const startDate = new Date(event.startAt);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const ctaHref = token ? `/event/${event.slug}/register?token=${token}` : null;

  async function handlePublicRegister() {
    if (!name.trim()) { setError("請填寫姓名"); return; }
    if (!phone.trim()) { setError("請填寫電話"); return; }
    setIsSubmitting(true);
    setError("");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
    const res = await fetch(`${apiUrl}/events/public/${event.slug}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), phone: phone.trim() })
    });
    const data = await res.json() as { success: boolean; data?: { qrToken: string }; error?: { message: string } };
    setIsSubmitting(false);
    if (!res.ok || !data.success || !data.data) {
      setError(data.error?.message ?? "報名失敗，請稍後再試");
      return;
    }
    const { qrToken } = data.data;
    if (event.registrationRequired) {
      router.push(`/event/${event.slug}/register?token=${qrToken}`);
    } else {
      router.push(`/event/${event.slug}/ticket?token=${qrToken}`);
    }
  }

  return (
    <main className="bg-paper">
      <div className="border-b border-charcoal/10 bg-white px-4 py-6">
        <div className="mx-auto max-w-2xl">
          <BrandLogo variant="horizontal" className="h-10 w-32 object-contain object-left" />
          <h1 className="mt-4 text-2xl font-bold">{event.name}</h1>
          <div className="mt-2 flex flex-col gap-1.5 text-sm text-charcoal/60">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="shrink-0" />
              {formatEventDate(startDate)}
            </span>
            {event.endAt && (
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="shrink-0" />
                結束 {formatEventTime(new Date(event.endAt))}
              </span>
            )}
            {event.location && (
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="shrink-0" />
                {event.location}
              </span>
            )}
          </div>
          {event.description && (
            <p className="mt-3 text-sm leading-relaxed text-charcoal/70">{event.description}</p>
          )}

          {/* 已受邀用戶的 CTA */}
          {ctaHref && (
            <Link
              href={ctaHref}
              className="mt-5 inline-flex h-11 items-center rounded-lg bg-orange px-5 text-sm font-bold text-white"
            >
              前往填寫報名資料
            </Link>
          )}

          {/* 公開報名 */}
          {!token && event.openRegistration && !showForm && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="mt-5 inline-flex h-11 items-center rounded-lg bg-orange px-5 text-sm font-bold text-white"
            >
              我要報名
            </button>
          )}

          {!token && event.openRegistration && showForm && (
            <div className="mt-5 rounded-lg border border-charcoal/10 bg-paper p-4">
              <p className="mb-3 text-sm font-bold">填寫報名資料</p>
              {error && <p className="mb-3 text-xs font-semibold text-red-500">{error}</p>}
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs font-semibold">
                  姓名
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="王小明"
                    className="mt-1.5 h-10 w-full rounded-lg border border-charcoal/15 bg-white px-3 text-sm outline-none focus:border-mint"
                  />
                </label>
                <label className="text-xs font-semibold">
                  電話
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912345678"
                    className="mt-1.5 h-10 w-full rounded-lg border border-charcoal/15 bg-white px-3 text-sm outline-none focus:border-mint"
                  />
                </label>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setError(""); }}
                  className="h-9 rounded-lg border border-charcoal/15 bg-paper px-4 text-sm font-semibold hover:bg-white"
                >
                  取消
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => void handlePublicRegister()}
                  className="h-9 rounded-lg bg-orange px-4 text-sm font-bold text-white disabled:opacity-40"
                >
                  {isSubmitting ? "送出中…" : "確認報名"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {event.content && (
        <div className="mx-auto max-w-2xl px-4 py-8">
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: event.content }}
          />
        </div>
      )}
    </main>
  );
}
