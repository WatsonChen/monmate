"use client";

import type { CheckInResultDTO } from "@monmate/types";
import Link from "next/link";
import {
  Check,
  Keyboard,
  QrCode,
  RotateCcw,
  Search,
  XCircle
} from "lucide-react";
import { type CSSProperties, useState } from "react";
import { apiFetch } from "../lib/api";
import { BrandLogo } from "./BrandLogo";
import { DotsLoading } from "./DotsLoading";

type Method = "qr" | "manual";

const statusCopy = {
  SUCCESS: {
    title: "報到成功！",
    tone: "bg-mint/25 border-mint text-charcoal",
    icon: Check
  },
  ALREADY_CHECKED_IN: {
    title: "已報到過",
    tone: "bg-orange/10 border-orange/30 text-charcoal",
    icon: RotateCcw
  },
  NOT_FOUND: {
    title: "找不到報名資料",
    tone: "bg-orange/10 border-orange/30 text-charcoal",
    icon: Search
  },
  INVALID: {
    title: "QR Code / 序號無效",
    tone: "bg-red-50 border-red-200 text-red-900",
    icon: XCircle
  },
  // 工作人員現場報到不受開放時間限制，此狀態實際上不會出現，僅為型別完整性保留
  NOT_STARTED: {
    title: "活動尚未開放報到",
    tone: "bg-orange/10 border-orange/30 text-charcoal",
    icon: XCircle
  }
} as const;

type CheckInClientProps = {
  initialEventId?: string;
  eventName?: string;
  eventLocation?: string | null;
  allowEventIdInput?: boolean;
};

export function CheckInClient({
  initialEventId = "",
  eventName,
  eventLocation,
  allowEventIdInput = false
}: CheckInClientProps) {
  const [eventId, setEventId] = useState(initialEventId);
  const [method, setMethod] = useState<Method>("qr");
  const [credential, setCredential] = useState("");
  const [result, setResult] = useState<CheckInResultDTO | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitCheckIn() {
    setIsSubmitting(true);
    setError("");
    setResult(null);

    const path =
      method === "qr"
        ? `/events/${eventId}/check-in/qr`
        : `/events/${eventId}/check-in/manual`;
    const body =
      method === "qr" ? { qrToken: credential } : { checkInCode: credential };

    try {
      const response = await apiFetch<CheckInResultDTO>(path, {
        method: "POST",
        body: JSON.stringify(body)
      });

      if (!response.success || !response.data) {
        setError(response.error?.message ?? "報到失敗");
        return;
      }

      setResult(response.data);
      setCredential("");
    } catch {
      setError("無法連線到報到服務");
    } finally {
      setIsSubmitting(false);
    }
  }

  const ResultIcon = result ? statusCopy[result.status].icon : null;
  const isSuccess = result?.status === "SUCCESS";

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 py-6">
      <header className="flex items-center justify-between">
        <BrandLogo
          variant="horizontal"
          className="h-14 w-40 object-contain object-left"
        />
        <span className="rounded-full bg-mint/30 px-3 py-1 text-xs font-semibold text-charcoal">
          現場報到
        </span>
      </header>

      {isSuccess ? (
        <section className="relative mt-8 overflow-hidden rounded-lg border border-charcoal/10 bg-white px-5 py-8 text-center shadow-soft">
          <span
            className="success-firework left-7 top-40"
            style={{ "--rotate": "-44deg", "--dx": "-28px", "--dy": "-30px" } as CSSProperties}
          />
          <span
            className="success-firework right-9 top-36"
            style={{ "--delay": "0.45s", "--rotate": "40deg", "--dx": "26px", "--dy": "-26px" } as CSSProperties}
          />
          <span
            className="success-firework bottom-44 left-10"
            style={{ "--delay": "0.85s", "--rotate": "28deg", "--dx": "-20px", "--dy": "-32px" } as CSSProperties}
          />
          <span
            className="success-firework right-12 bottom-40"
            style={{ "--delay": "0.15s", "--rotate": "-18deg", "--dx": "22px", "--dy": "-20px" } as CSSProperties}
          />
          <span
            className="success-spark right-9 top-52"
            style={{ "--delay": "0.25s", "--dx": "20px", "--dy": "-16px" } as CSSProperties}
          />
          <span
            className="success-spark left-12 top-44"
            style={{ "--delay": "0.65s", "--dx": "-16px", "--dy": "-14px" } as CSSProperties}
          />

          <div className="relative z-10">
            <BrandLogo
              variant="horizontal"
              className="mx-auto h-16 w-48 object-contain"
            />
            <h1 className="mt-8 text-2xl font-bold">來賓報到</h1>
            <p className="mt-2 text-sm font-semibold text-charcoal/60">
              {eventName ?? "MonMate 活動"}
            </p>

            <div className="mx-auto mt-10 flex h-36 w-36 items-center justify-center rounded-full bg-mint shadow-soft">
              <Check className="text-white" size={88} strokeWidth={2.6} />
            </div>

            <h2 className="mt-8 text-3xl font-bold">報到成功！</h2>
            {result.attendee ? (
              <p className="mt-3 text-sm font-semibold text-charcoal/60">
                {result.attendee.name}，電話末三碼 {result.attendee.phoneLastThree}
              </p>
            ) : null}
            {result.attendee?.checkedInAt ? (
              <p className="mt-2 text-xs font-semibold text-charcoal/50">
                {new Date(result.attendee.checkedInAt).toLocaleString("zh-TW")}
              </p>
            ) : null}

            <div className="mt-9 grid gap-3">
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setError("");
                  setCredential("");
                }}
                className="flex h-14 w-full items-center justify-center rounded-lg bg-orange text-base font-bold text-white shadow-soft"
              >
                下一位來賓
              </button>
              <Link
                href="/admin"
                className="flex h-14 w-full items-center justify-center rounded-lg border border-orange/35 bg-white text-base font-bold text-charcoal/70"
              >
                查看報到紀錄
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <>
          <section className="mt-8 rounded-lg border border-charcoal/10 bg-white p-4 shadow-soft">
            {eventName ? (
              <div className="mb-5 rounded-lg bg-mint/15 px-4 py-3">
                <p className="text-xs font-semibold text-charcoal/60">活動</p>
                <h1 className="mt-1 text-xl font-bold text-charcoal">{eventName}</h1>
                {eventLocation ? (
                  <p className="mt-1 text-sm font-semibold text-charcoal/60">
                    {eventLocation}
                  </p>
                ) : null}
              </div>
            ) : null}

            {allowEventIdInput ? (
              <>
                <label className="text-sm font-semibold text-charcoal" htmlFor="eventId">
                  活動 ID
                </label>
                <input
                  id="eventId"
                  value={eventId}
                  onChange={(event) => setEventId(event.target.value)}
                  className="mt-2 h-12 w-full rounded-lg border border-charcoal/15 bg-paper px-3 text-base outline-none focus:border-mint"
                  placeholder="輸入後台活動 ID"
                />
              </>
            ) : null}

            <div className={allowEventIdInput ? "mt-5 grid grid-cols-2 gap-2 rounded-lg bg-cloud p-1" : "grid grid-cols-2 gap-2 rounded-lg bg-cloud p-1"}>
              <button
                type="button"
                onClick={() => setMethod("qr")}
                className={`flex h-12 items-center justify-center gap-2 rounded-md text-sm font-semibold ${
                  method === "qr" ? "bg-white text-charcoal shadow-sm" : "text-charcoal/70"
                }`}
              >
                <QrCode size={18} />
                QR Code
              </button>
              <button
                type="button"
                onClick={() => setMethod("manual")}
                className={`flex h-12 items-center justify-center gap-2 rounded-md text-sm font-semibold ${
                  method === "manual" ? "bg-white text-charcoal shadow-sm" : "text-charcoal/70"
                }`}
              >
                <Keyboard size={18} />
                手動序號
              </button>
            </div>

            <label className="mt-5 block text-sm font-semibold text-charcoal" htmlFor="credential">
              {method === "qr" ? "QR Token" : "報到序號"}
            </label>
            <input
              id="credential"
              value={credential}
              onChange={(event) => setCredential(event.target.value)}
              className="mt-2 h-14 w-full rounded-lg border border-charcoal/15 bg-paper px-4 text-lg font-semibold tracking-wide outline-none focus:border-mint"
              placeholder={method === "qr" ? "掃描後貼上或輸入 token" : "例如 MM0001"}
            />

            <button
              type="button"
              disabled={!eventId || !credential || isSubmitting}
              onClick={submitCheckIn}
              className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-orange text-base font-bold text-white shadow-soft disabled:cursor-not-allowed disabled:bg-charcoal/25"
            >
              <QrCode size={20} />
              {isSubmitting ? <>處理中<DotsLoading /></> : "開始掃描報到"}
            </button>
          </section>

          {error ? (
            <section className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-900">
              {error}
            </section>
          ) : null}

          {result ? (
            <section className={`mt-4 rounded-lg border p-4 ${statusCopy[result.status].tone}`}>
              <div className="flex items-center gap-3">
                {ResultIcon ? (
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white">
                    <ResultIcon size={24} />
                  </span>
                ) : null}
                <div>
                  <p className="text-lg font-bold">{statusCopy[result.status].title}</p>
                  {result.attendee ? (
                    <p className="text-sm text-charcoal/70">
                      {result.attendee.name}，電話末三碼 {result.attendee.phoneLastThree}
                    </p>
                  ) : null}
                </div>
              </div>
              {result.attendee?.checkedInAt ? (
                <p className="mt-3 rounded-md bg-white/75 px-3 py-2 text-sm">
                  報到時間：{new Date(result.attendee.checkedInAt).toLocaleString("zh-TW")}
                </p>
              ) : null}
            </section>
          ) : null}
        </>
      )}
    </main>
  );
}
