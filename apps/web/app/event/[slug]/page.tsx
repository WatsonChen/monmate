"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { apiFetch } from "../../lib/api";
import { BrandLogo } from "../../components/BrandLogo";

type PublicEvent = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  content?: string | null;
  startAt: string;
  endAt?: string | null;
  location?: string | null;
  registrationRequired: boolean;
};

export default function PublicEventPage() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [event, setEvent] = useState<PublicEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void apiFetch<PublicEvent>(`/events/public/${params.slug}`)
      .then((res) => { if (res.success && res.data) setEvent(res.data); })
      .finally(() => setLoading(false));
  }, [params.slug]);

  if (loading) return <main className="grid min-h-dvh place-items-center"><p className="text-charcoal/50">載入中…</p></main>;

  if (!event) return (
    <main className="grid min-h-dvh place-items-center p-6 text-center">
      <p className="font-semibold text-charcoal/60">找不到此活動</p>
    </main>
  );

  const startDate = new Date(event.startAt);

  // CTA URL：有 token 時直接去票券或報名頁；無 token 時不顯示 CTA
  const ctaUrl = token
    ? event.registrationRequired
      ? `/event/${event.slug}/register?token=${token}`
      : `/event/${event.slug}/ticket?token=${token}`
    : null;
  const ctaLabel = event.registrationRequired ? "前往填寫報名資料" : "查看入場票券";

  return (
    <main className="min-h-dvh bg-paper">
      <div className="bg-white border-b border-charcoal/10 px-4 py-6">
        <div className="mx-auto max-w-2xl">
          <BrandLogo variant="horizontal" className="h-10 w-32 object-contain object-left" />
          <h1 className="mt-4 text-2xl font-bold">{event.name}</h1>
          <div className="mt-2 flex flex-col gap-1 text-sm text-charcoal/60">
            <span>📅 {startDate.toLocaleString("zh-TW", { year: "numeric", month: "long", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit" })}</span>
            {event.endAt && <span>⏰ 結束 {new Date(event.endAt).toLocaleString("zh-TW", { hour: "2-digit", minute: "2-digit" })}</span>}
            {event.location && <span>📍 {event.location}</span>}
          </div>
          {event.description && (
            <p className="mt-3 text-sm leading-relaxed text-charcoal/70">{event.description}</p>
          )}
          {ctaUrl && (
            <a
              href={ctaUrl}
              className="mt-5 inline-flex h-11 items-center rounded-lg bg-orange px-5 text-sm font-bold text-white"
            >
              {ctaLabel}
            </a>
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
