"use client";

import type { EventDTO } from "@monmate/types";
import Link from "next/link";
import {
  CalendarPlus,
  ClipboardCheck,
  Search
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/api";
import { AdminShell } from "./AdminShell";
import { VenueQrButton } from "./VenueQrModal";

function formatDate(value: string) {
  return new Date(value).toLocaleString("zh-TW", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function AdminEventsClient() {
  const [token, setToken] = useState("");
  const [events, setEvents] = useState<EventDTO[]>([]);
  const [search, setSearch] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

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
      setSelectedEventId((prev) => prev ?? response.data![0]?.id ?? null);
    }

    void loadEvents();
  }, [token]);

  const filteredEvents = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) {
      return events;
    }

    return events.filter((event) =>
      `${event.name} ${event.slug}`.toLowerCase().includes(keyword)
    );
  }, [events, search]);

  const selectedEvent =
    filteredEvents.find((e) => e.id === selectedEventId) ?? filteredEvents[0];

  return (
    <AdminShell>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-bold text-orange">活動列表</p>
          <h1 className="text-2xl font-bold">管理活動與報到連結</h1>
        </div>
        <Link
          href="/admin/events/new"
          className="flex h-11 items-center justify-center gap-2 rounded-lg bg-orange px-4 text-sm font-bold text-white"
        >
          <CalendarPlus size={18} />
          新增活動
        </Link>
      </div>

      {!token ? (
        <section className="mt-5 rounded-lg border border-charcoal/10 bg-white p-5">
          <p className="text-sm font-semibold text-charcoal/70">請先登入後台。</p>
          <Link
            href="/admin/login"
            className="mt-4 inline-flex h-11 items-center rounded-lg bg-orange px-4 text-sm font-bold text-white"
          >
            前往登入
          </Link>
        </section>
      ) : null}

      {message ? (
        <section className="mt-5 rounded-lg border border-orange/20 bg-orange/10 p-4 text-sm font-semibold">
          {message}
        </section>
      ) : null}

      {selectedEvent ? (
        <section className="mt-5 rounded-lg border border-charcoal/10 bg-white p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-mint/30">
                <ClipboardCheck size={20} />
              </span>
              <div>
                <h2 className="text-lg font-bold">{selectedEvent.name}</h2>
                <p className="text-sm text-charcoal/60">slug: {selectedEvent.slug}</p>
              </div>
            </div>
            <VenueQrButton eventId={selectedEvent.id} eventName={selectedEvent.name} token={token} />
          </div>
        </section>
      ) : null}

      <section className="mt-5 rounded-lg border border-charcoal/10 bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold">活動資料</h2>
          <div className="flex h-10 items-center gap-2 rounded-lg border border-charcoal/15 bg-paper px-3">
            <Search size={16} />
            <input
              className="w-full bg-transparent text-sm outline-none"
              placeholder="搜尋活動名稱 / slug"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>
        <div className="mt-5 overflow-x-auto">
          <div className="min-w-[760px] overflow-hidden rounded-lg border border-charcoal/10">
            <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr] bg-cloud px-4 py-3 text-sm font-bold">
              <span>活動</span>
              <span>開始</span>
              <span>報名</span>
              <span>報到紀錄</span>
              <span>狀態</span>
            </div>
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => setSelectedEventId(event.id)}
                  className={`grid cursor-pointer grid-cols-[1.4fr_1fr_1fr_1fr_1fr] items-center border-t border-charcoal/10 px-4 py-4 text-sm transition-colors ${selectedEvent?.id === event.id ? "bg-mint/10" : "hover:bg-charcoal/5"}`}
                >
                  <span>
                    <Link
                      href={`/admin/events/${event.id}`}
                      className="font-bold hover:text-orange"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {event.name}
                    </Link>
                    <span className="mt-1 block text-xs font-semibold text-charcoal/50">
                      {event.slug || "—"}
                    </span>
                  </span>
                  <span>{formatDate(event.startAt)}</span>
                  <span>{event.attendeeCount ?? 0}</span>
                  <span>{event.checkInLogCount ?? 0}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-orange">可使用</span>
                    <VenueQrButton eventId={event.id} eventName={event.name} token={token} />
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-sm font-semibold text-charcoal/60">
                目前沒有活動資料
              </div>
            )}
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
