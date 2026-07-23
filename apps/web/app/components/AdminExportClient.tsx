"use client";

import type { EventDTO } from "@monmate/types";
import { Download, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch, getApiBaseUrl } from "../lib/api";
import { LogoSpinner } from "./LogoSpinner";
import { AnalyticsReport, type Analytics } from "./AnalyticsReport";

export function AdminExportClient() {
  const [token, setToken] = useState("");
  const [events, setEvents] = useState<EventDTO[]>([]);
  const [eventId, setEventId] = useState("");
  const [message, setMessage] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [reportAnalytics, setReportAnalytics] = useState<Analytics | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [pendingPrint, setPendingPrint] = useState(false);

  useEffect(() => {
    setToken(window.localStorage.getItem("monmate.token") ?? "");
  }, []);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    async function loadEvents() {
      setIsLoading(true);
      try {
        const response = await apiFetch<EventDTO[]>("/events", { token });

        if (!response.success || !response.data) {
          setMessage(response.error?.message ?? "讀取活動失敗");
          return;
        }

        setEvents(response.data);
        setEventId(response.data[0]?.id ?? "");
      } catch {
        setMessage("無法連線到伺服器，請稍後再試");
      } finally {
        setIsLoading(false);
      }
    }

    void loadEvents();
  }, [token]);

  // window.print() only has something to print once the report has
  // actually painted, so the print call waits for the next frame after
  // the fetched data lands in state rather than firing right after fetch.
  useEffect(() => {
    if (!pendingPrint || !reportAnalytics) return;
    setPendingPrint(false);
    requestAnimationFrame(() => window.print());
  }, [pendingPrint, reportAnalytics]);

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

  async function generatePdfReport() {
    if (!eventId) {
      setMessage("尚未設定 API 或活動");
      return;
    }

    setIsGeneratingReport(true);
    setMessage("");

    const response = await apiFetch<Analytics>(`/events/${eventId}/analytics`, { token });

    setIsGeneratingReport(false);

    if (!response.success || !response.data) {
      setMessage(response.error?.message ?? "讀取數據失敗");
      return;
    }

    setReportAnalytics(response.data);
    setPendingPrint(true);
  }

  return (
    <>
      <div className="print:hidden">
        <p className="text-sm font-bold text-orange">匯出報表</p>
        <h1 className="text-2xl font-bold">下載報到紀錄</h1>
      </div>

      {message ? (
        <section className="mt-5 rounded-lg border border-orange/20 bg-orange/10 p-4 text-sm font-semibold print:hidden">
          {message}
        </section>
      ) : null}

      <section className="mt-5 rounded-lg border border-charcoal/10 bg-white p-5 print:hidden">
        <label className="text-sm font-semibold">
          選擇活動
          {token && isLoading ? (
            <div className="mt-2 flex justify-center py-4">
              <LogoSpinner size={40} />
            </div>
          ) : (
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
          )}
        </label>
      </section>

      <div className="mt-5 grid gap-5 md:grid-cols-2 print:hidden">
        <section className="rounded-lg border border-charcoal/10 bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange/15 text-orange">
              <Download size={20} />
            </span>
            <div>
              <h2 className="text-lg font-bold">CSV / Excel 報表</h2>
              <p className="text-sm text-charcoal/60">包含姓名、電話、報到狀態、報到時間、報到方式</p>
            </div>
          </div>

          <button
            type="button"
            disabled={!token || !eventId || isExporting}
            onClick={exportCsv}
            className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-orange px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-charcoal/25"
          >
            <Download size={18} />
            {isExporting ? "匯出中..." : "匯出報表"}
          </button>
        </section>

        <section className="rounded-lg border border-charcoal/10 bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-mint/25 text-charcoal">
              <Printer size={20} />
            </span>
            <div>
              <h2 className="text-lg font-bold">PDF 活動摘要報告</h2>
              <p className="text-sm text-charcoal/60">報名/報到統計與圖表，適合列印或存成 PDF</p>
            </div>
          </div>

          <button
            type="button"
            disabled={!token || !eventId || isGeneratingReport}
            onClick={() => void generatePdfReport()}
            className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-mint/30 px-4 text-sm font-bold text-charcoal disabled:cursor-not-allowed disabled:bg-charcoal/10"
          >
            <Printer size={18} />
            {isGeneratingReport ? "產生中..." : "下載 PDF"}
          </button>
        </section>
      </div>

      {reportAnalytics && (
        <div className="mt-5 rounded-lg border border-charcoal/10 bg-white p-5 print:border-0 print:p-0">
          <AnalyticsReport analytics={reportAnalytics} />
        </div>
      )}
    </>
  );
}
