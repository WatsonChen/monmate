"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "../../lib/api";

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

  return (
    <main className="min-h-dvh bg-paper">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="rounded-2xl border border-charcoal/10 bg-white p-8 shadow-soft">
          <div className="mb-6 flex items-start gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{event.name}</h1>
              {event.description && <p className="mt-2 text-charcoal/70">{event.description}</p>}
            </div>
          </div>

          <div className="space-y-2 text-sm text-charcoal/70">
            <div className="flex items-center gap-2">
              <span>📅</span>
              <span>{startDate.toLocaleString("zh-TW", { year: "numeric", month: "long", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit" })}</span>
            </div>
            {event.endAt && (
              <div className="flex items-center gap-2">
                <span>⏰</span>
                <span>結束：{new Date(event.endAt).toLocaleString("zh-TW", { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            )}
            {event.location && (
              <div className="flex items-center gap-2">
                <span>📍</span>
                <span>{event.location}</span>
              </div>
            )}
          </div>

          {event.content && (
            <div
              className="prose prose-sm mt-6 max-w-none border-t border-charcoal/10 pt-6"
              dangerouslySetInnerHTML={{ __html: event.content }}
            />
          )}

          <div className="mt-8">
            <a
              href={`/event/${event.slug}/checkin`}
              className="inline-block rounded-lg bg-orange px-6 py-3 font-bold text-white"
            >
              前往報到
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
