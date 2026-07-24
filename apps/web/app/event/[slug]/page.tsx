import type { ApiResponse } from "@monmate/types";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BrandLogo } from "../../components/BrandLogo";
import { EventLandingClient } from "../../components/EventLandingClient";

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
  openRegistration: boolean;
};

type TicketData = {
  event: PublicEvent;
  attendee: { id: string; checkInStatus: string } | null;
};

async function getEvent(slug: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (!apiUrl) return null;
  try {
    const res = await fetch(`${apiUrl}/events/public/${slug}`, { cache: "no-store" });
    const body = (await res.json()) as ApiResponse<PublicEvent>;
    return body.success ? (body.data ?? null) : null;
  } catch {
    return null;
  }
}

async function getTicket(slug: string, token: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (!apiUrl) return null;
  try {
    const res = await fetch(`${apiUrl}/events/ticket/${slug}?token=${token}`, { cache: "no-store" });
    const body = (await res.json()) as ApiResponse<TicketData>;
    return body.success ? (body.data ?? null) : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);

  if (!event) {
    return { title: "找不到此活動 - MonMate" };
  }

  const title = event.name;
  const description = event.description || "使用 MonMate 建立的活動報到頁面";

  // No per-event cover image field yet — the brand lockup is a reasonable
  // default so shared links at least show something branded and legible
  // instead of the generic site-wide "MonMate" card.
  return {
    title,
    description,
    openGraph: { title, description, type: "website", images: ["/brand/logo-slogan.png"] },
    twitter: { card: "summary_large_image", title, description, images: ["/brand/logo-slogan.png"] }
  };
}

export default async function PublicEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { slug } = await params;
  const { token } = await searchParams;

  const event = await getEvent(slug);

  if (!event) {
    return (
      <main className="grid min-h-dvh place-items-center p-6 text-center">
        <div className="space-y-2">
          <BrandLogo variant="horizontal" className="mx-auto h-14 w-40 object-contain" />
          <p className="mt-4 font-semibold text-charcoal/60">找不到此活動</p>
        </div>
      </main>
    );
  }

  // 有 token 時：查詢票券狀態，決定是否直接跳轉
  if (token) {
    const ticket = await getTicket(slug, token);

    // 已完成報名（attendee 存在）→ 直接去票券頁
    if (ticket?.attendee) {
      redirect(`/event/${slug}/ticket?token=${token}`);
    }

    // 無需填表 → 直接去票券頁（第一次開也沒有 attendee，但 ticket 不存在時代表 token 無效）
    if (!event.registrationRequired) {
      redirect(`/event/${slug}/ticket?token=${token}`);
    }

    // 需要填表且尚未報名 → 顯示 landing，CTA 指向報名表
  }

  return <EventLandingClient event={event} token={token ?? null} />;
}
