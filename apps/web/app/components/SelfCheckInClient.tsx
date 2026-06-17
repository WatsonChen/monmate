"use client";

import { type CSSProperties, useState } from "react";
import { Check, Phone, RotateCcw, Search, XCircle } from "lucide-react";
import type { CheckInResultDTO } from "@monmate/types";
import { apiFetch } from "../lib/api";
import { BrandLogo } from "./BrandLogo";

const statusCopy = {
  SUCCESS: {
    title: "報到成功！",
    tone: "bg-mint/25 border-mint text-charcoal",
    icon: Check
  },
  ALREADY_CHECKED_IN: {
    title: "您已完成報到",
    tone: "bg-orange/10 border-orange/30 text-charcoal",
    icon: RotateCcw
  },
  NOT_FOUND: {
    title: "找不到報名資料",
    tone: "bg-orange/10 border-orange/30 text-charcoal",
    icon: Search
  },
  INVALID: {
    title: "號碼無效",
    tone: "bg-red-50 border-red-200 text-red-900",
    icon: XCircle
  }
} as const;

type Props = {
  eventId: string;
  eventName?: string;
  eventLocation?: string | null;
  venueCode: string;
};

export function SelfCheckInClient({ eventId, eventName, eventLocation, venueCode }: Props) {
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<CheckInResultDTO | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitCheckIn() {
    const trimmed = phone.trim();
    if (!trimmed) return;
    setIsSubmitting(true);
    setError("");
    setResult(null);

    try {
      const response = await apiFetch<CheckInResultDTO>(
        `/events/${eventId}/check-in/self`,
        { method: "POST", body: JSON.stringify({ phone: trimmed, venueCode }) }
      );

      if (!response.success || !response.data) {
        setError(response.error?.message ?? "報到失敗");
        return;
      }

      setResult(response.data);
    } catch {
      setError("無法連線到報到服務，請稍後再試");
    } finally {
      setIsSubmitting(false);
    }
  }

  const isSuccess = result?.status === "SUCCESS";
  const isCapacityExceeded =
    result?.status === "ALREADY_CHECKED_IN" &&
    (result.attendee?.checkInCapacity ?? 1) > 1;
  const ResultIcon = result ? statusCopy[result.status].icon : null;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 py-6">
      <header className="flex items-center justify-between">
        <BrandLogo variant="horizontal" className="h-14 w-40 object-contain object-left" />
        <span className="rounded-full bg-mint/30 px-3 py-1 text-xs font-semibold text-charcoal">
          自助報到
        </span>
      </header>

      {isSuccess ? (
        <section className="relative mt-8 overflow-hidden rounded-lg border border-charcoal/10 bg-white px-5 py-8 text-center shadow-soft">
          <span
            className="success-firework left-7 top-40"
            style={{ "--rotate": "-44deg" } as CSSProperties}
          />
          <span
            className="success-firework right-9 top-36"
            style={{ "--delay": "0.45s", "--rotate": "40deg" } as CSSProperties}
          />
          <span
            className="success-firework bottom-44 left-10"
            style={{ "--delay": "0.85s", "--rotate": "28deg" } as CSSProperties}
          />
          <span
            className="success-spark right-9 top-52"
            style={{ "--delay": "0.25s" } as CSSProperties}
          />

          <div className="relative z-10">
            <BrandLogo variant="horizontal" className="mx-auto h-16 w-48 object-contain" />
            <h1 className="mt-8 text-2xl font-bold">自助報到</h1>
            <p className="mt-2 text-sm font-semibold text-charcoal/60">
              {eventName ?? "MonMate 活動"}
            </p>

            <div className="mx-auto mt-10 flex h-36 w-36 items-center justify-center rounded-full bg-mint shadow-soft">
              <Check className="text-white" size={88} strokeWidth={2.6} />
            </div>

            <h2 className="mt-8 text-3xl font-bold">報到成功！</h2>
            {result.attendee ? (
              <p className="mt-3 text-sm font-semibold text-charcoal/60">
                {result.attendee.name}，歡迎入場 🎉
              </p>
            ) : null}

            <button
              type="button"
              onClick={() => {
                setResult(null);
                setError("");
                setPhone("");
              }}
              className="mt-9 flex h-14 w-full items-center justify-center rounded-lg bg-orange text-base font-bold text-white shadow-soft"
            >
              返回
            </button>
          </div>
        </section>
      ) : (
        <>
          <section className="mt-8 rounded-lg border border-charcoal/10 bg-white p-5 shadow-soft">
            {eventName ? (
              <div className="mb-5 rounded-lg bg-mint/15 px-4 py-3">
                <p className="text-xs font-semibold text-charcoal/60">活動</p>
                <h1 className="mt-1 text-xl font-bold text-charcoal">{eventName}</h1>
                {eventLocation ? (
                  <p className="mt-1 text-sm font-semibold text-charcoal/60">{eventLocation}</p>
                ) : null}
              </div>
            ) : null}

            <label className="block text-sm font-semibold text-charcoal" htmlFor="phone">
              輸入手機號碼
            </label>
            <p className="mt-0.5 text-xs text-charcoal/50">
              輸入您報名時填寫的手機號碼即可完成報到
            </p>
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void submitCheckIn()}
              className="mt-3 h-16 w-full rounded-lg border border-charcoal/15 bg-paper px-4 text-center text-2xl font-bold tracking-widest outline-none focus:border-mint"
              placeholder="0912345678"
              autoFocus
              autoComplete="tel"
            />

            <button
              type="button"
              disabled={!phone.trim() || isSubmitting}
              onClick={() => void submitCheckIn()}
              className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-orange text-base font-bold text-white shadow-soft disabled:cursor-not-allowed disabled:bg-charcoal/25"
            >
              <Phone size={20} />
              {isSubmitting ? "處理中…" : "確認報到"}
            </button>
          </section>

          {error ? (
            <section className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-900">
              {error}
            </section>
          ) : null}

          {result && !isSuccess ? (
            <section className={`mt-4 rounded-lg border p-4 ${statusCopy[result.status].tone}`}>
              <div className="flex items-center gap-3">
                {ResultIcon ? (
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white">
                    <ResultIcon size={24} />
                  </span>
                ) : null}
                <div>
                  <p className="text-lg font-bold">
                    {isCapacityExceeded ? "超過報到人數" : statusCopy[result.status].title}
                  </p>
                  {result.attendee ? (
                    <p className="text-sm text-charcoal/70">{result.attendee.name}</p>
                  ) : null}
                </div>
              </div>
            </section>
          ) : null}
        </>
      )}
    </main>
  );
}
