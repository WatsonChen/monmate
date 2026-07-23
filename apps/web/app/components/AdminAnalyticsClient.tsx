"use client";

import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { LogoSpinner } from "./LogoSpinner";
import { AnalyticsReport, type Analytics } from "./AnalyticsReport";

type EventSummary = { id: string; name: string };

export function AdminAnalyticsClient() {
  const [token, setToken] = useState("");
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    const t = window.localStorage.getItem("monmate.token") ?? "";
    setToken(t);
    if (!t) return;
    void apiFetch<EventSummary[]>("/events", { token: t }).then((res) => {
      if (res.success && res.data) {
        setEvents(res.data);
        // /events is sorted by start date (latest first) — default to the
        // most recent event so users don't have to pick one every time.
        setSelectedId(res.data[0]?.id ?? "");
      }
    });
  }, []);

  function loadAnalytics(eventId: string, authToken: string, onCancelled?: () => boolean) {
    setLoading(true);
    void apiFetch<Analytics>(`/events/${eventId}/analytics`, { token: authToken })
      .then((res) => {
        if (onCancelled?.()) return;
        if (res.success && res.data) {
          setAnalytics(res.data);
          setLastUpdatedAt(new Date());
        }
      })
      .finally(() => {
        if (!onCancelled?.()) setLoading(false);
      });
  }

  useEffect(() => {
    if (!selectedId || !token) return;
    let cancelled = false;
    loadAnalytics(selectedId, token, () => cancelled);
    return () => {
      cancelled = true;
    };
  }, [selectedId, token]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-orange">報表分析</p>
          <h1 className="text-2xl font-bold">活動數據</h1>
        </div>
        {analytics && (
          <div className="flex items-center gap-2 text-xs text-charcoal/50">
            {lastUpdatedAt && (
              <span>
                更新於{" "}
                {lastUpdatedAt.toLocaleTimeString("zh-TW", {
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </span>
            )}
            <button
              type="button"
              onClick={() => loadAnalytics(selectedId, token)}
              disabled={loading}
              className="flex h-8 items-center gap-1.5 rounded-lg border border-charcoal/15 px-2.5 text-xs font-semibold text-charcoal/70 hover:bg-paper disabled:opacity-50"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              重新整理
            </button>
          </div>
        )}
      </div>

      <section className="mt-5 rounded-lg border border-charcoal/10 bg-white p-5 print:hidden">
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

      {loading && !analytics && (
        <div className="mt-5 flex justify-center py-10">
          <LogoSpinner size={80} />
        </div>
      )}

      {analytics && (
        <div
          className={`mt-5 space-y-5 transition-opacity ${loading ? "pointer-events-none opacity-50" : "opacity-100"}`}
        >
          <AnalyticsReport analytics={analytics} />
        </div>
      )}
    </div>
  );
}
