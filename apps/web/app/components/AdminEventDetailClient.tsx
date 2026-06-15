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
  Settings2,
  Trash2,
  Upload,
  Users,
  UserCog,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { DateTimePicker } from "./DateTimePicker";
import { RegistrationFieldsEditor } from "./RegistrationFieldsEditor";
import { VenueQrButton } from "./VenueQrModal";

type Props = { eventId: string; created?: boolean };

function formatDate(value: string) {
  return new Date(value).toLocaleString("zh-TW", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit"
  });
}

function toDatetimeLocal(value: string) {
  const d = new Date(value);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

const statusLabel: Record<string, string> = { CHECKED_IN: "已報到", NOT_CHECKED_IN: "未報到" };

export function AdminEventDetailClient({ eventId, created }: Props) {
  const [token, setToken] = useState("");
  const [event, setEvent] = useState<EventDTO | null>(null);
  const [attendees, setAttendees] = useState<AttendeeDTO[]>([]);
  const [staffList, setStaffList] = useState<StaffDTO[]>([]);
  const [message, setMessage] = useState(created ? "活動已建立！現在可以匯入名單並發送邀請。" : "");

  // Modal visibility
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showSmsModal, setShowSmsModal] = useState(false);

  // Edit form
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editStartAt, setEditStartAt] = useState("");
  const [editEndAt, setEditEndAt] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editRegistrationRequired, setEditRegistrationRequired] = useState(false);
  const [editRegFields, setEditRegFields] = useState<RegistrationField[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Staff form
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [staffName, setStaffName] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [staffMsg, setStaffMsg] = useState("");
  const [isAddingStaff, setIsAddingStaff] = useState(false);

  // SMS settings (modal)
  const [smsTemplate, setSmsTemplate] = useState<"with-registration" | "without-registration">("without-registration");
  const [smsSenderName, setSmsSenderName] = useState("");

  // Attendee list actions
  const [showImportForm, setShowImportForm] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importMsg, setImportMsg] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [addName, setAddName] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [addCapacity, setAddCapacity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [addMsg, setAddMsg] = useState("");
  const [smsLoadingId, setSmsLoadingId] = useState<string | null>(null);
  const [smsResendTemplate, setSmsResendTemplate] = useState<"with-registration" | "without-registration">("without-registration");
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [inviteMsg, setInviteMsg] = useState("");

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
      if (!eventRes.success || !eventRes.data) { setMessage(eventRes.error?.message ?? "讀取活動失敗"); return; }
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
    const res = await apiFetch<EventDTO>(`/events/${eventId}`, {
      method: "PATCH", token,
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
    if (!res.success || !res.data) { setMessage(res.error?.message ?? "儲存失敗"); return; }
    setEvent(res.data);
    setShowEditModal(false);
    setMessage("活動已更新！");
  }

  async function addStaff() {
    if (!staffName.trim() || !staffEmail.trim() || !staffPassword.trim()) { setStaffMsg("請填寫所有欄位"); return; }
    setIsAddingStaff(true); setStaffMsg("");
    const res = await apiFetch<StaffDTO>(`/events/${eventId}/staff`, {
      method: "POST", token,
      body: JSON.stringify({ name: staffName.trim(), email: staffEmail.trim(), password: staffPassword })
    });
    setIsAddingStaff(false);
    if (!res.success || !res.data) { setStaffMsg(res.error?.message ?? "新增失敗"); return; }
    setStaffList((prev) => [...prev, res.data!]);
    setStaffName(""); setStaffEmail(""); setStaffPassword("");
    setShowStaffForm(false); setStaffMsg("");
  }

  async function removeStaff(staffId: string) {
    if (!confirm("確定要移除此工作人員帳號？")) return;
    const res = await apiFetch<{ id: string }>(`/events/${eventId}/staff/${staffId}`, { method: "DELETE", token });
    if (res.success) setStaffList((prev) => prev.filter((s) => s.id !== staffId));
  }

  async function importAttendees() {
    if (!importFile) return;
    setIsImporting(true); setImportMsg("");
    const form = new FormData();
    form.append("file", importFile);
    const res = await apiFetch<{ imported: number }>(`/events/${eventId}/attendees/import`, { method: "POST", token, body: form });
    setIsImporting(false);
    if (!res.success || !res.data) { setImportMsg(res.error?.message ?? "匯入失敗"); return; }
    setImportMsg(`已匯入 ${res.data.imported} 筆名單`);
    setImportFile(null); setShowImportForm(false);
    window.dispatchEvent(new CustomEvent("credits-changed"));
    const r = await apiFetch<AttendeeDTO[]>(`/events/${eventId}/attendees`, { token });
    if (r.success && r.data) setAttendees(r.data);
  }

  async function addAttendee() {
    if (!addName.trim() || !addPhone.trim()) { setAddMsg("請填寫姓名與電話"); return; }
    setIsAdding(true); setAddMsg("");
    const res = await apiFetch<AttendeeDTO>(`/events/${eventId}/attendees`, {
      method: "POST", token,
      body: JSON.stringify({ name: addName.trim(), phone: addPhone.trim(), capacity: addCapacity })
    });
    setIsAdding(false);
    if (!res.success || !res.data) { setAddMsg(res.error?.message ?? "新增失敗"); return; }
    setAttendees((prev) => [...prev, res.data!]);
    setAddName(""); setAddPhone(""); setAddCapacity(1); setShowAddForm(false); setAddMsg("");
    window.dispatchEvent(new CustomEvent("credits-changed"));
  }

  async function downloadExport(format: "csv" | "xlsx") {
    const { getApiBaseUrl } = await import("../lib/api");
    const res = await fetch(`${getApiBaseUrl()}/events/${eventId}/attendees/export?format=${format}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `attendees.${format}`; a.click();
    URL.revokeObjectURL(url);
  }

  async function sendInvites() {
    setIsSendingInvite(true); setInviteMsg("");
    const res = await apiFetch<{ sent: number; failed: number }>(`/events/${eventId}/invite`, {
      method: "POST", token,
      body: JSON.stringify({ template: smsTemplate, senderName: smsSenderName.trim() || undefined })
    });
    setIsSendingInvite(false);
    if (!res.success || !res.data) { setInviteMsg(res.error?.message ?? "發送失敗"); return; }
    setInviteMsg(`已發送 ${res.data.sent} 則，失敗 ${res.data.failed} 則`);
  }

  async function resendSms(attendeeId: string) {
    setSmsLoadingId(attendeeId);
    const res = await apiFetch<SmsResultDTO>(`/events/${eventId}/attendees/${attendeeId}/invite`, {
      method: "POST", token,
      body: JSON.stringify({ template: smsResendTemplate, senderName: smsSenderName.trim() || undefined })
    });
    setSmsLoadingId(null);
    setMessage(res.success && res.data ? res.data.message : res.error?.message ?? "簡訊發送失敗");
  }

  const checkedIn = attendees.filter((a) => a.checkInStatus === "CHECKED_IN").length;

  return (
    <>
      <div className="flex items-center gap-3">
        <Link href="/admin/events" className="flex h-9 w-9 items-center justify-center rounded-lg border border-charcoal/15 bg-white hover:bg-cloud transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <p className="text-sm font-bold text-orange">活動詳情</p>
          <h1 className="text-2xl font-bold">{event?.name ?? "載入中…"}</h1>
        </div>
      </div>

      {message && (
        <section className={`mt-5 rounded-lg border p-4 text-sm font-semibold ${
          message.includes("更新") || message.includes("已") ? "border-green-200 bg-green-50 text-green-700" : "border-orange/20 bg-orange/10"
        }`}>
          {message}
        </section>
      )}

      {event && (
        <>
          {/* 活動資訊卡 */}
          <section className="mt-5 rounded-lg border border-charcoal/10 bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <span className="text-charcoal/50">活動名稱</span>
                  <p className="font-semibold">{event.name}</p>
                </div>
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
                  onClick={() => setShowEditModal(true)}
                  className="flex h-10 items-center gap-2 rounded-lg border border-charcoal/15 bg-white px-4 text-sm font-bold hover:bg-paper"
                >
                  <Pencil size={14} />
                  編輯
                </button>
                <button
                  type="button"
                  onClick={() => setShowStaffModal(true)}
                  className="flex h-10 items-center gap-2 rounded-lg border border-charcoal/15 bg-white px-4 text-sm font-bold hover:bg-paper"
                >
                  <UserCog size={14} />
                  工作人員
                </button>
                <button
                  type="button"
                  onClick={() => setShowSmsModal(true)}
                  className="flex h-10 items-center gap-2 rounded-lg border border-charcoal/15 bg-white px-4 text-sm font-bold hover:bg-paper"
                >
                  <Settings2 size={14} />
                  簡訊設定
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
          </section>

          {/* 報名名單 */}
          <section className="mt-5 rounded-lg border border-charcoal/10 bg-white p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Users size={18} />
                <h2 className="text-lg font-bold">報名名單</h2>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-charcoal/60">共 <strong>{attendees.length}</strong> 人</span>
                <span className="flex items-center gap-1 font-semibold text-green-600">
                  <Check size={14} />已報到 {checkedIn}
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
                <button
                  type="button"
                  disabled={attendees.length === 0 || isSendingInvite}
                  onClick={() => void sendInvites()}
                  className="flex h-8 items-center gap-1.5 rounded-lg bg-orange px-3 text-xs font-bold text-white disabled:opacity-40"
                >
                  <Send size={13} />
                  {isSendingInvite ? "發送中…" : `發送全部`}
                </button>
                <button
                  type="button"
                  onClick={() => void downloadExport("xlsx")}
                  className="flex h-8 items-center gap-1.5 rounded-lg border border-charcoal/15 px-3 text-xs font-semibold hover:bg-paper"
                >
                  <FileSpreadsheet size={13} />匯出 XLSX
                </button>
                <button
                  type="button"
                  onClick={() => void downloadExport("csv")}
                  className="flex h-8 items-center gap-1.5 rounded-lg border border-charcoal/15 px-3 text-xs font-semibold hover:bg-paper"
                >
                  <FileSpreadsheet size={13} />匯出 CSV
                </button>
                <button
                  type="button"
                  onClick={() => { setShowImportForm((v) => !v); setShowAddForm(false); setImportMsg(""); }}
                  className="flex h-8 items-center gap-1.5 rounded-lg border border-charcoal/15 px-3 text-xs font-semibold hover:bg-paper"
                >
                  <Upload size={13} />匯入
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddForm((v) => !v); setShowImportForm(false); setAddMsg(""); }}
                  className="flex h-8 items-center gap-1.5 rounded-lg bg-orange px-3 text-xs font-bold text-white hover:bg-orange/90"
                >
                  <Plus size={13} />新增
                </button>
              </div>
            </div>

            {inviteMsg && (
              <p className={`mb-3 text-sm font-semibold ${inviteMsg.includes("已發送") ? "text-green-600" : "text-red-600"}`}>
                {inviteMsg}
              </p>
            )}

            {/* 新增表單 */}
            {showAddForm && (
              <div className="mb-4 rounded-lg border border-charcoal/10 bg-paper p-4">
                <p className="mb-3 text-sm font-bold">新增參與者</p>
                {addMsg && <p className="mb-3 text-xs font-semibold text-red-500">{addMsg}</p>}
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-xs font-semibold">
                    姓名
                    <input value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="王小明"
                      className="mt-1.5 h-10 w-full rounded-lg border border-charcoal/15 bg-white px-3 text-sm outline-none focus:border-mint" />
                  </label>
                  <label className="text-xs font-semibold">
                    電話
                    <input value={addPhone} onChange={(e) => setAddPhone(e.target.value)} placeholder="0912345678"
                      className="mt-1.5 h-10 w-full rounded-lg border border-charcoal/15 bg-white px-3 text-sm outline-none focus:border-mint" />
                  </label>
                  <label className="text-xs font-semibold">
                    參加人數（含本人）
                    <input type="number" min={1} max={20} value={addCapacity}
                      onChange={(e) => setAddCapacity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="mt-1.5 h-10 w-full rounded-lg border border-charcoal/15 bg-white px-3 text-sm outline-none focus:border-mint" />
                  </label>
                </div>
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={() => { setShowAddForm(false); setAddMsg(""); }}
                    className="h-9 rounded-lg border border-charcoal/15 px-4 text-sm font-semibold hover:bg-white">取消</button>
                  <button type="button" disabled={isAdding} onClick={() => void addAttendee()}
                    className="flex h-9 items-center gap-1.5 rounded-lg bg-orange px-4 text-sm font-bold text-white disabled:opacity-40">
                    <Plus size={14} />{isAdding ? "新增中…" : "新增"}
                  </button>
                </div>
                <p className="mt-2 text-xs text-charcoal/50">每新增一位消耗 1 個報到額度</p>
              </div>
            )}

            {/* 匯入表單 */}
            {showImportForm && (
              <div className="mb-4 rounded-lg border border-charcoal/10 bg-paper p-4">
                <p className="mb-1 text-sm font-bold">匯入名單</p>
                <p className="mb-3 text-xs text-charcoal/50">支援 Excel (.xlsx / .xls)、CSV、Numbers、ODS，需含「姓名」與「電話」欄位</p>
                <div className="flex flex-wrap items-end gap-3">
                  <input type="file" accept=".xlsx,.xls,.csv,.numbers,.ods"
                    onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
                    className="h-10 rounded-lg border border-charcoal/15 bg-white px-3 py-2 text-sm outline-none focus:border-mint" />
                  <button type="button" disabled={!importFile || isImporting} onClick={() => void importAttendees()}
                    className="flex h-10 items-center gap-2 rounded-lg bg-orange px-4 text-sm font-bold text-white disabled:opacity-40">
                    <Upload size={15} />{isImporting ? "匯入中…" : "匯入"}
                  </button>
                  <button type="button" onClick={() => { setShowImportForm(false); setImportFile(null); setImportMsg(""); }}
                    className="h-10 rounded-lg border border-charcoal/15 px-4 text-sm font-semibold hover:bg-white">取消</button>
                </div>
                {importMsg && (
                  <p className={`mt-2 text-xs font-semibold ${importMsg.includes("已匯入") ? "text-green-600" : "text-red-600"}`}>{importMsg}</p>
                )}
              </div>
            )}

            {attendees.length === 0 ? (
              <div className="py-8 text-center text-sm text-charcoal/50">
                <ClipboardList size={32} className="mx-auto mb-2 opacity-30" />
                目前沒有報名資料
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[800px] overflow-hidden rounded-lg border border-charcoal/10">
                  <div className="grid grid-cols-[1.5fr_1fr_1fr_0.8fr_0.8fr_1.5fr_auto] bg-cloud px-4 py-3 text-sm font-bold">
                    <span>姓名</span><span>電話</span><span>報到碼</span><span>預期人數</span><span>狀態</span><span>備註</span><span>簡訊</span>
                  </div>
                  {attendees.map((attendee) => (
                    <div key={attendee.id}
                      className="grid grid-cols-[1.5fr_1fr_1fr_0.8fr_0.8fr_1.5fr_auto] items-center border-t border-charcoal/10 px-4 py-3 text-sm">
                      <span className="font-semibold">{attendee.name}</span>
                      <span className="text-charcoal/70">{attendee.phone}</span>
                      <span className="font-mono text-xs text-charcoal/60">{attendee.checkInCode}</span>
                      <span className="text-xs text-charcoal/70">
                        {(attendee.checkInCapacity ?? 1) > 1
                          ? `${attendee.checkInCount ?? 0}／${attendee.checkInCapacity} 人`
                          : "1 人"}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-xs font-bold ${attendee.checkInStatus === "CHECKED_IN" ? "text-green-600" : "text-charcoal/40"}`}>
                        {attendee.checkInStatus === "CHECKED_IN" && <Check size={12} />}
                        {statusLabel[attendee.checkInStatus] ?? attendee.checkInStatus}
                      </span>
                      <span className="truncate text-xs text-charcoal/60" title={attendee.note ?? ""}>
                        {attendee.note ?? <span className="text-charcoal/30">—</span>}
                      </span>
                      <button type="button" disabled={smsLoadingId === attendee.id} onClick={() => void resendSms(attendee.id)}
                        title="補發簡訊"
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-charcoal/15 text-charcoal/50 hover:border-orange/30 hover:text-orange disabled:opacity-40 transition-colors">
                        {smsLoadingId === attendee.id
                          ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-orange border-t-transparent" />
                          : <MessageSquare size={13} />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </>
      )}

      {/* ── 編輯活動 Modal ── */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-16"
          onClick={() => setShowEditModal(false)}>
          <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold">編輯活動</h2>
              <button type="button" onClick={() => setShowEditModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-charcoal/15 hover:bg-paper">
                <X size={15} />
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold">
                活動名稱
                <input value={editName} onChange={(e) => setEditName(e.target.value)}
                  className="mt-2 h-11 w-full rounded-lg border border-charcoal/15 bg-paper px-3 outline-none focus:border-mint" />
              </label>
              <label className="text-sm font-semibold">
                Slug
                <input value={editSlug} onChange={(e) => setEditSlug(e.target.value)}
                  className="mt-2 h-11 w-full rounded-lg border border-charcoal/15 bg-paper px-3 outline-none focus:border-mint" />
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
                <input value={editLocation} onChange={(e) => setEditLocation(e.target.value)}
                  className="mt-2 h-11 w-full rounded-lg border border-charcoal/15 bg-paper px-3 outline-none focus:border-mint" />
              </label>
              <label className="sm:col-span-2 text-sm font-semibold">
                簡短說明
                <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={2}
                  className="mt-2 w-full rounded-lg border border-charcoal/15 bg-paper p-3 text-sm outline-none focus:border-mint" />
              </label>
            </div>
            {/* 報名設定 */}
            <div className="mt-4 rounded-lg bg-paper p-4">
              <p className="mb-3 text-sm font-bold">報名設定</p>
              <label className="flex cursor-pointer items-start gap-2">
                <input type="checkbox" checked={editRegistrationRequired}
                  onChange={(e) => setEditRegistrationRequired(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded accent-orange" />
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
            <div className="mt-5 flex gap-3">
              <button type="button" onClick={() => setShowEditModal(false)}
                className="flex h-10 items-center gap-2 rounded-lg border border-charcoal/15 px-4 text-sm font-semibold hover:bg-paper">取消</button>
              <button type="button" disabled={isSaving} onClick={() => void saveEdit()}
                className="flex h-10 items-center gap-2 rounded-lg bg-orange px-4 text-sm font-bold text-white disabled:opacity-40">
                {isSaving ? "儲存中…" : "儲存變更"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 工作人員 Modal ── */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-16"
          onClick={() => setShowStaffModal(false)}>
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCog size={18} />
                <h2 className="text-lg font-bold">工作人員帳號</h2>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => { setShowStaffForm((v) => !v); setStaffMsg(""); }}
                  className="flex h-9 items-center gap-2 rounded-lg border border-charcoal/15 px-3 text-sm font-bold hover:bg-paper">
                  <Plus size={15} />新增人員
                </button>
                <button type="button" onClick={() => setShowStaffModal(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-charcoal/15 hover:bg-paper">
                  <X size={15} />
                </button>
              </div>
            </div>

            {showStaffForm && (
              <div className="mb-4 rounded-lg border border-charcoal/10 bg-paper p-4">
                <p className="mb-3 text-sm font-bold">新增工作人員帳號</p>
                {staffMsg && <p className="mb-3 text-xs font-semibold text-red-500">{staffMsg}</p>}
                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="text-xs font-semibold">
                    姓名
                    <input value={staffName} onChange={(e) => setStaffName(e.target.value)}
                      className="mt-1.5 h-10 w-full rounded-lg border border-charcoal/15 bg-white px-3 text-sm outline-none focus:border-mint" />
                  </label>
                  <label className="text-xs font-semibold">
                    Email（登入帳號）
                    <input type="email" value={staffEmail} onChange={(e) => setStaffEmail(e.target.value)}
                      className="mt-1.5 h-10 w-full rounded-lg border border-charcoal/15 bg-white px-3 text-sm outline-none focus:border-mint" />
                  </label>
                  <label className="text-xs font-semibold">
                    密碼（至少 6 碼）
                    <input type="password" value={staffPassword} onChange={(e) => setStaffPassword(e.target.value)}
                      className="mt-1.5 h-10 w-full rounded-lg border border-charcoal/15 bg-white px-3 text-sm outline-none focus:border-mint" />
                  </label>
                </div>
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={() => { setShowStaffForm(false); setStaffMsg(""); }}
                    className="h-9 rounded-lg border border-charcoal/15 px-4 text-sm font-semibold hover:bg-white">取消</button>
                  <button type="button" disabled={isAddingStaff} onClick={() => void addStaff()}
                    className="flex h-9 items-center gap-1.5 rounded-lg bg-orange px-4 text-sm font-bold text-white disabled:opacity-40">
                    <Plus size={14} />{isAddingStaff ? "新增中…" : "建立帳號"}
                  </button>
                </div>
                <p className="mt-2 text-xs text-charcoal/50">工作人員只能掃描此活動的 QR，支援多台裝置同時登入</p>
              </div>
            )}

            {staffList.length === 0 ? (
              <div className="py-8 text-center text-sm text-charcoal/50">
                <UserCog size={28} className="mx-auto mb-2 opacity-30" />
                尚未建立工作人員帳號
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-charcoal/10">
                <div className="grid grid-cols-[1fr_1.5fr_1fr] bg-cloud px-4 py-3 text-sm font-bold">
                  <span>姓名</span><span>Email</span><span>建立時間</span>
                </div>
                {staffList.map((s) => (
                  <div key={s.id} className="grid grid-cols-[1fr_1.5fr_1fr] items-center border-t border-charcoal/10 px-4 py-3 text-sm">
                    <span className="font-semibold">{s.name}</span>
                    <span className="text-charcoal/70">{s.email}</span>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-charcoal/50">{formatDate(s.createdAt)}</span>
                      <button type="button" onClick={() => void removeStaff(s.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-charcoal/40 hover:bg-red-50 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 簡訊設定 Modal ── */}
      {showSmsModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-16"
          onClick={() => setShowSmsModal(false)}>
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings2 size={18} />
                <h2 className="text-lg font-bold">簡訊設定</h2>
              </div>
              <button type="button" onClick={() => setShowSmsModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-charcoal/15 hover:bg-paper">
                <X size={15} />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <p className="mb-2 text-sm font-semibold">發件單位名稱</p>
                <input value={smsSenderName} onChange={(e) => setSmsSenderName(e.target.value)}
                  maxLength={20} placeholder="MonMate"
                  className="h-10 w-full rounded-lg border border-charcoal/15 bg-paper px-3 text-sm outline-none focus:border-mint" />
                <p className="mt-1.5 text-xs text-charcoal/50">
                  預覽：【{smsSenderName.trim() || "MonMate"}】姓名 您好，…
                </p>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold">簡訊模板</p>
                <div className="flex flex-col gap-2">
                  {([
                    { id: "without-registration", label: "直接附票券連結", desc: "直接發送 QR Code 連結" },
                    { id: "with-registration",    label: "需填寫報名資料", desc: "受邀者先填資料再取得票券" }
                  ] as const).map((t) => (
                    <label key={t.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${smsTemplate === t.id ? "border-orange bg-orange/5" : "border-charcoal/15 hover:bg-paper"}`}>
                      <input type="radio" name="smsTemplate" value={t.id}
                        checked={smsTemplate === t.id} onChange={() => setSmsTemplate(t.id)}
                        className="mt-0.5 accent-orange" />
                      <div>
                        <p className={`text-sm font-semibold ${smsTemplate === t.id ? "text-orange" : ""}`}>{t.label}</p>
                        <p className="text-xs text-charcoal/50">{t.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
                {smsTemplate === "with-registration" && !event?.registrationRequired && (
                  <p className="mt-2 text-xs text-amber-600">活動尚未啟用報名欄位，請先至「編輯」中開啟。</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button type="button" onClick={() => setShowSmsModal(false)}
                className="h-10 rounded-lg bg-orange px-5 text-sm font-bold text-white hover:bg-orange/90">
                完成
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}