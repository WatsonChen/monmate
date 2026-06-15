"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../lib/api";
import type { CheckInResultDTO, EventDTO, UserDTO } from "@monmate/types";
import { Info, Camera, CameraOff, Check, RotateCcw, Search, XCircle, StickyNote } from "lucide-react";

function fireConfetti() {
  void import("canvas-confetti").then(({ default: confetti }) => {
    const burst = (angle: number, origin: { x: number; y: number }) =>
      confetti({
        particleCount: 60,
        angle,
        spread: 55,
        origin,
        colors: ["#8ee6c1", "#ff7231", "#ffd166", "#06d6a0", "#118ab2"],
        scalar: 1.1,
        zIndex: 9999
      });
    burst(60, { x: 0, y: 0.65 });
    burst(120, { x: 1, y: 0.65 });
    setTimeout(() => {
      burst(75, { x: 0.1, y: 0.5 });
      burst(105, { x: 0.9, y: 0.5 });
    }, 180);
  });
}

const resultConfig = {
  SUCCESS: {
    color: "bg-mint/20 border-mint/50",
    icon: Check,
    iconBg: "bg-mint",
    label: "報到成功！"
  },
  ALREADY_CHECKED_IN: {
    color: "bg-orange/10 border-orange/30",
    icon: RotateCcw,
    iconBg: "bg-orange/80",
    label: "已報到過"
  },
  NOT_FOUND: {
    color: "bg-red-50 border-red-200",
    icon: Search,
    iconBg: "bg-red-400",
    label: "找不到此代碼"
  },
  INVALID: {
    color: "bg-red-50 border-red-200",
    icon: XCircle,
    iconBg: "bg-red-400",
    label: "代碼無效"
  }
} as const;

export default function StaffScanPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserDTO | null>(null);
  const [events, setEvents] = useState<EventDTO[]>([]);
  const [eventId, setEventId] = useState("");
  const [eventName, setEventName] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [result, setResult] = useState<CheckInResultDTO | null>(null);
  const [message, setMessage] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [scannerOn, setScannerOn] = useState(false);
  const [note, setNote] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    const token = window.localStorage.getItem("monmate.token");
    if (!token) { router.replace("/admin/login"); return; }

    void apiFetch<UserDTO>("/auth/me", { token }).then(async (res) => {
      if (!res.success || !res.data) { router.replace("/admin/login"); return; }
      const u = res.data;
      if (u.role !== "ADMIN" && u.role !== "OWNER" && u.role !== "STAFF") {
        router.replace("/admin/login");
        return;
      }
      setUser(u);

      if (u.role === "STAFF") {
        if (u.assignedEventId) {
          setEventId(u.assignedEventId);
          const evRes = await apiFetch<EventDTO>(`/events/${u.assignedEventId}`, { token });
          if (evRes.success && evRes.data) setEventName(evRes.data.name);
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

  const checkIn = useCallback(async (code: string) => {
    if (!eventId || !code.trim() || isChecking) return;
    setIsChecking(true);
    setResult(null);
    setMessage("");
    const token = window.localStorage.getItem("monmate.token") ?? "";
    const trimmed = code.trim();
    const isQr = trimmed.length > 10 && !/^\d+$/.test(trimmed);
    const isPhone = !isQr && /^\d{9,12}$/.test(trimmed);
    const endpoint = isQr
      ? `/events/${eventId}/check-in/qr`
      : isPhone
      ? `/events/${eventId}/check-in/phone`
      : `/events/${eventId}/check-in/manual`;
    const body = isQr ? { qrToken: trimmed } : isPhone ? { phone: trimmed } : { checkInCode: trimmed };
    const res = await apiFetch<CheckInResultDTO>(endpoint, { method: "POST", token, body: JSON.stringify(body) });
    setIsChecking(false);
    if (!res.success || !res.data) { setMessage(res.error?.message ?? "報到失敗"); return; }
    if (res.data.status === "SUCCESS") fireConfetti();
    setResult(res.data);
    setNote(res.data.attendee?.note ?? "");
    setNoteSaved(false);
    setManualCode("");
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [eventId, isChecking]);

  // Start / stop html5-qrcode scanner
  useEffect(() => {
    if (!scannerOn) {
      if (scannerRef.current) {
        void scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
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
          (decodedText) => { void checkIn(decodedText); },
          undefined
        );
      } catch {
        setScannerOn(false);
      }
    })();

    return () => {
      cancelled = true;
      if (scannerRef.current) {
        void scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [scannerOn, checkIn]);

  async function saveNote() {
    if (!result?.attendee?.id || noteSaving) return;
    setNoteSaving(true);
    const token = window.localStorage.getItem("monmate.token") ?? "";
    await apiFetch(`/events/${eventId}/attendees/${result.attendee.id}`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ note: note.trim() || null })
    });
    setNoteSaving(false);
    setNoteSaved(true);
  }

  function selectEvent(id: string) {
    const ev = events.find((e) => e.id === id);
    setEventId(id);
    setEventName(ev?.name ?? "");
    window.localStorage.setItem("monmate.staff.eventId", id);
  }

  const isStaff = user?.role === "STAFF";

  return (
    <main className="min-h-dvh bg-paper p-4">
      <div className="mx-auto max-w-sm space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">工作人員報到</h1>
            {user && <p className="text-sm text-charcoal/60">{user.name}</p>}
          </div>
          <button
            type="button"
            onClick={() => {
              setScannerOn(false);
              window.localStorage.removeItem("monmate.token");
              router.push("/admin/login");
            }}
            className="rounded-lg border border-charcoal/15 bg-white px-3 py-1.5 text-xs font-semibold"
          >
            登出
          </button>
        </div>

        {/* Event */}
        <div className="rounded-lg border border-charcoal/10 bg-white p-4 space-y-2">
          <p className="text-sm font-semibold">活動</p>
          {isStaff ? (
            <>
              <p className="text-sm font-medium text-charcoal">{eventName || "載入中…"}</p>
              <div className="flex items-start gap-2 rounded-lg bg-mint/10 px-3 py-2 text-xs text-charcoal/70">
                <Info size={13} className="mt-0.5 shrink-0 text-mint" />
                <span>你的帳號已綁定至此活動，只能看到被指派的活動。</span>
              </div>
            </>
          ) : (
            <>
              <select
                value={eventId}
                onChange={(e) => selectEvent(e.target.value)}
                className="h-10 w-full rounded-lg border border-charcoal/15 bg-paper px-3 text-sm outline-none focus:border-mint"
              >
                <option value="">— 選擇活動 —</option>
                {events.map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
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
            <button
              type="button"
              disabled={!eventId}
              onClick={() => setScannerOn((v) => !v)}
              className="flex items-center gap-1.5 rounded-lg border border-charcoal/15 px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
            >
              {scannerOn ? <><CameraOff size={13} />關閉</> : <><Camera size={13} />開啟掃描</>}
            </button>
          </div>
          <div id="qr-reader" className={scannerOn ? "overflow-hidden rounded-lg" : "hidden"} />
        </div>

        {/* Manual input */}
        <div className="rounded-lg border border-charcoal/10 bg-white p-4 space-y-3">
          <p className="text-sm font-semibold">手動輸入 / 掃碼槍</p>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void checkIn(manualCode)}
              placeholder="輸入或掃描報到碼"
              className="h-12 flex-1 rounded-lg border border-charcoal/15 bg-paper px-3 text-sm outline-none focus:border-mint"
              autoFocus
            />
            <button
              type="button"
              disabled={!manualCode.trim() || !eventId || isChecking}
              onClick={() => void checkIn(manualCode)}
              className="h-12 rounded-lg bg-orange px-4 text-sm font-bold text-white disabled:opacity-40"
            >
              {isChecking ? "…" : "報到"}
            </button>
          </div>
          <p className="text-xs text-charcoal/50">掃碼槍掃描後會自動觸發</p>
        </div>

        {/* Result card */}
        {result && (() => {
          const cfg = resultConfig[result.status];
          const Icon = cfg.icon;
          const customFields = result.attendee?.customFields;
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
                      {result.attendee.name}・…{result.attendee.phoneLastThree}
                    </p>
                  )}
                </div>
              </div>

              {/* 攜伴 / customFields */}
              {customFields && Object.keys(customFields).length > 0 && (
                <div className="rounded-lg bg-white/60 px-3 py-2 space-y-1">
                  {Object.entries(customFields).map(([key, val]) => (
                    <p key={key} className="text-sm text-charcoal/80">
                      <span className="font-semibold">{key}：</span>{val}
                    </p>
                  ))}
                </div>
              )}

              {/* Note */}
              {result.attendee && (
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-charcoal/60">
                    <StickyNote size={12} />
                    工作人員備註
                  </label>
                  <textarea
                    rows={2}
                    value={note}
                    onChange={(e) => { setNote(e.target.value); setNoteSaved(false); }}
                    placeholder="輸入備註，所有工作人員可見…"
                    className="w-full resize-none rounded-lg border border-charcoal/15 bg-white px-3 py-2 text-sm outline-none focus:border-mint"
                  />
                  <button
                    type="button"
                    onClick={() => void saveNote()}
                    disabled={noteSaving}
                    className="rounded-lg bg-charcoal/10 px-3 py-1.5 text-xs font-semibold text-charcoal/70 disabled:opacity-40"
                  >
                    {noteSaving ? "儲存中…" : noteSaved ? "✓ 已儲存" : "儲存備註"}
                  </button>
                </div>
              )}
            </div>
          );
        })()}

        {message && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {message}
          </div>
        )}

        {(user?.role === "ADMIN" || user?.role === "OWNER") && (
          <button
            type="button"
            onClick={() => { setScannerOn(false); router.push("/admin"); }}
            className="w-full rounded-lg border border-charcoal/15 bg-white py-2 text-sm font-semibold"
          >
            返回後台
          </button>
        )}
      </div>
    </main>
  );
}
