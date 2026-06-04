"use client";

import Link from "next/link";
import { BrandLogo } from "./BrandLogo";

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
  };
  token: string | null;
};

export function EventLandingClient({ event, token }: Props) {
  const startDate = new Date(event.startAt);

  const ctaHref = token ? `/event/${event.slug}/register?token=${token}` : null;

  return (
    <main className="min-h-dvh bg-paper">
      <div className="border-b border-charcoal/10 bg-white px-4 py-6">
        <div className="mx-auto max-w-2xl">
          <BrandLogo variant="horizontal" className="h-10 w-32 object-contain object-left" />
          <h1 className="mt-4 text-2xl font-bold">{event.name}</h1>
          <div className="mt-2 flex flex-col gap-1 text-sm text-charcoal/60">
            <span>
              📅{" "}
              {startDate.toLocaleString("zh-TW", {
                year: "numeric",
                month: "long",
                day: "numeric",
                weekday: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {event.endAt && (
              <span>
                ⏰ 結束{" "}
                {new Date(event.endAt).toLocaleString("zh-TW", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
            {event.location && <span>📍 {event.location}</span>}
          </div>
          {event.description && (
            <p className="mt-3 text-sm leading-relaxed text-charcoal/70">{event.description}</p>
          )}
          {ctaHref && (
            <Link
              href={ctaHref}
              className="mt-5 inline-flex h-11 items-center rounded-lg bg-orange px-5 text-sm font-bold text-white"
            >
              前往填寫報名資料
            </Link>
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
