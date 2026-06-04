"use client";

import type { AttendeeDTO, EventDTO, RegistrationField, SmsResultDTO, StaffDTO } from "@monmate/types";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ClipboardList,
  FileSpreadsheet,
  MessageSquare,
  Pencil,
  Plus,
  Send,
  Trash2,
  Upload,
  Users,
  UserCog,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { AdminShell } from "./AdminShell";
import { DateTimePicker } from "./DateTimePicker";
import { RegistrationFieldsEditor } from "./RegistrationFieldsEditor";
import { VenueQrButton } from "./VenueQrModal";

type Props = { eventId: string; created?: boolean };

function formatDate(value: string) {
  return new Date(value).toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function toDatetimeLocal(value: string) {
  const d = new Date(value);
  const offsetMs = d.getTimezoneOffset() * 60 * 1000;
  return new Date(d.getTime() - offsetMs).toISOString().slice(0, 16);
}

const statusLabel: Record<string, string> = {
  CHECKED_IN: "已報到",
  NOT_CHECKED_IN: "未報到"
};

export function AdminEventDetailClient({ eventId, created }: Props) {
  const [token, setToken] = useState("");
  const [event, setEvent] = useState<EventDTO | null>(null);
  const [attendees, setAttendees] = useState<AttendeeDTO[]>([]);
  const [staffList, setStaffList] = useState<StaffDTO[]>([]);
  const [message, setMessage] = useState(created ? "活動已建立！現在可以匯入名單並發送邀請。" : "");

  // Import state
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importMsg, setImportMsg] = useState("");

  // Invite state
  const [smsTemplate, setSmsTemplate] = useState<"with-registration" | "without-registration">("without-registration");
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [inviteMsg, setInviteMsg] = useState("");

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editStartAt, setEditStartAt] = useState("");
  const [editEndAt, setEditEndAt] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editRegistrationRequired, setEditRegistrationRequired] = useState(false);
  const [editRegFields, setEditRegFields] = useState<RegistrationField[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // SMS resend state
  const [smsLoadingId, setSmsLoadingId] = useState<string | null>(null);
  const [smsResendTemplate, setSmsResendTemplate] = useState<"with-registration" | "without-registration">("without-registration");

  // Staff add form state
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [staffName, setStaffName] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [staffMsg, setStaffMsg] = useState("");
  const [isAddingStaff, setIsAddingStaff] = useState(false);

  useEffect(() => {
    const t = window.localStorage.getItem("monmate.token") ?? "";
    setToken(t);
  }, []);

  useEffect(() => {
    if (!token) return;

    async function load() {
      const [eventRes, attendeesRes, staffRes] = await Promise.all([
        apiFetch<EventDTO>(`/events/${eventId}`, { token }),
        apiFetch<AttendeeDTO[]>(`/events/${eventId}/attendees`, { token }),
        apiFetch<StaffDTO[]>(`/events/${eventId}/staff`, { token })
      ]);

      if (!eventRes.success || !eventRes.data) {
        setMessage(eventRes.error?.message ?? "讀取活動失敗");
        return;
      }
      const ev = eventRes.data;
      setEvent(ev);
      setEditName(ev.name);
      setEditSlug(ev.slug);
      setEditStartAt(toDatetimeLocal(ev.startAt));
      setEditEndAt(ev.endAt ? toDatetimeLocal(ev.endAt) : "");
      setEditLocation(ev.location ?? "");
      setEditDescription(ev.description ?? "");
      setEditRegistrationRequired(ev.registrationRequired ?? false);
      setEditRegFields((ev.registrationFields as RegistrationField[]) ?? []);

      if (attendeesRes.success && attendeesRes.data) setAttendees(attendeesRes.data);
      if (staffRes.success && staffRes.data) setStaffList(staffRes.data);
    }

    void load();
  }, [token, eventId]);

  async function saveEdit() {
    if (!editName.trim()) { setMessage("活動名稱不能為空"); return; }
    setIsSaving(true);
    setMessage("");
    const res = await apiFetch<EventDTO>(`/events/${eventId}`, {
      method: "PATCH",
      token,
      body: JSON.stringify({
        name: editName.trim(),
        slug: editSlug.trim() || undefined,
        startAt: new Date(editStartAt).toISOString(),
        endAt: editEndAt ? new Date(editEndAt).toISOString() : null,
        location: editLocation.trim() || null,
        description: editDescription.trim() || null,
        registrationRequired: editRegistrationRequired,
        registrationFields: editRegistrationRequired ? editRegFields : []
      })
    });
    setIsSaving(false);
    if (!res.success || !res.data) {
      setMessage(res.error?.message ?? "儲存失敗");
      return;
    }
    setEvent(res.data);
    setIsEditing(false);
    setMessage("活動已更新！");
  }

  async function addStaff() {
    if (!staffName.trim() || !staffEmail.trim() || !staffPassword.trim()) {
      setStaffMsg("請填寫所有欄位");
      return;
    }
    setIsAddingStaff(true);
    setStaffMsg("");
    const res = await apiFetch<StaffDTO>(`/events/${eventId}/staff`, {
      method: "POST",
      token,
      body: JSON.stringify({ name: staffName.trim(), email: staffEmail.trim(), password: staffPassword })
    });
    setIsAddingStaff(false);
    if (!res.success || !res.data) {
      setStaffMsg(res.error?.message ?? "新增失敗");
      return;
    }
    setStaffList((prev) => [...prev, res.data!]);
    setStaffName("");
    setStaffEmail("");
    setStaffPassword("");
    setShowStaffForm(false);
    setStaffMsg("");
  }

  async function importAttendees() {
    if (!importFile) return;
    setIsImporting(true);
    setImportMsg("");
    const form = new FormData();
    form.append("file", importFile);
    const res = await apiFetch<{ imported: number }>(`/events/${eventId}/attendees/import`, {
      method: "POST",
      token,
      body: form
    });
    setIsImporting(false);
    if (!res.success || !res.data) {
      setImportMsg(res.error?.message ?? "匯入失敗");
      return;
    }
    setImportMsg(`已匯入 ${res.data.imported} 筆名單`);
    setImportFile(null);
    const attendeesRes = await apiFetch<AttendeeDTO[]>(`/events/${eventId}/attendees`, { token });
    if (attendeesRes.success && attendeesRes.data) setAttendees(attendeesRes.data);
  }

  async function sendInvites() {
    setIsSendingInvite(true);
    setInviteMsg("");
    const res = await apiFetch<{ sent: number; failed: number }>(`/events/${eventId}/invite`, {
      method: "POST",
      token,
      body: JSON.stringify({ template: smsTemplate })
    });
    setIsSendingInvite(false);
    if (!res.success || !res.data) {
      setInviteMsg(res.error?.message ?? "發送失敗");
      return;
    }
    setInviteMsg(`已發送 ${res.data.sent} 則，失敗 ${res.data.failed} 則`);
  }

  async function resendSms(attendeeId: string) {
    setSmsLoadingId(attendeeId);
    const res = await apiFetch<SmsResultDTO>(`/events/${eventId}/attendees/${attendeeId}/invite`, {
      method: "POST",
      token,
      body: JSON.stringify({ template: smsResendTemplate })
    });
    setSmsLoadingId(null);
    setMessage(res.success && res.data ? res.data.message : res.error?.message ?? "簡訊發送失敗");
  }

  async function removeStaff(staffId: string) {
    if (!confirm("確定要移除此工作人員帳號？")) return;
    const res = await apiFetch<{ id: string }>(`/events/${eventId}/staff/${staffId}`, {
      method: "DELETE",
      token
    });
    if (res.success) {
      setStaffList((prev) => prev.filter((s) => s.id !== staffId));
    }
  }

  const checkedIn = attendees.filter((a) => a.checkInStatus === "CHECKED_IN").length;

  return (
    <AdminShell>
      <div className="flex items-center gap-3">
        <Link
          href="/admin/events"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-charcoal/15 bg-white hover:bg-cloud transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <p className="text-sm font-bold text-orange">活動詳情</p>
          <h1 className="text-2xl font-bold">{event?.name ?? "載入中…"}</h1>
        </div>
      </div>

      {message && (
        <section className={`mt-5 rounded-lg border p-4 text-sm font-semibold ${
          message.includes("更新") || message.includes("已")
            ? "border-green-200 bg-green-50 text-green-700"
            : "border-orange/20 bg-orange/10"
        }`}>
          {message}
        </section>
      )}

      {event && (
        <>
          {/* 活動資訊 / 編輯 */}
          <section className="mt-5 rounded-lg border border-charcoal/10 bg-white p-5">
            {!isEditing ? (
              <div className="flex items-start justify-between gap-4">
                <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <span className="text-charcoal/50">Slug</span>
                    <p className="font-semibold">{event.slug || "—"}</p>
                  </div>
                  <div>
                    <span className="text-charcoal/50">開始時間</span>
                    <p className="font-semibold">{formatDate(event.startAt)}</p>
                  </div>
                  {event.endAt && (
                    <div>
                      <span className="text-charcoal/50">結束時間</span>
                      <p className="font-semibold">{formatDate(event.endAt)}</p>
                    </div>
                  )}
                  {event.location && (
                    <div>
                      <span className="text-charcoal/50">地點</span>
                      <p className="font-semibold">{event.location}</p>
                    </div>
                  )}
                  {event.attendeeLimit && (
                    <div>
                      <span className="text-charcoal/50">人數上限</span>
                      <p className="font-semibold">{event.attendeeLimit} 人</p>
                    </div>
                  )}
                  {event.description && (
                    <div className="sm:col-span-2">
                      <span className="text-charcoal/50">簡短說明</span>
                      <p className="font-semibold">{event.description}</p>
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="flex h-10 items-center gap-2 rounded-lg border border-charcoal/15 bg-white px-4 text-sm font-bold hover:bg-paper"
                  >
                    <Pencil size={14} />
                    編輯
                  </button>
                  <Link
                    href={`/admin/survey?eventId=${event.id}`}
                    className="flex h-10 items-center gap-2 rounded-lg border border-charcoal/15 bg-white px-4 text-sm font-bold hover:bg-paper"
                  >
                    <ClipboardList size={14} />
                    活動問卷
                  </Link>
                  <VenueQrButton eventId={event.id} eventName={event.name} token={token} />
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold">編輯活動</h2>
                  <button
                    type="button"
                    onClick={() => { setIsEditing(false); setMessage(""); }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-charcoal/15 hover:bg-paper"
                  >
                    <X size={15} />
                  </button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-semibold">
                    活動名稱
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="mt-2 h-11 w-full rounded-lg border border-charcoal/15 bg-paper px-3 outline-none focus:border-mint"
                    />
                  </label>
                  <label className="text-sm font-semibold">
                    Slug
                    <input
                      value={editSlug}
                      onChange={(e) => setEditSlug(e.target.value)}
                      className="mt-2 h-11 w-full rounded-lg border border-charcoal/15 bg-paper px-3 outline-none focus:border-mint"
                    />
                  </label>
                  <label className="text-sm font-semibold">
                    開始時間
                    <DateTimePicker value={editStartAt} onChange={setEditStartAt} />
                  </label>
                  <label className="text-sm font-semibold">
                    結束時間
                    <DateTimePicker value={editEndAt} onChange={setEditEndAt} placeholder="選填" />
                  </label>
                  <label className="sm:col-span-2 text-sm font-semibold">
                    地點
                    <input
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      className="mt-2 h-11 w-full rounded-lg border border-charcoal/15 bg-paper px-3 outline-none focus:border-mint"
                    />
                  </label>
                  <label className="sm:col-span-2 text-sm font-semibold">
                    簡短說明
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={2}
                      className="mt-2 w-full rounded-lg border border-charcoal/15 bg-paper p-3 text-sm outline-none focus:border-mint"
                    />
                  </label>
                </div>
                {/* 報名欄位 */}
                <div className="mt-4">
                  <label className="flex cursor-pointer items-start gap-2">
                    <input
                      type="checkbox"
                      checked={editRegistrationRequired}
                      onChange={(e) => setEditRegistrationRequired(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded accent-orange"
                    />
                    <div>
                      <p className="text-sm font-semibold">需要填寫報名資訊</p>
                      <p className="mt-0.5 text-xs text-charcoal/55">受邀者填寫完成後才會顯示 QR Code</p>
                    </div>
                  </label>
                  {editRegistrationRequired && (
                    <div className="ml-6 mt-3">
                      <RegistrationFieldsEditor fields={editRegFields} onChange={setEditRegFields} />
                    </div>
                  )}
                </div>
                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setIsEditing(false); setMessage(""); }}
                    className="flex h-10 items-center gap-2 rounded-lg border border-charcoal/15 px-4 text-sm font-semibold hover:bg-paper"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => void saveEdit()}
                    className="flex h-10 items-center gap-2 rounded-lg bg-orange px-4 text-sm font-bold text-white disabled:opacity-40"
                  >
                    {isSaving ? "儲存中…" : "儲存變更"}
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* 工作人員管理 */}
          <section className="mt-5 rounded-lg border border-charcoal/10 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCog size={18} />
                <h2 className="text-lg font-bold">工作人員帳號</h2>
              </div>
              <button
                type="button"
                onClick={() => { setShowStaffForm((v) => !v); setStaffMsg(""); }}
                className="flex h-9 items-center gap-2 rounded-lg border border-charcoal/15 px-3 text-sm font-bold hover:bg-paper"
              >
                <Plus size={15} />
                新增人員
              </button>
            </div>

            {showStaffForm && (
              <div className="mb-4 rounded-lg border border-charcoal/10 bg-paper p-4">
                <p className="mb-3 text-sm font-bold">新增工作人員帳號</p>
                {staffMsg && (
                  <p className="mb-3 text-xs font-semibold text-red-500">{staffMsg}</p>
                )}
                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="text-xs font-semibold">
                    姓名
                    <input
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                      className="mt-1.5 h-10 w-full rounded-lg border border-charcoal/15 bg-white px-3 text-sm outline-none focus:border-mint"
                    />
                  </label>
                  <label className="text-xs font-semibold">
                    Email（登入帳號）
                    <input
                      type="email"
                      value={staffEmail}
                      onChange={(e) => setStaffEmail(e.target.value)}
                      className="mt-1.5 h-10 w-full rounded-lg border border-charcoal/15 bg-white px-3 text-sm outline-none focus:border-mint"
                    />
                  </label>
                  <label className="text-xs font-semibold">
                    密碼（至少 6 碼）
                    <input
                      type="password"
                      value={staffPassword}
                      onChange={(e) => setStaffPassword(e.target.value)}
                      className="mt-1.5 h-10 w-full rounded-lg border border-charcoal/15 bg-white px-3 text-sm outline-none focus:border-mint"
                    />
                  </label>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setShowStaffForm(false); setStaffMsg(""); }}
                    className="h-9 rounded-lg border border-charcoal/15 px-4 text-sm font-semibold hover:bg-white"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    disabled={isAddingStaff}
                    onClick={() => void addStaff()}
                    className="flex h-9 items-center gap-1.5 rounded-lg bg-orange px-4 text-sm font-bold text-white disabled:opacity-40"
                  >
                    <Plus size={14} />
                    {isAddingStaff ? "新增中…" : "建立帳號"}
                  </button>
                </div>
                <p className="mt-2 text-xs text-charcoal/50">
                  工作人員只能掃描此活動的 QR，支援多台裝置同時登入
                </p>
              </div>
            )}

            {staffList.length === 0 ? (
              <div className="py-6 text-center text-sm text-charcoal/50">
                <UserCog size={28} className="mx-auto mb-2 opacity-30" />
                尚未建立工作人員帳號
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-charcoal/10">
                <div className="grid grid-cols-[1fr_1.5fr_1fr] bg-cloud px-4 py-3 text-sm font-bold">
                  <span>姓名</span>
                  <span>Email</span>
                  <span>建立時間</span>
                </div>
                {staffList.map((s) => (
                  <div
                    key={s.id}
                    className="grid grid-cols-[1fr_1.5fr_1fr] items-center border-t border-charcoal/10 px-4 py-3 text-sm"
                  >
                    <span className="font-semibold">{s.name}</span>
                    <span className="text-charcoal/70">{s.email}</span>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-charcoal/50">{formatDate(s.createdAt)}</span>
                      <button
                        type="button"
                        onClick={() => void removeStaff(s.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-charcoal/40 hover:bg-red-50 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 匯入名單 */}
          <section className="mt-5 rounded-lg border border-charcoal/10 bg-white p-5">
            <div className="flex items-center gap-2 mb-4">
              <FileSpreadsheet size={18} />
              <h2 className="text-lg font-bold">匯入名單</h2>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <label className="text-sm font-semibold">
                Excel 檔案（需含姓名、電話欄位）
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
                  className="mt-2 block h-11 w-full max-w-xs rounded-lg border border-charcoal/15 bg-paper px-3 py-2 text-sm outline-none focus:border-mint"
                />
              </label>
              <button
                type="button"
                disabled={!importFile || isImporting}
                onClick={() => void importAttendees()}
                className="flex h-11 items-center gap-2 rounded-lg bg-orange px-4 text-sm font-bold text-white disabled:opacity-40"
              >
                <Upload size={16} />
                {isImporting ? "匯入中…" : "匯入"}
              </button>
            </div>
            {importMsg && (
              <p className={`mt-3 text-sm font-semibold ${importMsg.includes("已匯入") ? "text-green-600" : "text-red-600"}`}>
                {importMsg}
              </p>
            )}
          </section>

          {/* 發送邀請 */}
          <section className="mt-5 rounded-lg border border-charcoal/10 bg-white p-5">
            <div className="flex items-center gap-2 mb-4">
              <Send size={18} />
              <h2 className="text-lg font-bold">發送邀請簡訊</h2>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <div className="text-sm font-semibold">
                簡訊模板
                <div className="mt-2 flex gap-2">
                  {([
                    { id: "without-registration", label: "直接附票券連結" },
                    { id: "with-registration", label: "需填寫報名資料" }
                  ] as const).map((t) => (
                    <label key={t.id} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${smsTemplate === t.id ? "border-orange bg-orange/10 text-orange" : "border-charcoal/15 bg-paper"}`}>
                      <input
                        type="radio"
                        name="smsTemplate"
                        value={t.id}
                        checked={smsTemplate === t.id}
                        onChange={() => setSmsTemplate(t.id)}
                        className="sr-only"
                      />
                      {t.label}
                    </label>
                  ))}
                </div>
                {smsTemplate === "with-registration" && (
                  <p className="mt-2 text-xs font-normal text-charcoal/55">
                    {event.registrationRequired
                      ? `報名欄位已啟用，參加者點開連結後須填寫後才能取得 QR Code。`
                      : `目前活動未啟用報名欄位，請先在「編輯」中開啟並設定欄位。`}
                  </p>
                )}
              </div>
              <button
                type="button"
                disabled={attendees.length === 0 || isSendingInvite}
                onClick={() => void sendInvites()}
                className="flex h-10 items-center gap-2 rounded-lg bg-orange px-4 text-sm font-bold text-white disabled:opacity-40"
              >
                <Send size={16} />
                {isSendingInvite ? "發送中…" : `發送全部（${attendees.length} 人）`}
              </button>
            </div>
            {inviteMsg && (
              <p className={`mt-3 text-sm font-semibold ${inviteMsg.includes("已發送") ? "text-green-600" : "text-red-600"}`}>
                {inviteMsg}
              </p>
            )}
          </section>

          {/* 報名名單 */}
          <section className="mt-5 rounded-lg border border-charcoal/10 bg-white p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Users size={18} />
                <h2 className="text-lg font-bold">報名名單</h2>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="text-charcoal/60">
                  共 <strong>{attendees.length}</strong> 人
                </span>
                <span className="flex items-center gap-1 font-semibold text-green-600">
                  <Check size={14} />
                  已報到 {checkedIn}
                </span>
                {attendees.length > 0 && (
                  <div className="flex items-center gap-2 rounded-lg border border-charcoal/15 px-2 py-1">
                    <MessageSquare size={13} className="text-charcoal/50" />
                    <span className="text-xs font-semibold text-charcoal/60">補發：</span>
                    <select
                      value={smsResendTemplate}
                      onChange={(e) => setSmsResendTemplate(e.target.value as typeof smsResendTemplate)}
                      className="bg-transparent text-xs font-semibold outline-none"
                    >
                      <option value="without-registration">附票券連結</option>
                      <option value="with-registration">附報名連結</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {attendees.length === 0 ? (
              <div className="py-8 text-center text-sm text-charcoal/50">
                <ClipboardList size={32} className="mx-auto mb-2 opacity-30" />
                目前沒有報名資料
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[640px] overflow-hidden rounded-lg border border-charcoal/10">
                  <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_auto] bg-cloud px-4 py-3 text-sm font-bold">
                    <span>姓名</span>
                    <span>電話</span>
                    <span>報到碼</span>
                    <span>狀態</span>
                    <span>簡訊</span>
                  </div>
                  {attendees.map((attendee) => (
                    <div
                      key={attendee.id}
                      className="grid grid-cols-[1.5fr_1fr_1fr_1fr_auto] items-center border-t border-charcoal/10 px-4 py-3 text-sm"
                    >
                      <span className="font-semibold">{attendee.name}</span>
                      <span className="text-charcoal/70">{attendee.phone}</span>
                      <span className="font-mono text-xs text-charcoal/60">{attendee.checkInCode}</span>
                      <span className={`inline-flex items-center gap-1 text-xs font-bold ${
                        attendee.checkInStatus === "CHECKED_IN" ? "text-green-600" : "text-charcoal/40"
                      }`}>
                        {attendee.checkInStatus === "CHECKED_IN" && <Check size={12} />}
                        {statusLabel[attendee.checkInStatus] ?? attendee.checkInStatus}
                      </span>
                      <button
                        type="button"
                        disabled={smsLoadingId === attendee.id}
                        onClick={() => void resendSms(attendee.id)}
                        title="補發簡訊"
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-charcoal/15 text-charcoal/50 hover:border-orange/30 hover:text-orange disabled:opacity-40 transition-colors"
                      >
                        {smsLoadingId === attendee.id
                          ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-orange border-t-transparent" />
                          : <MessageSquare size={13} />
                        }
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </AdminShell>
  );
}
