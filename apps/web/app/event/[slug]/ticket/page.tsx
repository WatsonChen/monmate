"use client";

import { type CSSProperties, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { apiFetch } from "../../../lib/api";
import type { CheckInResultDTO, EventDTO } from "@monmate/types";
import { Check, QrCode } from "lucide-react";

type AttendeeTicket = {
  id: string;
  name: string;
  phone: string;
  checkInCode: string;
  qrToken: string;
  checkInStatus: string;
};

type TicketData = {
  event: EventDTO;
  attendee: AttendeeTicket | null;
};

export default function TicketPage() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [data, setData] = useState<TicketData | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selfCheckInResult, setSelfCheckInResult] = useState<CheckInResultDTO | null>(null);
  const [selfCheckInError, setSelfCheckInError] = useState("");
  const [isSelfCheckingIn, setIsSelfCheckingIn] = useState(false);

  useEffect(() => {
    if (!params.slug || !token) { setLoading(false); return; }
    void apiFetch<TicketData>(`/events/ticket/${params.slug}?token=${token}`)
      .then((res) => { if (res.success && res.data) setData(res.data); })
      .finally(() => setLoading(false));
  }, [params.slug, token]);

  async function handleSelfCheckIn() {
    if (!data?.attendee || !data.event) return;
    setIsSelfCheckingIn(true);
    setSelfCheckInError("");
    try {
      const res = await apiFetch<CheckInResultDTO>(
        `/events/${data.event.id}/check-in/qr`,
        { method: "POST", body: JSON.stringify({ qrToken: data.attendee.qrToken }) }
      );
      if (!res.success || !res.data) {
        setSelfCheckInError(res.error?.message ?? "報到失敗");
        return;
      }
      setSelfCheckInResult(res.data);
      // 更新本地狀態讓 QR 頁顯示「已報到」
      if (res.data.status === "SUCCESS" || res.data.status === "ALREADY_CHECKED_IN") {
        setData((prev) =>
          prev && prev.attendee
            ? { ...prev, attendee: { ...prev.attendee, checkInStatus: "CHECKED_IN" } }
            : prev
        );
      }
    } catch {
      setSelfCheckInError("無法連線到報到服務，請稍後再試");
    } finally {
      setIsSelfCheckingIn(false);
    }
  }

  if (loading) return <main className="grid min-h-dvh place-items-center"><p className="text-charcoal/50">載入中…</p></main>;
  if (!data?.attendee) return (
    <main className="grid min-h-dvh place-items-center p-6 text-center">
      <div>
        <p className="text-2xl">🔍</p>
        <p className="mt-2 font-semibold">找不到票券</p>
        <p className="mt-1 text-sm text-charcoal/60">請確認連結是否正確</p>
      </div>
    </main>
  );

  const { event, attendee } = data;
  const checkedIn = attendee.checkInStatus === "CHECKED_IN";
  const qrValue = attendee.qrToken;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrValue)}`;

  const isJustCheckedIn = selfCheckInResult?.status === "SUCCESS";

  if (isJustCheckedIn) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col items-center justify-center px-5">
        <div className="relative w-full overflow-hidden rounded-xl border border-charcoal/10 bg-white px-5 py-10 text-center shadow-soft">
          <span className="success-firework left-7 top-40" style={{ "--rotate": "-44deg" } as CSSProperties} />
          <span className="success-firework right-9 top-36" style={{ "--delay": "0.45s", "--rotate": "40deg" } as CSSProperties} />
          <span className="success-spark right-9 top-52" style={{ "--delay": "0.25s" } as CSSProperties} />

          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-charcoal/40">自助報到</p>
            <h1 className="mt-1 text-xl font-bold">{event.name}</h1>

            <div className="mx-auto mt-8 flex h-28 w-28 items-center justify-center rounded-full bg-mint shadow-soft">
              <Check className="text-white" size={68} strokeWidth={2.6} />
            </div>

            <h2 className="mt-6 text-3xl font-bold">報到成功！</h2>
            <p className="mt-2 text-sm font-semibold text-charcoal/60">{attendee.name}，歡迎入場</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-paper p-4">
      <div className="mx-auto max-w-sm space-y-4">
        <div className="rounded-xl border border-charcoal/10 bg-white p-5 text-center shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-widest text-charcoal/40">入場票券</p>
          <h1 className="mt-1 text-xl font-bold">{event.name}</h1>
          {event.location && <p className="mt-1 text-sm text-charcoal/60">📍 {event.location}</p>}
          <p className="mt-1 text-sm text-charcoal/60">
            {new Date(event.startAt).toLocaleString("zh-TW", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>

          <div className="mt-4 border-t border-charcoal/10 pt-4">
            <p className="font-bold text-lg">{attendee.name}</p>
            {checkedIn && (
              <span className="mt-1 inline-block rounded-full bg-green-100 px-3 py-0.5 text-xs font-semibold text-green-700">
                ✅ 已報到
              </span>
            )}
          </div>

          {!showCode ? (
            <div className="mt-4">
              <img src={qrImageUrl} alt="QR Code" className="mx-auto h-52 w-52 rounded-lg" />
              <p className="mt-2 font-mono text-sm tracking-widest text-charcoal/60">{attendee.checkInCode}</p>
            </div>
          ) : (
            <div className="mt-4 rounded-xl bg-charcoal/5 p-6">
              <p className="text-xs font-semibold text-charcoal/40">報到代碼</p>
              <p className="mt-2 font-mono text-3xl font-bold tracking-widest">{attendee.checkInCode}</p>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowCode(!showCode)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-charcoal/15 py-2.5 text-sm font-semibold"
          >
            <QrCode size={16} />
            {showCode ? "顯示 QR Code" : "只顯示代碼"}
          </button>
        </div>

        {/* 自助報到區塊（現場無工作人員時使用） */}
        {!checkedIn && (
          <div className="rounded-xl border border-charcoal/10 bg-white p-5 shadow-soft">
            <p className="text-sm font-semibold text-charcoal">現場無工作人員？</p>
            <p className="mt-0.5 text-xs text-charcoal/50">點選下方按鈕直接完成報到</p>
            <button
              type="button"
              disabled={isSelfCheckingIn}
              onClick={() => void handleSelfCheckIn()}
              className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-mint text-sm font-bold text-white shadow-soft disabled:opacity-50"
            >
              <Check size={18} />
              {isSelfCheckingIn ? "處理中…" : "自助報到"}
            </button>
            {selfCheckInError && (
              <p className="mt-2 text-xs font-semibold text-red-600">{selfCheckInError}</p>
            )}
          </div>
        )}

        <p className="text-center text-xs text-charcoal/40">Powered by MonMate</p>
      </div>
    </main>
  );
}
