import { AdminSurveyClient } from "../../components/AdminSurveyClient";
import { AdminShell } from "../../components/AdminShell";

type Props = {
  searchParams: Promise<{ eventId?: string }>;
};

export default async function AdminSurveyPage({ searchParams }: Props) {
  const { eventId } = await searchParams;
  return <AdminShell><AdminSurveyClient initialEventId={eventId} /></AdminShell>;
}
