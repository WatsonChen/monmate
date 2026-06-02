"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { Send, Plus, Trash2 } from "lucide-react";

type Question = { id?: string; question: string; type: string; options: string[]; order: number };
type Survey = { id: string; title: string; sentAt: string | null; questions: Question[] };
type EventSummary = { id: string; name: string; endAt: string | null };

export function AdminSurveyClient() {
  const [token, setToken] = useState("");
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [confirmSend, setConfirmSend] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const t = window.localStorage.getItem("monmate.token") ?? "";
    setToken(t);
    if (!t) return;
    void apiFetch<EventSummary[]>("/events", { token: t }).then((res) => {
      if (res.success && res.data) setEvents(res.data);
    });
  }, []);

  useEffect(() => {
    if (!selectedId || !token) return;
    void apiFetch<Survey>(`/events/${selectedId}/survey`, { token }).then((res) => {
      if (!res.success || !res.data) return;
      setSurvey(res.data);
      setTitle(res.data.title);
      setQuestions(res.data.questions);
    });
  }, [selectedId, token]);

  async function save() {
    if (!selectedId) return;
    setSaving(true);
    const res = await apiFetch<Survey>(`/events/${selectedId}/survey`, {
      method: "PUT",
      token,
      body: JSON.stringify({ title, questions: questions.map((q, i) => ({ ...q, order: i + 1 })) })
    });
    setSaving(false);
    if (res.success && res.data) { setSurvey(res.data); setMessage("已儲存"); }
  }

  async function sendSurvey() {
    if (!selectedId) return;
    setSending(true);
    const res = await apiFetch<{ sent: number; failed: number }>(`/events/${selectedId}/survey/send`, {
      method: "POST",
      token
    });
    setSending(false);
    setConfirmSend(false);
    if (!res.success || !res.data) { setMessage(res.error?.message ?? "發送失敗"); return; }
    setMessage(`✅ 問卷已發送給 ${res.data.sent} 位已報到的參與者`);
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, { question: "", type: "text", options: [], order: prev.length + 1 }]);
  }

  function removeQuestion(index: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  }

  function updateQuestion(index: number, updates: Partial<Question>) {
    setQuestions((prev) => prev.map((q, i) => i === index ? { ...q, ...updates } : q));
  }

  const selectedEvent = events.find((e) => e.id === selectedId);
  const hoursUntilAutoSend = selectedEvent?.endAt
    ? Math.round((new Date(selectedEvent.endAt).getTime() + 3 * 60 * 60 * 1000 - Date.now()) / (1000 * 60 * 60))
    : null;

  return (
    <div>
      <p className="text-sm font-bold text-orange">活動問卷</p>
      <h1 className="text-2xl font-bold">問卷管理</h1>

      <section className="mt-5 rounded-lg border border-charcoal/10 bg-white p-5">
        <label className="text-sm font-semibold">
          選擇活動
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="mt-2 h-10 w-full rounded-lg border border-charcoal/15 bg-paper px-3 text-sm outline-none focus:border-mint"
          >
            <option value="">— 請選擇 —</option>
            {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
          </select>
        </label>
      </section>

      {survey && (
        <>
          <section className="mt-4 rounded-lg border border-charcoal/10 bg-white p-5">
            <label className="text-sm font-semibold">
              問卷標題
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-2 h-10 w-full rounded-lg border border-charcoal/15 bg-paper px-3 text-sm outline-none focus:border-mint"
              />
            </label>
          </section>

          <section className="mt-4 space-y-3">
            {questions.map((q, i) => (
              <div key={i} className="rounded-lg border border-charcoal/10 bg-white p-4">
                <div className="flex items-start gap-2">
                  <div className="flex-1 space-y-2">
                    <input
                      value={q.question}
                      onChange={(e) => updateQuestion(i, { question: e.target.value })}
                      placeholder={`問題 ${i + 1}`}
                      className="h-9 w-full rounded-lg border border-charcoal/15 bg-paper px-3 text-sm outline-none focus:border-mint"
                    />
                    <select
                      value={q.type}
                      onChange={(e) => updateQuestion(i, { type: e.target.value })}
                      className="h-9 rounded-lg border border-charcoal/15 bg-paper px-2 text-xs outline-none"
                    >
                      <option value="text">開放式文字</option>
                      <option value="rating">1-5 分評分</option>
                      <option value="choice">單選題</option>
                    </select>
                  </div>
                  <button type="button" onClick={() => removeQuestion(i)} className="text-charcoal/30 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </section>

          <button
            type="button"
            onClick={addQuestion}
            className="mt-3 flex h-9 items-center gap-2 rounded-lg border border-dashed border-charcoal/20 px-3 text-xs font-semibold text-charcoal/50"
          >
            <Plus size={14} /> 新增問題
          </button>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => void save()}
              className="flex h-10 items-center gap-2 rounded-lg bg-mint/30 px-4 text-sm font-bold text-charcoal disabled:opacity-40"
            >
              {saving ? "儲存中…" : "儲存問卷"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmSend(true)}
              className="flex h-10 items-center gap-2 rounded-lg bg-orange px-4 text-sm font-bold text-white"
            >
              <Send size={14} /> 手動發送問卷
            </button>
          </div>

          {hoursUntilAutoSend !== null && hoursUntilAutoSend > 0 && (
            <p className="mt-3 text-xs text-charcoal/50">
              ⏱ 活動結束後 3 小時自動發送（約 {hoursUntilAutoSend} 小時後）
            </p>
          )}
          {survey.sentAt && (
            <p className="mt-2 text-xs text-charcoal/50">
              最後發送：{new Date(survey.sentAt).toLocaleString("zh-TW")}
            </p>
          )}
        </>
      )}

      {confirmSend && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-charcoal/30 p-6">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold">確認發送問卷？</h2>
            <p className="mt-2 text-sm text-charcoal/70">
              將發送給所有已報到的參與者，此操作無法撤銷。
            </p>
            <div className="mt-5 flex gap-2">
              <button type="button" onClick={() => setConfirmSend(false)}
                className="flex-1 rounded-lg border border-charcoal/15 py-2.5 text-sm font-semibold">取消</button>
              <button type="button" disabled={sending} onClick={() => void sendSurvey()}
                className="flex-1 rounded-lg bg-orange py-2.5 text-sm font-bold text-white disabled:opacity-40">
                {sending ? "發送中…" : "確認發送"}
              </button>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div className="mt-4 rounded-lg border border-mint/30 bg-mint/10 p-3 text-sm font-semibold">{message}</div>
      )}
    </div>
  );
}
