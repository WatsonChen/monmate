import { AdminEventDetailClient } from "../../../components/AdminEventDetailClient";

type Props = {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{ created?: string }>;
};

export default async function AdminEventDetailPage({ params, searchParams }: Props) {
  const { eventId } = await params;
  const { created } = await searchParams;
  return <AdminEventDetailClient eventId={eventId} created={created === "1"} />;
}
