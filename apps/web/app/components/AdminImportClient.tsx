"use client";

import type { EventDTO } from "@monmate/types";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { ImportWizard } from "./ImportWizard";

export function AdminImportClient() {
  const [token, setToken] = useState("");
  const [events, setEvents] = useState<EventDTO[]>([]);
  const [eventId, setEventId] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setToken(window.localStorage.getItem("monmate.token") ?? "");
  }, []);

  useEffect(() => {
    if (!token) return;
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

  return (
    <>
      <div>
        <p className="text-sm font-bold text-orange">匯入名單</p>
        <h1 className="text-2xl font-bold">上傳報名名單</h1>
      </div>

      {message ? (
        <section className="mt-5 rounded-lg border border-orange/20 bg-orange/10 p-4 text-sm font-semibold">
          {message}
        </section>
      ) : null}

      <section className="mt-5 rounded-lg border border-charcoal/10 bg-white p-5">
        <label className="block text-sm font-semibold sm:max-w-sm">
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
        <div className="mt-4">
          {token && eventId ? <ImportWizard key={eventId} eventId={eventId} token={token} /> : null}
        </div>
      </section>
    </>
  );
}
