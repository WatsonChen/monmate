"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../lib/api";
import type { CheckInResultDTO, EventDTO, UserDTO } from "@monmate/types";
import { Info, Camera, CameraOff, Check, RotateCcw, Search, XCircle, StickyNote, Users } from "lucide-react";

function fireConfetti() {
  void import("canvas-confetti").then(({ default: confetti }) => {
    const burst = (angle: number, origin: { x: number; y: number }) =>
      confetti({ particleCount: 60, angle, spread: 55, origin, colors: ["#8ee6c1", "#ff7231", "#ffd166", "#06d6a0", "#118ab2"], scalar: 1.1, zIndex: 9999 });
    burst(60, { x: 0, y: 0.65 });
    burst(120, { x: 1, y: 0.65 });
    setTimeout(() => { burst(75, { x: 0.1, y: 0.5 }); burst(105, { x: 0.9, y: 0.5 }); }, 180);
  });
}

const resultConfig = {
  SUCCESS: { color: "bg-mint/20 border-mint/50", icon: Check, iconBg: "bg-mint", label: "報到成功！" },
  ALREADY_CHECKED_IN: { color: "bg-orange/10 border-orange/30", icon: RotateCcw, iconBg: "bg-orange/80", label: "已全員報到" },
  NOT_FOUND: { color: "bg-red-50 border-red-200", icon: Search, iconBg: "bg-red-400", label: "找不到此代碼" },
  INVALID: { color: "bg-red-50 border-red-200", icon: XCircle, iconBg: "bg-red-400", label: "代碼無效" }
} as const;

export default function StaffScanPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserDTO | null>(null);
  const [events, setEvents] = useState<EventDTO[]>([]);
  const [eventId, setEventId] = useState("");
  const [eventName, setEventName] = useState("");
  const [manualCode, setManualCode] = useState("");

  // lookup 預覽階段
  const [preview, setPreview] = useState<CheckInResultDTO | null>(null);
  const [pendingCount, setPendingCount] = useState(1);
  const [pendingCredential, setPendingCredential] = useState<{ type: "qr" | "phone" | "manual"; value: string } | null>(null);

  // 確認後結果
  const [result, setResult] = useState<CheckInResultDTO | null>(null);
  const [lastCount, setLastCount] = useState(1);
  const [message, setMessage] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  // 備註
  const [note, setNote] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const [noteMessage, setNoteMessage] = useState("");

  const [scannerOn, setScannerOn] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    const token = window.localStorage.getItem("monmate.token");
    if (!token) { router.replace("/admin/login"); return; }
    void apiFetch<UserDTO>("/auth/me", { token }).then(async (res) => {
      if (!res.success || !res.data) { router.replace("/admin/login"); return; }
      const u = res.data;
      if (u.role !== "ADMIN" && u.role !== "OWNER" && u.role !== "STAFF") { router.replace("/admin/login"); return; }
      setUser(u);
      if (u.role === "STAFF") {
        const assignedIds = Array.from(new Set([...(u.assignedEventIds ?? []), u.assignedEventId].filter(Boolean) as string[]));
        if (assignedIds.length > 0) {
          const eventResults = await Promise.all(
            assignedIds.map((id) => apiFetch<EventDTO>(`/events/${id}`, { token }))
          );
          const assignedEvents = eventResults
            .map((eventRes) => eventRes.success ? eventRes.data : null)
            .filter((ev): ev is EventDTO => Boolean(ev));
          setEvents(assignedEvents);
          const stored = window.localStorage.getItem("monmate.staff.eventId");
          const selected = assignedEvents.find((e) => e.id === stored) ?? assignedEvents[0];
          if (selected) {
            setEventId(selected.id);
            setEventName(selected.name);
            window.localStorage.setItem("monmate.staff.eventId", selected.id);
          }
        }
      } else {
        const evRes = await apiFetch<EventDTO[]>("/events/", { token });
        if (evRes.success && evRes.data) {
          setEvents(evRes.data);
          const stored = window.localStorage.getItem("monmate.staff.eventId");
          const match = evRes.data.find((e) => e.id === stored);
          if (match) { setEventId(match.id); setEventName(match.name); }
        }
      }
    });
  }, [router]);

  // Step 1: 掃碼/輸入 → lookup（只查詢，不報到）
  const lookup = useCallback(async (code: string) => {
    if (!eventId || !code.trim() || isChecking) return;
    setIsChecking(true);
    setResult(null);
    setPreview(null);
    setMessage("");
    const token = window.localStorage.getItem("monmate.token") ?? "";
    const trimmed = code.trim();
    const isQr = trimmed.length > 10 && !/^\d+$/.test(trimmed);
    const isPhone = !isQr && /^\d{9,12}$/.test(trimmed);
    const credType = isQr ? "qr" : isPhone ? "phone" : "manual";
    const body = isQr ? { qrToken: trimmed } : isPhone ? { phone: trimmed } : { checkInCode: trimmed };

    const res = await apiFetch<CheckInResultDTO>(`/events/${eventId}/check-in/lookup`, {
      method: "POST", token, body: JSON.stringify(body)
    });
    setIsChecking(false);

    if (!res.success || !res.data) {
      setMessage(res.error?.message ?? "查詢失敗");
      return;
    }

    if (res.data.status === "NOT_FOUND" || res.data.status === "INVALID" || res.data.status === "ALREADY_CHECKED_IN") {
      setResult(res.data);
      setNote(res.data.attendee?.note ?? "");
      setNoteSaved(false);
      setManualCode("");
      setTimeout(() => inputRef.current?.focus(), 100);
      return;
    }

    // 顯示預覽 + 人數選擇器
    setPendingCredential({ type: credType, value: trimmed });
    const remaining = (res.data.attendee?.checkInCapacity ?? 1) - (res.data.attendee?.checkInCount ?? 0);
    setPendingCount(Math.min(1, remaining));
    setPreview(res.data);
    setNote(res.data.attendee?.note ?? "");
    setNoteSaved(false);
    setNoteMessage("");
    setManualCode("");
  }, [eventId, isChecking]);

  // Step 2: 工作人員確認人數 → 實際報到
  async function confirmCheckIn() {
    if (!pendingCredential || !eventId || isChecking) return;
    setIsChecking(true);
    const token = window.localStorage.getItem("monmate.token") ?? "";

    // 自動儲存尚未儲存的備註
    const attendeeId = preview?.attendee?.id;
    if (attendeeId && !noteSaved) {
      void apiFetch(`/events/${eventId}/attendees/${attendeeId}`, {
        method: "PATCH", token, body: JSON.stringify({ note: note.trim() || null })
      }).then(() => setNoteSaved(true));
    }

    const { type, value } = pendingCredential;
    const endpoint = `/events/${eventId}/check-in/${type === "qr" ? "qr" : type === "phone" ? "phone" : "manual"}`;
    const attendee = preview?.attendee;
    const remaining = attendee
      ? Math.max(1, (attendee.checkInCapacity ?? 1) - (attendee.checkInCount ?? 0))
      : pendingCount;
    const countToCheckIn = Math.min(pendingCount, remaining);
    const credBody = type === "qr" ? { qrToken: value, count: countToCheckIn }
      : type === "phone" ? { phone: value, count: countToCheckIn }
      : { checkInCode: value, count: countToCheckIn };

    const res = await apiFetch<CheckInResultDTO>(endpoint, {
      method: "POST", token, body: JSON.stringify(credBody)
    });
    setIsChecking(false);
    setPreview(null);
    setPendingCredential(null);

    if (!res.success || !res.data) { setMessage(res.error?.message ?? "報到失敗"); return; }
    if (res.data.status === "SUCCESS") fireConfetti();
    setLastCount(countToCheckIn);
    setResult(res.data);
    setNote(res.data.attendee?.note ?? "");
    setNoteSaved(false);
    setNoteMessage("");
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  async function saveNote(attendeeId: string) {
    if (noteSaving) return;
    setNoteSaving(true);
    setNoteMessage("");
    const token = window.localStorage.getItem("monmate.token") ?? "";
    const trimmedNote = note.trim();
    const res = await apiFetch(`/events/${eventId}/attendees/${attendeeId}`, {
      method: "PATCH", token, body: JSON.stringify({ note: note.trim() || null })
    });
    setNoteSaving(false);
    if (!res.success) {
      setNoteSaved(false);
      setNoteMessage(res.error?.message ?? "備註儲存失敗");
      return;
    }
    const savedNote = trimmedNote || null;
    setPreview((current) => current?.attendee?.id === attendeeId
      ? { ...current, attendee: { ...current.attendee, note: savedNote } }
      : current);
    setResult((current) => current?.attendee?.id === attendeeId
      ? { ...current, attendee: { ...current.attendee, note: savedNote } }
      : current);
    setNoteSaved(true);
  }

  useEffect(() => {
    if (!scannerOn) {
      if (scannerRef.current) { void scannerRef.current.stop().catch(() => {}); scannerRef.current = null; }
      return;
    }
    let cancelled = false;
    void (async () => {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (cancelled) return;
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;
      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decodedText) => { void lookup(decodedText); },
          undefined
        );
      } catch { setScannerOn(false); }
    })();
    return () => {
      cancelled = true;
      if (scannerRef.current) { void scannerRef.current.stop().catch(() => {}); scannerRef.current = null; }
    };
  }, [scannerOn, lookup]);

  function selectEvent(id: string) {
    const ev = events.find((e) => e.id === id);
    setEventId(id); setEventName(ev?.name ?? "");
    window.localStorage.setItem("monmate.staff.eventId", id);
  }

  const isStaff = user?.role === "STAFF";
  const displayAttendee = (preview ?? result)?.attendee;

  function renderCapacityBar(attendee: typeof displayAttendee, mode: "preview" | "result") {
    if (!attendee) return null;
    const cap = attendee.checkInCapacity ?? 1;
    const done = attendee.checkInCount ?? 0;
    const remaining = cap - done;
    if (cap <= 1) return null;
    return (
      <div className="rounded-lg bg-white/80 px-3 py-2.5 space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-charcoal/60">
          <Users size={12} />
          <span>人數名額</span>
        </div>
        <div className="flex gap-3 text-sm font-semibold">
          <span className="text-charcoal/50">共 <span className="text-charcoal font-bold">{cap}</span> 人</span>
          <span className="text-charcoal/30">·</span>
          <span className="text-charcoal/50">已到 <span className="text-green-600 font-bold">{done}</span> 人</span>
          <span className="text-charcoal/30">·</span>
          {mode === "result"
            ? <span className="text-charcoal/50">本次 <span className="text-orange font-bold">+{lastCount}</span></span>
            : <span className="text-charcoal/50">可報到 <span className="text-orange font-bold">{remaining}</span> 人</span>
          }
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-dvh bg-paper p-4">
      <div className="mx-auto max-w-sm space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">工作人員報到</h1>
            {user && <p className="text-sm text-charcoal/60">{user.name}</p>}
          </div>
          <button type="button"
            onClick={() => { setScannerOn(false); window.localStorage.removeItem("monmate.token"); router.push("/admin/login"); }}
            className="rounded-lg border border-charcoal/15 bg-white px-3 py-1.5 text-xs font-semibold">
            登出
          </button>
        </div>

        {/* Event */}
        <div className="rounded-lg border border-charcoal/10 bg-white p-4 space-y-2">
          <p className="text-sm font-semibold">活動</p>
          {isStaff ? (
            <>
              {events.length > 1 ? (
                <select value={eventId} onChange={(e) => selectEvent(e.target.value)}
                  className="h-10 w-full rounded-lg border border-charcoal/15 bg-paper px-3 text-sm outline-none focus:border-mint">
                  {events.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              ) : (
                <p className="text-sm font-medium text-charcoal">{eventName || "載入中…"}</p>
              )}
              <div className="flex items-start gap-2 rounded-lg bg-mint/10 px-3 py-2 text-xs text-charcoal/70">
                <Info size={13} className="mt-0.5 shrink-0 text-mint" />
                <span>你的帳號只能看到被指派的活動。</span>
              </div>
            </>
          ) : (
            <>
              <select value={eventId} onChange={(e) => selectEvent(e.target.value)}
                className="h-10 w-full rounded-lg border border-charcoal/15 bg-paper px-3 text-sm outline-none focus:border-mint">
                <option value="">— 選擇活動 —</option>
                {events.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
              <div className="flex items-start gap-2 rounded-lg bg-charcoal/5 px-3 py-2 text-xs text-charcoal/60">
                <Info size={13} className="mt-0.5 shrink-0" />
                <span>只顯示此帳號建立的活動。工作人員帳號以 email 綁定，登入後只會看到被指派的活動。</span>
              </div>
            </>
          )}
        </div>

        {/* QR Scanner */}
        <div className="rounded-lg border border-charcoal/10 bg-white p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">QR 掃描</p>
            <button type="button" disabled={!eventId} onClick={() => setScannerOn((v) => !v)}
              className="flex items-center gap-1.5 rounded-lg border border-charcoal/15 px-3 py-1.5 text-xs font-semibold disabled:opacity-40">
              {scannerOn ? <><CameraOff size={13} />關閉</> : <><Camera size={13} />開啟掃描</>}
            </button>
          </div>
          <div id="qr-reader" className={scannerOn ? "overflow-hidden rounded-lg" : "hidden"} />
        </div>

        {/* Manual input */}
        <div className="rounded-lg border border-charcoal/10 bg-white p-4 space-y-3">
          <p className="text-sm font-semibold">手動輸入 / 掃碼槍</p>
          <div className="flex gap-2">
            <input ref={inputRef} value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void lookup(manualCode)}
              placeholder="輸入或掃描報到碼"
              className="h-12 flex-1 rounded-lg border border-charcoal/15 bg-paper px-3 text-sm outline-none focus:border-mint"
              autoFocus />
            <button type="button"
              disabled={!manualCode.trim() || !eventId || isChecking}
              onClick={() => void lookup(manualCode)}
              className="h-12 rounded-lg bg-orange px-4 text-sm font-bold text-white disabled:opacity-40">
              {isChecking ? "…" : "查詢"}
            </button>
          </div>
          <p className="text-xs text-charcoal/50">掃碼槍掃描後會自動觸發</p>
        </div>

        {/* 預覽卡 + 人數選擇（lookup 階段） */}
        {preview && preview.attendee && (
          <div className="rounded-xl border-2 border-mint/40 bg-mint/10 p-5 space-y-4">
            {/* 姓名 */}
            <div>
              <p className="text-xs font-semibold text-charcoal/50 mb-1">找到報名者</p>
              <p className="text-2xl font-extrabold">{preview.attendee.name}</p>
              <p className="text-sm text-charcoal/60 mt-0.5">尾碼 …{preview.attendee.phoneLastThree}</p>
            </div>

            {/* 人數名額條 */}
            {renderCapacityBar(preview.attendee, "preview")}

            {/* 額外欄位 */}
            {preview.attendee.customFields && Object.keys(preview.attendee.customFields).length > 0 && (
              <div className="rounded-lg bg-white/70 px-3 py-2 space-y-1">
                {Object.entries(preview.attendee.customFields).map(([k, v]) => (
                  <p key={k} className="text-sm text-charcoal/80"><span className="font-semibold">{k}：</span>{v}</p>
                ))}
              </div>
            )}

            {/* 人數選擇 */}
            {(() => {
              const cap = preview.attendee.checkInCapacity ?? 1;
              const done = preview.attendee.checkInCount ?? 0;
              const remaining = cap - done;
              if (remaining <= 0) return null;
              return (
                <div className="rounded-lg bg-white/80 px-3 py-3 space-y-3">
                  <p className="text-sm font-bold">本次報到幾人？</p>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: remaining }, (_, i) => i + 1).map((n) => (
                      <button key={n} type="button"
                        onClick={() => setPendingCount(n)}
                        className={`h-11 min-w-[2.75rem] px-3 rounded-xl text-sm font-bold border-2 transition-colors ${pendingCount === n ? "border-orange bg-orange text-white shadow-sm" : "border-charcoal/15 bg-white text-charcoal hover:border-orange/40"}`}>
                        {n} 人
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* 備註 */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-charcoal/60">
                <StickyNote size={12} />備註
              </label>
              <textarea rows={2} value={note}
                onChange={(e) => { setNote(e.target.value); setNoteSaved(false); setNoteMessage(""); }}
                placeholder="輸入備註，所有工作人員可見…"
                className="w-full resize-none rounded-lg border border-charcoal/15 bg-white px-3 py-2 text-sm outline-none focus:border-mint" />
              <button type="button" onClick={() => void saveNote(preview.attendee!.id)}
                disabled={noteSaving}
                className="rounded-lg bg-mint px-3 py-1.5 text-xs font-bold text-charcoal shadow-sm hover:bg-mint/90 disabled:opacity-40">
                {noteSaving ? "儲存中…" : noteSaved ? "✓ 已儲存" : "儲存備註"}
              </button>
              {noteMessage && <p className="text-xs font-semibold text-red-600">{noteMessage}</p>}
            </div>

            {/* 確認按鈕 */}
            <div className="flex gap-2 pt-1">
              <button type="button"
                onClick={() => { setPreview(null); setPendingCredential(null); setTimeout(() => inputRef.current?.focus(), 50); }}
                className="h-12 flex-1 rounded-lg border border-charcoal/15 bg-white text-sm font-semibold text-charcoal/60">
                取消
              </button>
              <button type="button"
                disabled={isChecking || (preview.attendee.checkInCapacity ?? 1) <= (preview.attendee.checkInCount ?? 0)}
                onClick={() => void confirmCheckIn()}
                className="h-12 flex-[2] rounded-lg bg-orange text-sm font-bold text-white disabled:opacity-40">
                {isChecking ? "處理中…" : `確認報到 ${pendingCount} 人`}
              </button>
            </div>
          </div>
        )}

        {/* 結果卡 */}
        {result && !preview && (() => {
          const cfg = resultConfig[result.status];
          const Icon = cfg.icon;
          return (
            <div className={`rounded-xl border-2 p-5 space-y-4 ${cfg.color}`}>
              <div className="flex items-center gap-3">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${cfg.iconBg}`}>
                  <Icon size={22} className="text-white" strokeWidth={2.5} />
                </span>
                <div>
                  <p className="text-lg font-extrabold tracking-tight">{cfg.label}</p>
                  {result.attendee && (
                    <p className="text-sm font-semibold text-charcoal/70">
                      {result.attendee.name}・尾碼 …{result.attendee.phoneLastThree}
                    </p>
                  )}
                </div>
              </div>

              {result.attendee && renderCapacityBar(result.attendee, "result")}

              {result.attendee?.customFields && Object.keys(result.attendee.customFields).length > 0 && (
                <div className="rounded-lg bg-white/60 px-3 py-2 space-y-1">
                  {Object.entries(result.attendee.customFields).map(([k, v]) => (
                    <p key={k} className="text-sm text-charcoal/80"><span className="font-semibold">{k}：</span>{v}</p>
                  ))}
                </div>
              )}

              {result.attendee && (
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-charcoal/60">
                    <StickyNote size={12} />工作人員備註
                  </label>
                  <textarea rows={2} value={note}
                    onChange={(e) => { setNote(e.target.value); setNoteSaved(false); setNoteMessage(""); }}
                    placeholder="輸入備註，所有工作人員可見…"
                    className="w-full resize-none rounded-lg border border-charcoal/15 bg-white px-3 py-2 text-sm outline-none focus:border-mint" />
                  <button type="button"
                    onClick={() => void saveNote(result.attendee!.id)}
                    disabled={noteSaving}
                    className="rounded-lg bg-mint px-3 py-1.5 text-xs font-bold text-charcoal shadow-sm hover:bg-mint/90 disabled:opacity-40">
                    {noteSaving ? "儲存中…" : noteSaved ? "✓ 已儲存" : "儲存備註"}
                  </button>
                  {noteMessage && <p className="text-xs font-semibold text-red-600">{noteMessage}</p>}
                </div>
              )}
            </div>
          );
        })()}

        {message && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{message}</div>
        )}

        {(user?.role === "ADMIN" || user?.role === "OWNER") && eventId && (
          <button type="button"
            onClick={() => { setScannerOn(false); router.push(`/admin/events/${eventId}`); }}
            className="w-full rounded-lg border border-charcoal/15 bg-white py-2 text-sm font-semibold">
            返回後台
          </button>
        )}
      </div>
    </main>
  );
}
