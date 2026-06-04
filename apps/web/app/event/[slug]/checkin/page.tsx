import type { ApiResponse, EventDTO } from "@monmate/types";
import Link from "next/link";
import { BrandLogo } from "../../../components/BrandLogo";
import { SelfCheckInClient } from "../../../components/SelfCheckInClient";

async function getPublicEvent(slug: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    return null;
  }

  try {
    const response = await fetch(`${apiUrl}/events/public/${slug}`, {
      cache: "no-store"
    });
    const body = (await response.json()) as ApiResponse<EventDTO>;
    return body.success ? body.data ?? null : null;
  } catch {
    return null;
  }
}

export default async function EventCheckInPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ v?: string }>;
}) {
  const { slug } = await params;
  const { v: venueCode } = await searchParams;
  const event = await getPublicEvent(slug);

  if (!event) {
    return (
      <main className="mx-auto grid min-h-dvh max-w-md place-items-center px-5 py-8">
        <section className="w-full rounded-lg border border-charcoal/10 bg-white p-6 text-center shadow-soft">
          <BrandLogo variant="horizontal" className="mx-auto h-16 w-48 object-contain" />
          <h1 className="mt-6 text-xl font-bold">找不到活動報到頁</h1>
          <p className="mt-2 text-sm leading-6 text-charcoal/65">
            這個活動連結可能尚未建立，或活動代碼不正確。
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex h-11 items-center rounded-lg bg-orange px-4 text-sm font-bold text-white"
          >
            回到 MonMate
          </Link>
        </section>
      </main>
    );
  }

  if (!venueCode) {
    return (
      <main className="mx-auto grid min-h-dvh max-w-md place-items-center px-5 py-8">
        <section className="w-full rounded-lg border border-charcoal/10 bg-white p-6 text-center shadow-soft">
          <BrandLogo variant="horizontal" className="mx-auto h-16 w-48 object-contain" />
          <h1 className="mt-6 text-xl font-bold">請至活動現場掃描 QR Code</h1>
          <p className="mt-2 text-sm leading-6 text-charcoal/65">
            自助報到需在活動現場，掃描現場張貼的 QR Code 後即可完成報到。
          </p>
        </section>
      </main>
    );
  }

  return (
    <SelfCheckInClient
      eventId={event.id}
      eventName={event.name}
      eventLocation={event.location}
      venueCode={venueCode}
    />
  );
}
