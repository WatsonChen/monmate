"use client";

import type { EventDTO } from "@monmate/types";
import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch, getApiBaseUrl } from "../lib/api";
import { AdminShell } from "./AdminShell";

export function AdminExportClient() {
  const [token, setToken] = useState("");
  const [events, setEvents] = useState<EventDTO[]>([]);
  const [eventId, setEventId] = useState("");
  const [message, setMessage] = useState("");
  const [isExporting, setIsExporting] = useState(false);

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

  async function exportCsv() {
    const apiBaseUrl = getApiBaseUrl();

    if (!apiBaseUrl || !eventId) {
      setMessage("尚未設定 API 或活動");
      return;
    }

    setIsExporting(true);
    setMessage("");

    const response = await fetch(`${apiBaseUrl}/events/${eventId}/attendees/export`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setIsExporting(false);

    if (!response.ok) {
      setMessage("匯出失敗");
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `monmate-attendees-${eventId}.csv`;
    document.body.append(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  return (
    <AdminShell>
      <div>
        <p className="text-sm font-bold text-orange">匯出報表</p>
        <h1 className="text-2xl font-bold">下載報到紀錄</h1>
      </div>

      {message ? (
        <section className="mt-5 rounded-lg border border-orange/20 bg-orange/10 p-4 text-sm font-semibold">
          {message}
        </section>
      ) : null}

      <section className="mt-5 rounded-lg border border-charcoal/10 bg-white p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange/15 text-orange">
            <Download size={20} />
          </span>
          <div>
            <h2 className="text-lg font-bold">CSV / Excel 報表</h2>
            <p className="text-sm text-charcoal/60">包含姓名、電話、報到狀態、報到時間、報到方式</p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end">
          <label className="min-w-0 flex-1 text-sm font-semibold">
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
          <button
            type="button"
            disabled={!token || !eventId || isExporting}
            onClick={exportCsv}
            className="flex h-11 items-center justify-center gap-2 rounded-lg bg-orange px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-charcoal/25"
          >
            <Download size={18} />
            {isExporting ? "匯出中..." : "匯出報表"}
          </button>
        </div>
      </section>
    </AdminShell>
  );
}
