import { AdminSurveyClient } from "../../components/AdminSurveyClient";

type Props = {
  searchParams: Promise<{ eventId?: string }>;
};

export default async function AdminSurveyPage({ searchParams }: Props) {
  const { eventId } = await searchParams;
  return <AdminSurveyClient initialEventId={eventId} />;
}
