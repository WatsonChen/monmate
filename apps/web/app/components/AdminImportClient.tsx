"use client";

import type { EventDTO } from "@monmate/types";
import { FileSpreadsheet, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { AdminShell } from "./AdminShell";

export function AdminImportClient() {
  const [token, setToken] = useState("");
  const [events, setEvents] = useState<EventDTO[]>([]);
  const [eventId, setEventId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

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

  async function upload() {
    if (!eventId || !file) {
      setMessage("請選擇活動與 Excel 檔案");
      return;
    }

    const form = new FormData();
    form.append("file", file);

    setIsUploading(true);
    setMessage("");

    const response = await apiFetch<{ imported: number }>(
      `/events/${eventId}/attendees/import`,
      {
        method: "POST",
        token,
        body: form
      }
    );

    setIsUploading(false);

    if (!response.success || !response.data) {
      setMessage(response.error?.message ?? "匯入失敗");
      return;
    }

    setMessage(`已匯入 ${response.data.imported} 筆名單`);
    setFile(null);
  }

  return (
    <AdminShell>
      <div>
        <p className="text-sm font-bold text-orange">匯入名單</p>
        <h1 className="text-2xl font-bold">上傳報名 Excel</h1>
      </div>

      {message ? (
        <section className="mt-5 rounded-lg border border-orange/20 bg-orange/10 p-4 text-sm font-semibold">
          {message}
        </section>
      ) : null}

      <section className="mt-5 rounded-lg border border-charcoal/10 bg-white p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange/15 text-orange">
            <FileSpreadsheet size={20} />
          </span>
          <div>
            <h2 className="text-lg font-bold">名單欄位</h2>
            <p className="text-sm text-charcoal/60">至少包含姓名、電話</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label className="text-sm font-semibold">
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
          <label className="text-sm font-semibold">
            Excel 檔案
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="mt-2 block h-11 w-full rounded-lg border border-charcoal/15 bg-paper px-3 py-2 text-sm outline-none focus:border-mint"
            />
          </label>
          <button
            type="button"
            disabled={!token || !eventId || !file || isUploading}
            onClick={upload}
            className="flex h-11 items-center justify-center gap-2 rounded-lg bg-orange px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-charcoal/25"
          >
            <Upload size={18} />
            {isUploading ? "匯入中..." : "匯入"}
          </button>
        </div>

        <div className="mt-5 rounded-lg border border-dashed border-charcoal/20 bg-paper p-8 text-center text-sm font-semibold text-charcoal/65">
          {file ? file.name : "Excel 上傳區"}
        </div>
      </section>
    </AdminShell>
  );
}
