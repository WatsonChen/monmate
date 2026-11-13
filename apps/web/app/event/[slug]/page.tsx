import type { ApiResponse, RegistrationField } from "@monmate/types";
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
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  registrationRequired: boolean;
  openRegistration: boolean;
  registrationFields: RegistrationField[];
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
    return { title: "找不到此活動", robots: { index: false } };
  }

  const title = event.name;
  const description = event.description || "使用 MonMate 建立的活動報到頁面";

  // 分享預覽圖（LINE／FB）優先用活動封面；沒有封面才退回品牌圖。
  const image = event.coverImageUrl && /^https?:\/\//.test(event.coverImageUrl) ? event.coverImageUrl : "/brand/logo-slogan.png";
  return {
    title,
    description,
    alternates: { canonical: `/event/${slug}` },
    openGraph: { title, description, url: `/event/${slug}`, type: "website", images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image] }
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

    // 需要填表且尚未報名 → 直接帶到報名表（報名頁本身就會顯示活動資訊與內容），省掉多按一次
    redirect(`/event/${slug}/register?token=${token}`);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.name,
    startDate: event.startAt,
    endDate: event.endAt ?? undefined,
    description: event.description ?? undefined,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: event.location
      ? { "@type": "Place", name: event.location }
      : undefined
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <EventLandingClient event={event} token={token ?? null} />
    </>
  );
}
