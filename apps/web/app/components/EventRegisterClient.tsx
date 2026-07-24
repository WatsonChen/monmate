"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Check, Clock, MapPin } from "lucide-react";
import type { RegistrationField } from "@monmate/types";
import { apiFetch } from "../lib/api";
import { formatEventDate, formatEventTime } from "../lib/eventDate";
import { BrandLogo } from "./BrandLogo";
import { DotsLoading } from "./DotsLoading";
import { SuccessCracker } from "./SuccessCracker";
import {
  buildRegistrationFieldsPayload,
  emptyRegistrationFieldValues,
  RegistrationFieldsFieldset,
  validateRegistrationFields
} from "./RegistrationFieldsFieldset";

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
    logoUrl?: string | null;
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

export function EventRegisterClient({ event, attendee, token }: Props) {
  const router = useRouter();
  const [name, setName] = useState(attendee?.name ?? "");
  const [fieldValues, setFieldValues] = useState(emptyRegistrationFieldValues());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const fields = event.registrationFields ?? [];

  async function submit() {
    if (!name.trim()) { setError("請填寫姓名"); return; }
    const fieldError = validateRegistrationFields(fields, fieldValues);
    if (fieldError) { setError(fieldError); return; }

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
            ...buildRegistrationFieldsPayload(fields, fieldValues)
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
          <SuccessCracker />
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

            <RegistrationFieldsFieldset fields={fields} values={fieldValues} onChange={setFieldValues} />
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

        <a
          href="https://monmate.tw"
          target="_blank"
          rel="noopener noreferrer"
          className="block py-6 text-center text-xs text-charcoal/40 hover:text-charcoal/60 transition-colors"
        >
          Powered by MonMate
        </a>
      </div>
    </main>
  );
}
