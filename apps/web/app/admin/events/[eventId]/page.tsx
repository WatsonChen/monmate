import { AdminEventDetailClient } from "../../../components/AdminEventDetailClient";

type Props = {
  params: Promise<{ eventId: string }>;
};

export default async function AdminEventDetailPage({ params }: Props) {
  const { eventId } = await params;
  return <AdminEventDetailClient eventId={eventId} />;
}
