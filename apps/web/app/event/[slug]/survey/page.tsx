"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { apiFetch } from "../../../lib/api";

type Question = { id: string; question: string; type: string; options: string[]; order: number };
type Survey = { id: string; title: string; questions: Question[] };
type SurveyData = { survey: Survey; attendeeId: string; attendeeName: string };

export default function SurveyPage() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [data, setData] = useState<SurveyData | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [eventId, setEventId] = useState("");

  useEffect(() => {
    if (!params.slug || !token) { setLoading(false); return; }
    void apiFetch<{ id: string }>(`/events/public/${params.slug}`)
      .then(async (res) => {
        if (!res.success || !res.data) return;
        setEventId(res.data.id);
        const survey = await apiFetch<SurveyData>(`/events/${res.data.id}/survey/public?token=${token}`);
        if (survey.success && survey.data) setData(survey.data);
      })
      .finally(() => setLoading(false));
  }, [params.slug, token]);

  async function submit() {
    if (!data) return;
    await apiFetch("/events/respond", {
      method: "POST",
      body: JSON.stringify({ surveyId: data.survey.id, attendeeId: data.attendeeId, answers })
    });
    setSubmitted(true);
  }

  if (loading) return <main className="grid min-h-dvh place-items-center"><p>載入中…</p></main>;
  if (submitted) return (
    <main className="grid min-h-dvh place-items-center p-6 text-center">
      <div>
        <p className="text-4xl">🙏</p>
        <p className="mt-3 text-xl font-bold">感謝您的回饋！</p>
        <p className="mt-1 text-sm text-charcoal/60">您的意見對我們很重要</p>
      </div>
    </main>
  );
  if (!data) return (
    <main className="grid min-h-dvh place-items-center p-6 text-center">
      <p className="font-semibold text-charcoal/60">找不到問卷</p>
    </main>
  );

  return (
    <main className="min-h-dvh bg-paper p-4">
      <div className="mx-auto max-w-sm space-y-4">
        <div className="text-center">
          <h1 className="text-xl font-bold">{data.survey.title}</h1>
          <p className="mt-1 text-sm text-charcoal/60">Hi {data.attendeeName}，請花一分鐘填寫問卷</p>
        </div>

        {data.survey.questions.map((q) => (
          <div key={q.id} className="rounded-lg border border-charcoal/10 bg-white p-4">
            <p className="text-sm font-semibold">{q.question}</p>
            {q.type === "text" && (
              <textarea
                value={answers[q.id] ?? ""}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                className="mt-2 w-full rounded-lg border border-charcoal/15 p-2 text-sm outline-none focus:border-mint"
                rows={3}
                placeholder="請輸入您的回覆…"
              />
            )}
            {q.type === "rating" && (
              <div className="mt-3 flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: String(n) }))}
                    className={`h-10 flex-1 rounded-lg border text-sm font-bold transition-colors ${
                      answers[q.id] === String(n) ? "border-orange bg-orange text-white" : "border-charcoal/15 bg-white"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            )}
            {q.type === "choice" && q.options.map((opt) => (
              <label key={opt} className={`mt-2 flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 text-sm ${
                answers[q.id] === opt ? "border-orange bg-orange/10" : "border-charcoal/15"
              }`}>
                <input
                  type="radio"
                  name={q.id}
                  value={opt}
                  checked={answers[q.id] === opt}
                  onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                />
                {opt}
              </label>
            ))}
          </div>
        ))}

        <button
          type="button"
          onClick={() => void submit()}
          className="w-full rounded-lg bg-orange py-3 font-bold text-white"
        >
          送出問卷
        </button>
      </div>
    </main>
  );
}
