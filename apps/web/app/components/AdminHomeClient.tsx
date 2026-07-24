"use client";

import type { BillingStatusDTO, EventDTO } from "@monmate/types";
import Image from "next/image";
import Link from "next/link";
import { CalendarPlus, ClipboardCheck, CreditCard, QrCode } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/api";
import { LogoSpinner } from "./LogoSpinner";

const FALLBACK_DEMO_HREF = "/event/monmate-demo/checkin";

export function AdminHomeClient() {
  const [token, setToken] = useState("");
  const [events, setEvents] = useState<EventDTO[]>([]);
  const [billing, setBilling] = useState<BillingStatusDTO | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [demoHref, setDemoHref] = useState(FALLBACK_DEMO_HREF);

  useEffect(() => {
    setToken(window.localStorage.getItem("monmate.token") ?? "");
  }, []);

  useEffect(() => {
    if (!token) return;
    // The demo checkin link needs the real venue code (a random UUID set
    // per event) to actually work — resolve it instead of guessing.
    void apiFetch<EventDTO>("/events/public/monmate-demo").then((eventRes) => {
      const demoEventId = eventRes.success ? eventRes.data?.id : undefined;
      if (!demoEventId) return;
      void apiFetch<{ venueCode: string; venueUrl: string }>(
        `/events/${demoEventId}/venue-qr`,
        { token }
      ).then((qrRes) => {
        if (qrRes.success && qrRes.data?.venueUrl) setDemoHref(qrRes.data.venueUrl);
      });
    });
  }, [token]);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    async function load() {
      setIsLoading(true);
      try {
        const [eventsResponse, billingResponse] = await Promise.all([
          apiFetch<EventDTO[]>("/events", { token }),
          apiFetch<BillingStatusDTO>("/billing/status", { token })
        ]);

        if (eventsResponse.success && eventsResponse.data) {
          setEvents(eventsResponse.data);
        }

        if (billingResponse.success && billingResponse.data) {
          setBilling(billingResponse.data);
        }

        if (!eventsResponse.success || !billingResponse.success) {
          setMessage(
            eventsResponse.error?.message ??
              billingResponse.error?.message ??
              "讀取後台資料失敗"
          );
        }
      } catch {
        setMessage("無法連線到伺服器，請稍後再試");
      } finally {
        setIsLoading(false);
      }
    }

    void load();
  }, [token]);

  const totals = useMemo(() => {
    return events.reduce(
      (acc, event) => ({
        attendees: acc.attendees + (event.attendeeCount ?? 0),
        checkIns: acc.checkIns + (event.checkInLogCount ?? 0)
      }),
      { attendees: 0, checkIns: 0 }
    );
  }, [events]);

  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-bold text-orange">MonMate Admin</p>
          <h1 className="text-2xl font-bold">活動報到總覽</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/events/new"
            className="flex h-11 items-center justify-center gap-2 rounded-lg bg-orange px-4 text-sm font-bold text-white"
          >
            <CalendarPlus size={18} />
            新增活動
          </Link>
          <Link
            href={demoHref}
            target="_blank"
            className="flex h-11 items-center justify-center gap-2 rounded-lg bg-mint px-4 text-sm font-bold text-charcoal"
          >
            <QrCode size={18} />
            Demo 報到頁
          </Link>
        </div>
      </div>

      {!token ? (
        <section className="mt-5 rounded-lg border border-charcoal/10 bg-white p-5">
          <p className="text-sm font-semibold text-charcoal/70">請先登入後台。</p>
          <Link
            href="/admin/login"
            className="mt-4 inline-flex h-11 items-center rounded-lg bg-orange px-4 text-sm font-bold text-white"
          >
            前往登入
          </Link>
        </section>
      ) : null}

      {message ? (
        <section className="mt-5 rounded-lg border border-orange/20 bg-orange/10 p-4 text-sm font-semibold">
          {message}
        </section>
      ) : null}

      {token && isLoading ? (
        <div className="mt-5 flex justify-center rounded-lg border border-charcoal/10 bg-white py-16">
          <LogoSpinner size={80} />
        </div>
      ) : (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            {[
              ["活動數", String(events.length), ClipboardCheck],
              ["總報名", String(totals.attendees), QrCode],
              ["報到紀錄", String(totals.checkIns), ClipboardCheck],
              ["人次額度", String(billing?.attendeeCredits ?? 0), CreditCard]
            ].map(([label, value, Icon]) => (
              <div key={label as string} className="rounded-lg border border-charcoal/10 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-charcoal/60">{label as string}</p>
                  <Icon className="text-orange" size={18} />
                </div>
                <p className="mt-2 text-3xl font-bold">{value as string}</p>
              </div>
            ))}
          </div>

          <section className="mt-5 rounded-lg border border-charcoal/10 bg-white p-5">
            <div className="grid gap-6 lg:grid-cols-[1fr_220px] lg:items-center">
              <div>
                <h2 className="text-xl font-bold">
                  {events[0] ? "最近活動" : "尚未建立活動"}
                </h2>
                {events[0] ? (
                  <Link
                    href={`/admin/events/${events[0].id}`}
                    className="mt-4 block rounded-lg border border-charcoal/10 bg-paper p-4 transition-colors hover:border-mint/50 hover:bg-mint/5"
                  >
                    <p className="text-lg font-bold">{events[0].name}</p>
                    <p className="mt-1 text-sm font-semibold text-charcoal/60">
                      {events[0].slug} · 報名 {events[0].attendeeCount ?? 0}
                    </p>
                  </Link>
                ) : (
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-charcoal/65">
                    建立活動後即可匯入名單、產生報到序號與 QR Token，並在這裡查看報到狀態。
                  </p>
                )}
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href="/admin/events/new"
                    className="flex h-11 items-center gap-2 rounded-lg bg-mint px-4 text-sm font-bold"
                  >
                    <CalendarPlus size={18} />
                    建立活動
                  </Link>
                  <Link
                    href="/admin/events"
                    className="flex h-11 items-center gap-2 rounded-lg border border-charcoal/15 px-4 text-sm font-bold"
                  >
                    <ClipboardCheck size={18} />
                    查看活動
                  </Link>
                </div>
              </div>
              <Image
                src="/brand/mascot.png"
                alt="MonMate mascot"
                width={320}
                height={320}
                className="mx-auto aspect-square w-44 object-contain"
              />
            </div>
          </section>
        </>
      )}
    </>
  );
}