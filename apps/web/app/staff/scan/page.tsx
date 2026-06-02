"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../lib/api";
import type { CheckInResultDTO, UserDTO } from "@monmate/types";

export default function StaffScanPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserDTO | null>(null);
  const [eventId, setEventId] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [result, setResult] = useState<CheckInResultDTO | null>(null);
  const [message, setMessage] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = window.localStorage.getItem("monmate.token");
    if (!token) { router.replace("/admin/login"); return; }
    void apiFetch<UserDTO>("/auth/me", { token }).then((res) => {
      if (!res.success || !res.data) { router.replace("/admin/login"); return; }
      if (res.data.role === "ADMIN" || res.data.role === "OWNER" || res.data.role === "STAFF") {
        setUser(res.data);
      } else {
        router.replace("/admin/login");
      }
    });
    const stored = window.localStorage.getItem("monmate.staff.eventId");
    if (stored) setEventId(stored);
  }, [router]);

  async function checkIn(code: string) {
    if (!eventId || !code.trim() || isChecking) return;
    setIsChecking(true);
    setResult(null);
    setMessage("");
    const token = window.localStorage.getItem("monmate.token") ?? "";
    const isQr = code.length > 10;
    const endpoint = isQr
      ? `/events/${eventId}/check-in/qr`
      : `/events/${eventId}/check-in/manual`;
    const body = isQr ? { qrToken: code } : { checkInCode: code };
    const res = await apiFetch<CheckInResultDTO>(endpoint, { method: "POST", token, body: JSON.stringify(body) });
    setIsChecking(false);
    if (!res.success || !res.data) { setMessage(res.error?.message ?? "報到失敗"); return; }
    setResult(res.data);
    setManualCode("");
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function saveEventId(id: string) {
    setEventId(id);
    window.localStorage.setItem("monmate.staff.eventId", id);
  }

  const statusColor =
    result?.status === "SUCCESS" ? "bg-green-50 border-green-300 text-green-800" :
    result?.status === "ALREADY_CHECKED_IN" ? "bg-yellow-50 border-yellow-300 text-yellow-800" :
    "bg-red-50 border-red-300 text-red-800";

  const statusText =
    result?.status === "SUCCESS" ? "✅ 報到成功" :
    result?.status === "ALREADY_CHECKED_IN" ? "⚠️ 已報到" :
    result?.status === "NOT_FOUND" ? "❌ 找不到此代碼" :
    result?.status === "INVALID" ? "❌ 代碼無效" : "";

  return (
    <main className="min-h-dvh bg-charcoal/5 p-4">
      <div className="mx-auto max-w-sm space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">工作人員報到</h1>
          {user && <span className="text-sm text-charcoal/60">{user.name}</span>}
        </div>

        <div className="rounded-lg border border-charcoal/10 bg-white p-4">
          <label className="block text-sm font-semibold">
            活動 ID
            <input
              value={eventId}
              onChange={(e) => saveEventId(e.target.value)}
              placeholder="貼上活動 ID"
              className="mt-2 h-10 w-full rounded-lg border border-charcoal/15 bg-paper px-3 text-sm outline-none focus:border-mint"
            />
          </label>
        </div>

        <div className="rounded-lg border border-charcoal/10 bg-white p-4">
          <p className="mb-3 text-sm font-semibold">輸入代碼 / 掃描 QR</p>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void checkIn(manualCode)}
              placeholder="掃描或輸入報到碼"
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
          <p className="mt-2 text-xs text-charcoal/50">QR 掃描槍掃描後會自動觸發</p>
        </div>

        {result && (
          <div className={`rounded-lg border p-4 ${statusColor}`}>
            <p className="text-lg font-bold">{statusText}</p>
            {result.attendee && (
              <div className="mt-2 space-y-1 text-sm">
                <p className="font-semibold">{result.attendee.name}</p>
                <p className="text-charcoal/60">…{result.attendee.phoneLastThree}</p>
              </div>
            )}
          </div>
        )}

        {message && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {message}
          </div>
        )}

        {(user?.role === "ADMIN" || user?.role === "OWNER") && (
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="w-full rounded-lg border border-charcoal/15 bg-white py-2 text-sm font-semibold"
          >
            返回後台
          </button>
        )}
      </div>
    </main>
  );
}
