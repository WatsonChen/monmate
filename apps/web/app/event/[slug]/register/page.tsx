import type { ApiResponse } from "@monmate/types";
import Link from "next/link";
import { BrandLogo } from "../../../components/BrandLogo";
import { EventRegisterClient } from "../../../components/EventRegisterClient";

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
  registrationRequired: boolean;
  registrationFields: Array<{ key: "email" | "age" | "gender"; required: boolean }>;
};

type AttendeeBasic = {
  id: string;
  name: string;
  phone: string;
  checkInCode: string;
  qrToken: string;
  checkInStatus: string;
};

async function getData(slug: string, token: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (!apiUrl) return null;
  try {
    const [eventRes, ticketRes] = await Promise.all([
      fetch(`${apiUrl}/events/public/${slug}`, { cache: "no-store" }),
      fetch(`${apiUrl}/events/ticket/${slug}?token=${token}`, { cache: "no-store" })
    ]);
    const eventBody = (await eventRes.json()) as ApiResponse<PublicEvent>;
    const ticketBody = (await ticketRes.json()) as ApiResponse<{ event: PublicEvent; attendee: AttendeeBasic | null }>;
    if (!eventBody.success || !eventBody.data) return null;
    return {
      event: eventBody.data,
      attendee: ticketBody.success ? (ticketBody.data?.attendee ?? null) : null
    };
  } catch {
    return null;
  }
}

export default async function EventRegisterPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { slug } = await params;
  const { token } = await searchParams;

  if (!token) {
    return (
      <main className="mx-auto grid min-h-dvh max-w-md place-items-center px-5 py-8">
        <section className="w-full rounded-lg border border-charcoal/10 bg-white p-6 text-center shadow-soft">
          <BrandLogo variant="horizontal" className="mx-auto h-16 w-48 object-contain" />
          <h1 className="mt-6 text-xl font-bold">連結無效</h1>
          <p className="mt-2 text-sm leading-6 text-charcoal/65">
            請使用簡訊中收到的完整連結開啟報名頁面。
          </p>
        </section>
      </main>
    );
  }

  const data = await getData(slug, token);

  if (!data?.event) {
    return (
      <main className="mx-auto grid min-h-dvh max-w-md place-items-center px-5 py-8">
        <section className="w-full rounded-lg border border-charcoal/10 bg-white p-6 text-center shadow-soft">
          <BrandLogo variant="horizontal" className="mx-auto h-16 w-48 object-contain" />
          <h1 className="mt-6 text-xl font-bold">找不到活動</h1>
          <Link href="/" className="mt-5 inline-flex h-11 items-center rounded-lg bg-orange px-4 text-sm font-bold text-white">
            回到 MonMate
          </Link>
        </section>
      </main>
    );
  }

  return (
    <EventRegisterClient
      event={data.event}
      attendee={data.attendee}
      token={token}
    />
  );
}
