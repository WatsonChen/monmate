"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { apiFetch } from "../../../lib/api";
import type { EventDTO } from "@monmate/types";
import { QrCode } from "lucide-react";
import { EventCoverBanner } from "../../../components/EventCoverBanner";
import { LogoLoading } from "../../../components/LogoLoading";

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

  useEffect(() => {
    if (!params.slug || !token) { setLoading(false); return; }
    void apiFetch<TicketData>(`/events/ticket/${params.slug}?token=${token}`)
      .then((res) => { if (res.success && res.data) setData(res.data); })
      .finally(() => setLoading(false));
  }, [params.slug, token]);

  if (loading) return <LogoLoading />;
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

  return (
    <main className="min-h-dvh bg-paper">
      <EventCoverBanner seed={event.slug} />
      <div className="mx-auto max-w-sm space-y-4 p-4">
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

        {!checkedIn && (
          <div className="rounded-xl border border-charcoal/10 bg-white p-5 shadow-soft text-center">
            <p className="text-sm font-semibold text-charcoal">現場無工作人員？</p>
            <p className="mt-1 text-xs text-charcoal/50">掃描活動現場張貼的 QR Code 即可自助報到</p>
          </div>
        )}

        <a
          href="https://monmate.tw"
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-xs text-charcoal/40 hover:text-charcoal/60 transition-colors"
        >
          Powered by MonMate
        </a>
      </div>
    </main>
  );
}
