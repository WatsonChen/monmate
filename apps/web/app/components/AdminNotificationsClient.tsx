"use client";

import type { EventDTO } from "@monmate/types";
import { Send } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { AdminShell } from "./AdminShell";

export function AdminNotificationsClient() {
  const [token, setToken] = useState("");
  const [events, setEvents] = useState<EventDTO[]>([]);
  const [eventId, setEventId] = useState("");
  const [message, setMessage] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setToken(window.localStorage.getItem("monmate.token") ?? "");
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }

    async function loadEvents() {
      const response = await apiFetch<EventDTO[]>("/events", { token });

      if (!response.success || !response.data) {
        setMessage(response.error?.message ?? "讀取活動失敗");
        return;
      }

      setEvents(response.data);
      setEventId(response.data[0]?.id ?? "");
    }

    void loadEvents();
  }, [token]);

  async function submit() {
    if (!eventId) {
      setMessage("請先選擇活動");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    const response = await apiFetch<{ message: string }>(
      `/events/${eventId}/notifications/pre-event`,
      {
        method: "POST",
        token,
        body: JSON.stringify({ content })
      }
    );

    setIsSubmitting(false);
    setMessage(
      response.success
        ? response.data?.message ?? "已建立通知任務"
        : response.error?.message ?? "建立通知任務失敗"
    );
  }

  return (
    <AdminShell>
      <div>
        <p className="text-sm font-bold text-orange">寄送資訊</p>
        <h1 className="text-2xl font-bold">行前說明與報到連結</h1>
      </div>

      {message ? (
        <section className="mt-5 rounded-lg border border-orange/20 bg-orange/10 p-4 text-sm font-semibold">
          {message}
        </section>
      ) : null}

      <section className="mt-5 rounded-lg border border-charcoal/10 bg-white p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-mint/30">
            <Send size={20} />
          </span>
          <div>
            <h2 className="text-lg font-bold">通知任務</h2>
            <p className="text-sm text-charcoal/60">MVP 先保留 email / SMS / LINE 擴充介面</p>
          </div>
        </div>

        <label className="mt-5 block text-sm font-semibold">
          活動
          <select
            value={eventId}
            onChange={(event) => setEventId(event.target.value)}
            className="mt-2 h-11 w-full rounded-lg border border-charcoal/15 bg-paper px-3 outline-none focus:border-mint"
          >
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
        </label>
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className="mt-5 min-h-40 w-full rounded-lg border border-charcoal/15 bg-paper p-3 text-sm outline-none focus:border-mint"
          placeholder="輸入行前說明內容"
        />
        <button
          type="button"
          disabled={!token || !eventId || isSubmitting}
          onClick={submit}
          className="mt-4 flex h-11 items-center gap-2 rounded-lg bg-orange px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-charcoal/25"
        >
          <Send size={18} />
          {isSubmitting ? "建立中..." : "建立寄送任務"}
        </button>
      </section>
    </AdminShell>
  );
}
