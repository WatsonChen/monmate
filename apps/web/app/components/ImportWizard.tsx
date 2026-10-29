"use client";

import type {
  ImportConfirmDTO,
  ImportDecisionDTO,
  ImportHistoryItemDTO,
  ImportPreviewDTO,
  ImportResultDTO,
  ImportSessionDTO,
  InsufficientCreditsDetails,
  PaymentStatusDTO
} from "@monmate/types";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Download, FileSpreadsheet, History, Upload, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "../lib/api";
import { DotsLoading } from "./DotsLoading";
import { TopUpDialog } from "./TopUpDialog";

type Props = {
  eventId: string;
  token: string;
  onCompleted?: () => void;
  onClose?: () => void;
};

type PaymentNotice = { tone: "info" | "ok" | "warn"; text: string; canRetryPay?: boolean; canRecheck?: boolean };

const POLL_INTERVAL_MS = 2000;
const POLL_MAX_TRIES = 30;

function csvCell(value: string | number) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function downloadErrorCsv(errors: ImportPreviewDTO["errors"], fileName: string) {
  const lines = [["列號", "欄位", "修正原因"], ...errors.map((e) => [e.rowNumber, e.field, e.reason])];
  const blob = new Blob(["﻿" + lines.map((l) => l.map(csvCell).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `匯入錯誤清單-${fileName.replace(/\.[^.]+$/, "")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function Stat({ label, value, hint, tone }: { label: string; value: string | number; hint?: string; tone?: "warn" | "ok" }) {
  return (
    <div className="rounded-lg border border-charcoal/10 bg-white px-3 py-2.5">
      <p className="text-xs text-charcoal/55">{label}</p>
      <p className={`mt-0.5 text-lg font-bold ${tone === "warn" ? "text-red-600" : tone === "ok" ? "text-green-700" : ""}`}>{value}</p>
      {hint ? <p className="text-[11px] text-charcoal/45">{hint}</p> : null}
    </div>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("zh-TW", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export function ImportWizard({ eventId, token, onCompleted, onClose }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreviewDTO | null>(null);
  const [result, setResult] = useState<ImportResultDTO | null>(null);
  const [busy, setBusy] = useState<"" | "upload" | "decide" | "confirm">("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState<PaymentNotice | null>(null);
  const [pendingPaymentId, setPendingPaymentId] = useState<string | null>(null);
  const [reminderDismissed, setReminderDismissed] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<ImportHistoryItemDTO[] | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumedRef = useRef(false);
  const base = `/events/${eventId}/attendees`;

  const loadSession = useCallback(async (sessionId: string) => {
    const res = await apiFetch<ImportSessionDTO>(`${base}/import/${sessionId}`, { token });
    if (!res.success || !res.data) {
      setPreview(null);
      setError(res.error?.code === "IMPORT_SESSION_EXPIRED" || res.error?.code === "IMPORT_SESSION_NOT_FOUND"
        ? "匯入資料已過期或不存在，請重新上傳檔案。"
        : res.error?.message ?? "讀取匯入資料失敗");
      return;
    }
    if (res.data.status === "CONFIRMED") {
      setResult(res.data.result);
      setPreview(null);
    } else {
      setPreview(res.data.preview);
    }
  }, [base, token]);

  const pollPayment = useCallback(async (paymentId: string) => {
    setPaymentNotice({ tone: "info", text: "正在確認付款結果…付款以金流通知為準，可能需要幾秒。" });
    for (let i = 0; i < POLL_MAX_TRIES; i += 1) {
      const res = await apiFetch<PaymentStatusDTO>(`/billing/payments/${paymentId}`, { token });
      if (res.success && res.data) {
        const p = res.data;
        if (p.status === "PAID") {
          window.dispatchEvent(new CustomEvent("credits-changed"));
          setPendingPaymentId(null);
          setPaymentNotice({ tone: "ok", text: "付款成功，點數已入帳。請確認下方最新的費用與餘額後，再按「確認匯入」；系統不會自動執行匯入。" });
          return "PAID" as const;
        }
        if (p.status === "FAILED" || p.status === "CANCELED" || p.status === "EXPIRED") {
          setPendingPaymentId(null);
          setPaymentNotice({ tone: "warn", text: "付款失敗或已取消，沒有扣款也沒有加點。你的匯入資料仍保留，可重新付款。", canRetryPay: true });
          return "FAILED" as const;
        }
        if (p.stale) break;
      }
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }
    setPendingPaymentId(paymentId);
    setPaymentNotice({
      tone: "warn",
      text: "尚未收到付款結果。若你已完成付款，點數會在金流通知到達後自動入帳，可稍後按「重新確認」；若沒有付款，可重新付款。",
      canRetryPay: true,
      canRecheck: true
    });
    return "PENDING" as const;
  }, [token]);

  // 從付款頁回來：用網址上的付款編號向後端確認，再回到同一份預覽並依最新餘額重算
  useEffect(() => {
    if (!token || resumedRef.current) return;
    resumedRef.current = true;
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("importSession");
    const paymentId = params.get("paymentId");
    if (!sessionId) return;
    void (async () => {
      if (paymentId) await pollPayment(paymentId);
      await loadSession(sessionId);
      ["importSession", "paymentId", "payment"].forEach((k) => params.delete(k));
      const query = params.toString();
      window.history.replaceState(null, "", window.location.pathname + (query ? `?${query}` : ""));
    })();
  }, [token, loadSession, pollPayment]);

  async function upload() {
    if (!file) return;
    setBusy("upload");
    setError("");
    setNotice("");
    setPaymentNotice(null);
    const form = new FormData();
    form.append("file", file);
    const res = await apiFetch<ImportPreviewDTO>(`${base}/import/preview`, { method: "POST", token, body: form });
    setBusy("");
    if (!res.success || !res.data) {
      setError(res.error?.message ?? "讀取檔案失敗");
      return;
    }
    setPreview(res.data);
    setFile(null);
  }

  async function decide(body: { decisions?: Record<string, ImportDecisionDTO>; bulk?: "ALL_NEW" | "ALL_SKIP" }) {
    if (!preview) return;
    setBusy("decide");
    setError("");
    const res = await apiFetch<ImportPreviewDTO>(`${base}/import/${preview.sessionId}/decisions`, {
      method: "PUT",
      token,
      body: JSON.stringify(body)
    });
    setBusy("");
    if (!res.success || !res.data) {
      setError(res.error?.message ?? "儲存選擇失敗");
      return;
    }
    setPreview(res.data);
  }

  async function confirmImport() {
    if (!preview) return;
    setBusy("confirm");
    setError("");
    setNotice("");
    const res = await apiFetch<ImportConfirmDTO>(`${base}/import/${preview.sessionId}/confirm`, {
      method: "POST",
      token,
      body: JSON.stringify({ expectedCost: preview.billableHeadcount })
    });
    setBusy("");
    if (!res.success || !res.data) {
      if (res.error?.code === "INSUFFICIENT_ATTENDEE_CREDITS") {
        // 預覽後餘額被用掉：以後端回報的數字更新畫面並開啟儲值
        const d = res.error.details as InsufficientCreditsDetails | undefined;
        if (d) setPreview({ ...preview, wallet: { ...preview.wallet, balance: d.balance, balanceAfter: d.balanceAfter, needsTopUp: true, minTopUp: Math.max(0, d.floor - d.balanceAfter) } });
        setTopUpOpen(true);
        return;
      }
      setError(res.error?.message ?? "匯入失敗");
      return;
    }
    if (res.data.status === "CHANGED") {
      setPreview(res.data.preview);
      setNotice("名單或點數在預覽後有變動，費用已重新計算。請確認新的費用後再按一次「確認匯入」。");
      return;
    }
    setResult(res.data.result);
    setPreview(null);
    setPaymentNotice(null); // 付款後的「請確認」提示在匯入完成後就不適用了
    window.dispatchEvent(new CustomEvent("credits-changed"));
    onCompleted?.();
  }

  async function loadHistory() {
    const res = await apiFetch<ImportHistoryItemDTO[]>(`${base}/imports`, { token });
    if (res.success && res.data) setHistory(res.data);
  }

  function reset() {
    setPreview(null);
    setResult(null);
    setFile(null);
    setError("");
    setNotice("");
    setPaymentNotice(null);
  }

  const returnTo = preview ? `/admin/events/${eventId}?importSession=${preview.sessionId}` : `/admin/events/${eventId}`;
  const c = preview?.counts;
  const nothingToDo = !!c && c.toCreate + c.toUpdate === 0;

  return (
    <div className="mb-4 rounded-lg border border-charcoal/10 bg-paper p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold">匯入名單</p>
          <p className="mt-0.5 text-xs text-charcoal/50">
            支援 Excel (.xlsx / .xls)、CSV，需含「姓名」與「電話」欄位。上傳後會先預覽差異與費用，確認後才寫入。
          </p>
        </div>
        {onClose ? (
          <button type="button" onClick={onClose} aria-label="關閉匯入" className="rounded-lg p-1.5 text-charcoal/50 hover:bg-white">
            <X size={16} />
          </button>
        ) : null}
      </div>

      {paymentNotice ? (
        <div className={`mt-3 rounded-lg border p-3 text-sm ${
          paymentNotice.tone === "ok" ? "border-green-200 bg-green-50 text-green-800"
            : paymentNotice.tone === "warn" ? "border-orange/30 bg-orange/10" : "border-charcoal/10 bg-white"
        }`} role="status">
          <p>{paymentNotice.text}</p>
          {(paymentNotice.canRetryPay || paymentNotice.canRecheck) ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {paymentNotice.canRecheck && pendingPaymentId ? (
                <button type="button" onClick={() => void pollPayment(pendingPaymentId)} className="h-8 rounded-lg border border-charcoal/20 bg-white px-3 text-xs font-bold">重新確認</button>
              ) : null}
              {paymentNotice.canRetryPay && preview ? (
                <button type="button" onClick={() => setTopUpOpen(true)} className="h-8 rounded-lg bg-orange px-3 text-xs font-bold text-white">重新付款</button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {error ? <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700" role="alert">{error}</p> : null}
      {notice ? <p className="mt-3 rounded-lg border border-orange/30 bg-orange/10 p-3 text-sm font-semibold" role="status">{notice}</p> : null}

      {/* 1. 選檔 */}
      {!preview && !result ? (
        <div className="mt-3">
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click(); }}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files?.[0]; if (f) setFile(f); }}
            className={`cursor-pointer rounded-lg border border-dashed p-6 text-center text-sm font-semibold transition-colors ${
              isDragging ? "border-mint bg-mint/10" : "border-charcoal/20 bg-white text-charcoal/65 hover:border-mint/50"
            }`}
          >
            <FileSpreadsheet size={22} className="mx-auto mb-1.5 text-charcoal/40" />
            {file ? file.name : "點擊選擇，或將檔案拖曳到這裡"}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv,.numbers,.ods"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="hidden"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!file || busy === "upload"}
              onClick={() => void upload()}
              className="flex h-10 items-center gap-2 rounded-lg bg-orange px-4 text-sm font-bold text-white disabled:opacity-40"
            >
              <Upload size={15} />
              {busy === "upload" ? <>分析中<DotsLoading /></> : "上傳並預覽"}
            </button>
          </div>
        </div>
      ) : null}

      {/* 2. 預覽 */}
      {preview && c ? (
        <div className="mt-3 space-y-4">
          <p className="text-sm text-charcoal/70">
            檔案：<strong>{preview.fileName}</strong>
            {preview.previouslyImported ? <span className="ml-2 rounded bg-charcoal/10 px-1.5 py-0.5 text-xs">此檔案先前已匯入過</span> : null}
          </p>

          <div>
            <p className="mb-1.5 text-xs font-bold text-charcoal/60">名單比對（單位：筆數）</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat label="檔案總列數" value={c.totalRows} />
              <Stat label="將新增" value={c.toCreate} hint="筆" tone={c.toCreate > 0 ? "ok" : undefined} />
              <Stat label="將更新" value={c.toUpdate} hint="既有紀錄" />
              <Stat label="完全重複・略過" value={c.unchanged + c.duplicateInFile} hint={c.duplicateInFile > 0 ? `含檔案內重複 ${c.duplicateInFile} 列` : "與既有名單相同"} />
              <Stat label="疑似重複" value={c.suspect} hint={c.suspectPending > 0 ? `${c.suspectPending} 列待確認` : "已全部確認"} tone={c.suspectPending > 0 ? "warn" : undefined} />
              <Stat label="格式錯誤" value={c.errorRows} hint="列（不會匯入）" tone={c.errorRows > 0 ? "warn" : undefined} />
              {c.skippedByUser > 0 ? <Stat label="你選擇略過" value={c.skippedByUser} /> : null}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-bold text-charcoal/60">費用（單位：點，含攜伴的計費人數）</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat label="淨增加的計費人數" value={`${preview.billableHeadcount} 人`} hint="新增＋攜伴增量" />
              <Stat
                label="本次確定扣點"
                value={preview.costIsFinal ? `${preview.billableHeadcount} 點` : "尚未確定"}
                hint={preview.costIsFinal ? undefined : "待處理疑似重複"}
              />
              <Stat label="目前餘額" value={`${preview.wallet.balance} 點`} />
              <Stat
                label="操作後預計餘額"
                value={`${preview.wallet.balanceAfter} 點`}
                tone={preview.wallet.needsTopUp ? "warn" : undefined}
                hint={preview.wallet.balanceAfter < 0 && !preview.wallet.needsTopUp ? `使用臨時額度（最低 ${preview.wallet.floor}）` : undefined}
              />
            </div>
            {!preview.costIsFinal ? <p className="mt-1.5 text-xs text-charcoal/55">還有疑似重複尚未處理，上方費用只是目前的預估，處理完才會確定。</p> : null}
          </div>

          {preview.warnings.length > 0 ? (
            <ul className="space-y-1 rounded-lg border border-orange/30 bg-orange/10 p-3 text-xs">
              {preview.warnings.map((w) => (
                <li key={w} className="flex gap-1.5"><AlertTriangle size={13} className="mt-0.5 shrink-0 text-orange" />{w}</li>
              ))}
            </ul>
          ) : null}

          {/* 疑似重複 */}
          {preview.suspects.length > 0 ? (
            <div className="rounded-lg border border-charcoal/10 bg-white p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-bold">疑似重複（{preview.suspects.length} 列）</p>
                <div className="flex gap-2">
                  <button type="button" disabled={busy === "decide"} onClick={() => void decide({ bulk: "ALL_NEW" })}
                    className="h-8 rounded-lg border border-charcoal/20 px-2.5 text-xs font-semibold hover:bg-paper">未選的全部視為不同人</button>
                  <button type="button" disabled={busy === "decide"} onClick={() => void decide({ bulk: "ALL_SKIP" })}
                    className="h-8 rounded-lg border border-charcoal/20 px-2.5 text-xs font-semibold hover:bg-paper">未選的全部略過</button>
                </div>
              </div>
              <p className="mt-1 text-xs text-charcoal/55">電話相同但姓名不同，可能是家長與孩子共用電話，系統不會自動合併，請逐筆選擇。</p>
              <ul className="mt-2 divide-y divide-charcoal/10">
                {preview.suspects.map((s) => {
                  const action = s.decision?.action;
                  return (
                    <li key={s.rowNumber} className="py-2.5 text-sm">
                      <p>
                        <span className="text-xs text-charcoal/45">第 {s.rowNumber} 列</span>{" "}
                        <strong>{s.name}</strong>・{s.phone}
                        {s.capacity > 1 ? <span className="text-xs text-charcoal/55">（{s.capacity} 人）</span> : null}
                      </p>
                      <p className="mt-0.5 text-xs text-charcoal/55">
                        既有：{s.candidates.map((cand) => `${cand.name}（${cand.phone}）`).join("、")}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs">
                        {s.candidates.map((cand) => (
                          <label key={cand.id} className="flex items-center gap-1">
                            <input type="radio" name={`d-${s.rowNumber}`} className="accent-orange"
                              checked={action === "UPDATE" && s.decision?.targetId === cand.id}
                              onChange={() => void decide({ decisions: { [s.rowNumber]: { action: "UPDATE", targetId: cand.id } } })} />
                            更新「{cand.name}」
                          </label>
                        ))}
                        <label className="flex items-center gap-1">
                          <input type="radio" name={`d-${s.rowNumber}`} className="accent-orange" checked={action === "NEW"}
                            onChange={() => void decide({ decisions: { [s.rowNumber]: { action: "NEW" } } })} />
                          視為不同人（新增）
                        </label>
                        <label className="flex items-center gap-1">
                          <input type="radio" name={`d-${s.rowNumber}`} className="accent-orange" checked={action === "SKIP"}
                            onChange={() => void decide({ decisions: { [s.rowNumber]: { action: "SKIP" } } })} />
                          略過
                        </label>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}

          {/* 錯誤列 */}
          {preview.errors.length > 0 ? (
            <details className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm">
              <summary className="cursor-pointer font-bold text-red-700">格式錯誤 {c.errorRows} 列（不會匯入，請修正後另行匯入）</summary>
              <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto text-xs">
                {preview.errors.map((e, i) => (
                  <li key={`${e.rowNumber}-${i}`}>第 {e.rowNumber} 列・{e.field}：{e.reason}</li>
                ))}
              </ul>
              {preview.errorsTruncated ? <p className="mt-1 text-xs text-charcoal/55">僅顯示前 500 筆。</p> : null}
              <button type="button" onClick={() => downloadErrorCsv(preview.errors, preview.fileName)}
                className="mt-2 flex h-8 items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 text-xs font-bold text-red-700">
                <Download size={13} />下載錯誤清單
              </button>
            </details>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            {preview.wallet.needsTopUp ? (
              <button type="button" onClick={() => setTopUpOpen(true)} disabled={!preview.costIsFinal}
                className="h-10 rounded-lg bg-orange px-4 text-sm font-bold text-white disabled:opacity-40">
                點數不足，儲值後繼續
              </button>
            ) : (
              <button type="button" onClick={() => void confirmImport()}
                disabled={busy !== "" || !preview.costIsFinal || preview.capacity.blocked || nothingToDo}
                className="h-10 rounded-lg bg-orange px-4 text-sm font-bold text-white disabled:opacity-40">
                {busy === "confirm" ? <>匯入中<DotsLoading /></> : preview.billableHeadcount > 0 ? `確認匯入並扣 ${preview.billableHeadcount} 點` : "確認匯入"}
              </button>
            )}
            <button type="button" onClick={reset} className="h-10 rounded-lg border border-charcoal/15 bg-white px-4 text-sm font-semibold hover:bg-paper">
              取消
            </button>
            {nothingToDo && c.suspectPending === 0 ? <span className="text-xs text-charcoal/55">沒有需要新增或更新的資料。</span> : null}
          </div>
          <p className="text-xs text-charcoal/45">取消不會寫入任何資料也不會扣點；預覽資料會在 24 小時後自動清除。</p>
        </div>
      ) : null}

      {/* 3. 結果 */}
      {result ? (
        <div className="mt-3 space-y-3">
          <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">匯入完成</p>
              <p className="mt-0.5">
                新增 {result.created} 筆、更新 {result.updated} 筆、略過 {result.unchanged + result.duplicateInFile + result.skippedByUser} 筆
                {result.errorRows > 0 ? `、錯誤 ${result.errorRows} 列` : ""}；本次扣 {result.billedHeadcount} 點，目前餘額 {result.balanceAfter} 點。
              </p>
            </div>
          </div>
          {result.balanceAfter < 0 && !reminderDismissed ? (
            <div className="flex items-start justify-between gap-3 rounded-lg border border-orange/30 bg-orange/10 p-3 text-sm" role="status">
              <p>
                點數餘額為 <strong>{result.balanceAfter}</strong> 點（已使用臨時額度，最低可到 -3 點）。建議儲值，以免下次新增或匯入被擋下。
                <Link href="/admin/billing" className="ml-1 font-bold text-orange underline">前往儲值</Link>
              </p>
              <button type="button" onClick={() => setReminderDismissed(true)} aria-label="關閉提醒" className="rounded p-1 hover:bg-white/60"><X size={14} /></button>
            </div>
          ) : null}
          <div className="flex gap-2">
            <button type="button" onClick={reset} className="h-9 rounded-lg border border-charcoal/15 bg-white px-4 text-sm font-semibold hover:bg-paper">再匯入一份</button>
            {onClose ? <button type="button" onClick={onClose} className="h-9 rounded-lg bg-orange px-4 text-sm font-bold text-white">完成</button> : null}
          </div>
        </div>
      ) : null}

      {/* 匯入歷史 */}
      <div className="mt-4 border-t border-charcoal/10 pt-3">
        <button type="button" onClick={() => { const next = !showHistory; setShowHistory(next); if (next) void loadHistory(); }}
          className="flex items-center gap-1.5 text-xs font-bold text-charcoal/60 hover:text-charcoal">
          <History size={14} />匯入歷史
        </button>
        {showHistory ? (
          history === null ? <p className="mt-2 text-xs text-charcoal/50">載入中…</p>
            : history.length === 0 ? <p className="mt-2 text-xs text-charcoal/50">還沒有匯入紀錄。</p>
              : (
                <ul className="mt-2 divide-y divide-charcoal/10 rounded-lg border border-charcoal/10 bg-white text-xs">
                  {history.map((h) => (
                    <li key={h.id} className="px-3 py-2">
                      <p className="font-semibold">{h.fileName}<span className="ml-2 font-normal text-charcoal/50">{h.confirmedAt ? formatDate(h.confirmedAt) : ""}</span></p>
                      {h.result ? (
                        <p className="mt-0.5 text-charcoal/60">
                          新增 {h.result.created}、更新 {h.result.updated}、略過 {h.result.unchanged + h.result.duplicateInFile + h.result.skippedByUser}；扣 {h.result.billedHeadcount} 點，餘額 {h.result.balanceAfter}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )
        ) : null}
      </div>

      <TopUpDialog
        open={topUpOpen}
        token={token}
        onClose={() => setTopUpOpen(false)}
        needed={preview?.billableHeadcount ?? 0}
        balance={preview?.wallet.balance ?? 0}
        returnTo={returnTo}
      />
    </div>
  );
}
