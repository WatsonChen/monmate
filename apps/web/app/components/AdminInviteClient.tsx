"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { Send } from "lucide-react";

type EventSummary = { id: string; name: string; slug: string };

export function AdminInviteClient() {
  const [token, setToken] = useState("");
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [template, setTemplate] = useState<"with-registration" | "without-registration">("without-registration");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);
  const [message, setMessage] = useState("");
  const [confirmSend, setConfirmSend] = useState(false);

  useEffect(() => {
    const t = window.localStorage.getItem("monmate.token") ?? "";
    setToken(t);
    if (!t) return;
    void apiFetch<EventSummary[]>("/events", { token: t }).then((res) => {
      if (res.success && res.data) setEvents(res.data);
    });
  }, []);

  async function sendInvites() {
    if (!selectedId) { setMessage("請先選擇活動"); return; }
    setSending(true);
    setMessage("");
    setResult(null);
    const res = await apiFetch<{ sent: number; failed: number }>(`/events/${selectedId}/invite`, {
      method: "POST",
      token,
      body: JSON.stringify({ template })
    });
    setSending(false);
    setConfirmSend(false);
    if (!res.success || !res.data) { setMessage(res.error?.message ?? "發送失敗"); return; }
    setResult(res.data);
  }

  const selectedEvent = events.find((e) => e.id === selectedId);

  const TEMPLATES = [
    {
      id: "without-registration" as const,
      label: "直接提供票券",
      desc: "簡訊含 QR Code 連結，點開即可報到，不需填寫資料"
    },
    {
      id: "with-registration" as const,
      label: "需要填寫報名資訊",
      desc: "簡訊含報名連結，填寫完成後才顯示 QR Code"
    }
  ];

  return (
    <div>
      <p className="text-sm font-bold text-orange">簡訊邀請</p>
      <h1 className="text-2xl font-bold">發送活動邀請</h1>

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

      <section className="mt-4 rounded-lg border border-charcoal/10 bg-white p-5">
        <p className="text-sm font-semibold">選擇簡訊模板</p>
        <div className="mt-3 space-y-3">
          {TEMPLATES.map((t) => (
            <label
              key={t.id}
              className={`flex cursor-pointer gap-3 rounded-lg border p-4 ${
                template === t.id ? "border-orange bg-orange/5" : "border-charcoal/15"
              }`}
            >
              <input
                type="radio"
                name="template"
                value={t.id}
                checked={template === t.id}
                onChange={() => setTemplate(t.id)}
                className="mt-0.5"
              />
              <div>
                <p className="text-sm font-bold">{t.label}</p>
                <p className="mt-0.5 text-xs text-charcoal/60">{t.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-lg border border-charcoal/10 bg-white p-5">
        <p className="mb-2 text-sm font-semibold">簡訊預覽</p>
        <div className="rounded-lg bg-charcoal/5 p-3 text-xs text-charcoal/70">
          {template === "without-registration"
            ? "【MonMate】王小明 您好，您已報名「活動名稱」(2026/6/5)。報到 QR Code：https://monmate.vercel.app/event/slug/ticket?token=..."
            : "【MonMate】王小明 您好，您已受邀參加「活動名稱」(2026/6/5)。請點擊連結完成報名並取得報到 QR Code：https://monmate.vercel.app/event/slug/ticket?token=..."}
        </div>
      </section>

      {message && (
        <div className="mt-3 rounded-lg border border-orange/20 bg-orange/10 p-3 text-sm">{message}</div>
      )}
      {result && (
        <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3 text-sm font-semibold text-green-800">
          ✅ 已發送 {result.sent} 封，失敗 {result.failed} 封
        </div>
      )}

      <button
        type="button"
        disabled={!selectedId || sending}
        onClick={() => setConfirmSend(true)}
        className="mt-4 flex h-11 items-center gap-2 rounded-lg bg-orange px-4 text-sm font-bold text-white disabled:opacity-40"
      >
        <Send size={16} />
        {sending ? "發送中…" : "發送簡訊邀請"}
      </button>

      {confirmSend && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-charcoal/30 p-6">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold">確認發送簡訊邀請？</h2>
            <p className="mt-2 text-sm text-charcoal/70">
              將發送給「{selectedEvent?.name ?? "此活動"}」的所有報名者，簡訊需要額外費用，此操作無法撤銷。
            </p>
            <div className="mt-5 flex gap-2">
              <button type="button" onClick={() => setConfirmSend(false)}
                className="flex-1 rounded-lg border border-charcoal/15 py-2.5 text-sm font-semibold">取消</button>
              <button type="button" disabled={sending} onClick={() => void sendInvites()}
                className="flex-1 rounded-lg bg-orange py-2.5 text-sm font-bold text-white disabled:opacity-40">
                {sending ? "發送中…" : "確認發送"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
