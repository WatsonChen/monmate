"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

type Analytics = {
  eventId: string;
  eventName: string;
  total: number;
  checkedIn: number;
  notCheckedIn: number;
  checkInRate: number;
  ageGroups: Record<string, number>;
  genderCounts: Record<string, number>;
  checkInByHour: Record<number, number>;
};

type EventSummary = { id: string; name: string };

const GENDER_LABELS: Record<string, string> = { M: "男", F: "女", OTHER: "其他" };

export function AdminAnalyticsClient() {
  const [token, setToken] = useState("");
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    void apiFetch<Analytics>(`/events/${selectedId}/analytics`, { token })
      .then((res) => { if (res.success && res.data) setAnalytics(res.data); })
      .finally(() => setLoading(false));
  }, [selectedId, token]);

  const maxHour = analytics ? Math.max(...Object.values(analytics.checkInByHour), 1) : 1;

  return (
    <div>
      <p className="text-sm font-bold text-orange">報表分析</p>
      <h1 className="text-2xl font-bold">活動數據</h1>

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

      {loading && <p className="mt-5 text-sm text-charcoal/50">載入中…</p>}

      {analytics && !loading && (
        <div className="mt-5 space-y-5">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "總報名", value: analytics.total },
              { label: "已報到", value: analytics.checkedIn },
              { label: "報到率", value: `${analytics.checkInRate}%` }
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-charcoal/10 bg-white p-4 text-center">
                <p className="text-2xl font-bold">{item.value}</p>
                <p className="text-xs text-charcoal/60">{item.label}</p>
              </div>
            ))}
          </div>

          {Object.keys(analytics.genderCounts).length > 0 && (
            <div className="rounded-lg border border-charcoal/10 bg-white p-5">
              <h2 className="mb-3 text-sm font-bold">性別分佈</h2>
              <div className="flex gap-4">
                {Object.entries(analytics.genderCounts).map(([g, count]) => (
                  <div key={g} className="flex-1 text-center">
                    <div className="text-xl font-bold">{count}</div>
                    <div className="text-xs text-charcoal/60">{GENDER_LABELS[g] ?? g}</div>
                    <div className="mt-1 text-xs text-charcoal/40">
                      {analytics.total > 0 ? Math.round(count / analytics.total * 100) : 0}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {Object.keys(analytics.ageGroups).length > 0 && (
            <div className="rounded-lg border border-charcoal/10 bg-white p-5">
              <h2 className="mb-3 text-sm font-bold">年齡分佈</h2>
              <div className="space-y-2">
                {Object.entries(analytics.ageGroups).sort().map(([group, count]) => (
                  <div key={group} className="flex items-center gap-3">
                    <span className="w-20 text-xs text-charcoal/60">{group}</span>
                    <div className="flex-1 rounded-full bg-charcoal/10 h-5">
                      <div
                        className="h-5 rounded-full bg-orange"
                        style={{ width: `${analytics.total > 0 ? (count / analytics.total) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="w-6 text-right text-xs font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {Object.keys(analytics.checkInByHour).length > 0 && (
            <div className="rounded-lg border border-charcoal/10 bg-white p-5">
              <h2 className="mb-3 text-sm font-bold">報到時間分佈</h2>
              <div className="flex items-end gap-1 h-24">
                {Array.from({ length: 24 }, (_, h) => {
                  const count = analytics.checkInByHour[h] ?? 0;
                  const height = count > 0 ? Math.max((count / maxHour) * 96, 4) : 0;
                  return (
                    <div key={h} className="flex flex-1 flex-col items-center gap-1">
                      <div className="w-full rounded-t bg-mint" style={{ height }} title={`${h}時: ${count}人`} />
                      {h % 4 === 0 && <span className="text-[9px] text-charcoal/40">{h}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
