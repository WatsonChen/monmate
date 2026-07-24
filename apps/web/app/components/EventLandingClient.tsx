"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Calendar, Clock, MapPin } from "lucide-react";
import type { RegistrationField } from "@monmate/types";
import { apiFetch } from "../lib/api";
import { formatEventDate, formatEventTime } from "../lib/eventDate";
import { EventCoverBanner } from "./EventCoverBanner";
import {
  buildRegistrationFieldsPayload,
  emptyRegistrationFieldValues,
  RegistrationFieldsFieldset,
  validateRegistrationFields
} from "./RegistrationFieldsFieldset";

type Props = {
  event: {
    id: string;
    slug: string;
    name: string;
    description?: string | null;
    content?: string | null;
    startAt: string;
    endAt?: string | null;
    location?: string | null;
    logoUrl?: string | null;
    registrationRequired: boolean;
    openRegistration: boolean;
    registrationFields: RegistrationField[];
  };
  token: string | null;
};

export function EventLandingClient({ event, token }: Props) {
  const router = useRouter();
  const startDate = new Date(event.startAt);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [fieldValues, setFieldValues] = useState(emptyRegistrationFieldValues());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const ctaHref = token ? `/event/${event.slug}/register?token=${token}` : null;

  async function handlePublicRegister() {
    if (!name.trim()) { setError("請填寫姓名"); return; }
    if (!phone.trim()) { setError("請填寫電話"); return; }
    if (event.registrationRequired) {
      const fieldError = validateRegistrationFields(event.registrationFields, fieldValues);
      if (fieldError) { setError(fieldError); return; }
    }

    setIsSubmitting(true);
    setError("");

    // 公開報名一律先建立基本資料（姓名＋電話）取得 token；活動若需要
    // 額外欄位，緊接著在同一次送出裡把資料補完，畫面上不會跳頁，訪客
    // 只會覺得自己填了「一個」表單。
    const res = await apiFetch<{ qrToken: string }>(`/events/public/${event.slug}/register`, {
      method: "POST",
      body: JSON.stringify({ name: name.trim(), phone: phone.trim() })
    });
    if (!res.success || !res.data) {
      setIsSubmitting(false);
      setError(res.error?.message ?? "報名失敗，請稍後再試");
      return;
    }
    const { qrToken } = res.data;

    if (event.registrationRequired) {
      const completeRes = await apiFetch(`/events/${event.id}/attendees/register`, {
        method: "POST",
        body: JSON.stringify({
          token: qrToken,
          name: name.trim(),
          ...buildRegistrationFieldsPayload(event.registrationFields, fieldValues)
        })
      });
      setIsSubmitting(false);
      if (!completeRes.success) {
        setError(completeRes.error?.message ?? "報名失敗，請稍後再試");
        return;
      }
    } else {
      setIsSubmitting(false);
    }

    router.push(`/event/${event.slug}/ticket?token=${qrToken}`);
  }

  return (
    <main className="bg-paper">
      <EventCoverBanner seed={event.slug} />
      <div className="border-b border-charcoal/10 bg-white px-4 py-6">
        <div className="mx-auto max-w-2xl">
          {event.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={event.logoUrl} alt="" className="mb-3 h-12 max-w-[160px] object-contain object-left" />
          )}
          <h1 className="text-2xl font-bold">{event.name}</h1>
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

          {/* 邀請制活動、沒帶 token 造訪：沒有任何 CTA 可以顯示，至少說明狀態 */}
          {!token && !event.openRegistration && (
            <p className="mt-5 text-sm font-semibold text-charcoal/50">
              此活動採邀請制，請透過您收到的專屬報名連結完成報名。
            </p>
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

              {event.registrationRequired && (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <RegistrationFieldsFieldset
                    fields={event.registrationFields}
                    values={fieldValues}
                    onChange={setFieldValues}
                  />
                </div>
              )}

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

      <a
        href="https://monmate.tw"
        target="_blank"
        rel="noopener noreferrer"
        className="block px-4 py-6 text-center text-xs text-charcoal/40 hover:text-charcoal/60 transition-colors"
      >
        Powered by MonMate
      </a>
    </main>
  );
}
