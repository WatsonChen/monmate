"use client";

import type { AttendeeDTO, EventDTO, RegistrationField, StaffDTO } from "@monmate/types";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpDown,
  Check,
  ClipboardList,
  Copy,
  ExternalLink,
  FileSpreadsheet,
  Info,
  Pencil,
  Plus,
  Search,
  Send,
  Trash2,
  Upload,
  Users,
  UserCog,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { DateTimePicker } from "./DateTimePicker";
import { DotsLoading } from "./DotsLoading";
import { RegistrationFieldsEditor } from "./RegistrationFieldsEditor";
import { RichEditor } from "./RichEditor";
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

const PRESET_KEYS = ["email", "age", "gender", "capacity"];

function genderLabel(gender?: string | null) {
  return gender === "M" ? "男" : gender === "F" ? "女" : gender === "OTHER" ? "其他" : "";
}

function getAttendanceState(attendee: AttendeeDTO) {
  const capacity = attendee.checkInCapacity ?? 1;
  const count = attendee.checkInCount ?? (attendee.checkInStatus === "CHECKED_IN" ? capacity : 0);
  if (count >= capacity) {
    return { label: "已報到", tone: "text-green-600", showCheck: true };
  }
  if (count > 0) {
    return { label: "部分報到", tone: "text-orange", showCheck: false };
  }
  return { label: "未報到", tone: "text-charcoal/40", showCheck: false };
}

export function AdminEventDetailClient({ eventId, created }: Props) {
  const [token, setToken] = useState("");
  const [event, setEvent] = useState<EventDTO | null>(null);
  const [attendees, setAttendees] = useState<AttendeeDTO[]>([]);
  const [staffList, setStaffList] = useState<StaffDTO[]>([]);
  const [message, setMessage] = useState(created ? "活動已建立！現在可以匯入名單並發送邀請。" : "");

  // Modal visibility
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);

  // Edit form
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editStartAt, setEditStartAt] = useState("");
  const [editEndAt, setEditEndAt] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editRegistrationRequired, setEditRegistrationRequired] = useState(false);
  const [editOpenRegistration, setEditOpenRegistration] = useState(false);
  const [editRegFields, setEditRegFields] = useState<RegistrationField[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Staff form
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [staffName, setStaffName] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [staffMsg, setStaffMsg] = useState("");
  const [isAddingStaff, setIsAddingStaff] = useState(false);

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
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [inviteMsg, setInviteMsg] = useState("");
  const [sendingInviteId, setSendingInviteId] = useState<string | null>(null);
  const [editingAttendee, setEditingAttendee] = useState<AttendeeDTO | null>(null);
  const [editAttendeeName, setEditAttendeeName] = useState("");
  const [editAttendeePhone, setEditAttendeePhone] = useState("");
  const [editAttendeeEmail, setEditAttendeeEmail] = useState("");
  const [editAttendeeAge, setEditAttendeeAge] = useState("");
  const [editAttendeeGender, setEditAttendeeGender] = useState("");
  const [editAttendeeCustomFields, setEditAttendeeCustomFields] = useState<Record<string, string>>({});
  const [editAttendeeCapacity, setEditAttendeeCapacity] = useState<string>("1");
  const [editAttendeeCount, setEditAttendeeCount] = useState(0);
  const [editAttendeeNote, setEditAttendeeNote] = useState("");
  const [editAttendeeMsg, setEditAttendeeMsg] = useState("");
  const [isSavingAttendee, setIsSavingAttendee] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusSort, setStatusSort] = useState<"" | "checked" | "unchecked">("");

  const regFields = event?.registrationFields ?? [];
  const showAgeCol = regFields.some((f) => f.key === "age");
  const showGenderCol = regFields.some((f) => f.key === "gender");
  const customCols = regFields.filter((f) => !PRESET_KEYS.includes(f.key));

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
      setEditContent(ev.content ?? "");
      setEditRegistrationRequired(ev.registrationRequired ?? false);
      setEditOpenRegistration(ev.openRegistration ?? false);
      setEditRegFields((ev.registrationFields as RegistrationField[]) ?? []);
      if (attendeesRes.success && attendeesRes.data) setAttendees(attendeesRes.data);
      if (staffRes.success && staffRes.data) setStaffList(staffRes.data);
    }
    void load();

    async function refetchAttendees() {
      const r = await apiFetch<AttendeeDTO[]>(`/events/${eventId}/attendees`, { token });
      if (r.success && r.data) setAttendees(r.data);
    }
    const onVisible = () => { if (document.visibilityState === "visible") void refetchAttendees(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
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
        content: editContent || null,
        registrationRequired: editRegistrationRequired,
        openRegistration: editOpenRegistration,
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

  function openEditAttendee(attendee: AttendeeDTO) {
    setEditingAttendee(attendee);
    setEditAttendeeName(attendee.name);
    setEditAttendeePhone(attendee.phone);
    setEditAttendeeEmail(attendee.email ?? "");
    setEditAttendeeAge(attendee.age != null ? String(attendee.age) : "");
    setEditAttendeeGender(attendee.gender ?? "");
    const existingCustom = (attendee.customFields ?? {}) as Record<string, string | number | null>;
    const initCustom: Record<string, string> = {};
    for (const f of customCols) {
      const v = existingCustom[f.key] ?? (f.label ? existingCustom[f.label] : undefined);
      initCustom[f.key] = v != null ? String(v) : "";
    }
    setEditAttendeeCustomFields(initCustom);
    setEditAttendeeCapacity(String(attendee.checkInCapacity ?? 1));
    setEditAttendeeCount(attendee.checkInCount ?? 0);
    setEditAttendeeNote(attendee.note ?? "");
    setEditAttendeeMsg("");
  }

  async function saveAttendeeEdit() {
    if (!editingAttendee) return;
    const capacity = Math.max(1, parseInt(editAttendeeCapacity) || 1);
    const count = Math.max(0, editAttendeeCount || 0);
    if (!editAttendeeName.trim() || !editAttendeePhone.trim()) {
      setEditAttendeeMsg("請填寫姓名與電話");
      return;
    }
    if (count > capacity) {
      setEditAttendeeMsg("實際報到人數不能超過報名人數");
      return;
    }
    setIsSavingAttendee(true);
    setEditAttendeeMsg("");
    const res = await apiFetch<AttendeeDTO>(`/events/${eventId}/attendees/${editingAttendee.id}`, {
      method: "PATCH",
      token,
      body: JSON.stringify({
        name: editAttendeeName.trim(),
        phone: editAttendeePhone.trim(),
        email: editAttendeeEmail.trim() || null,
        checkInCapacity: capacity,
        checkInCount: count,
        checkInStatus: count > 0 ? "CHECKED_IN" : "NOT_CHECKED_IN",
        checkedInAt: count > 0 ? (editingAttendee.checkedInAt ?? new Date().toISOString()) : null,
        note: editAttendeeNote.trim() || null
      })
    });
    setIsSavingAttendee(false);
    if (!res.success || !res.data) {
      setEditAttendeeMsg(res.error?.message ?? "儲存失敗");
      return;
    }
    setAttendees((prev) => prev.map((attendee) => attendee.id === res.data!.id ? res.data! : attendee));
    setEditingAttendee(null);
    setMessage("報名資料已更新！");
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
      body: JSON.stringify({ template: event?.registrationRequired ? "with-registration" : "without-registration" })
    });
    setIsSendingInvite(false);
    if (!res.success || !res.data) { setInviteMsg(res.error?.message ?? "寄送失敗"); return; }
    setInviteMsg(`已寄送 ${res.data.sent} 封 Email，失敗 ${res.data.failed} 封`);
  }

  async function sendSingleInvite(attendeeId: string) {
    setSendingInviteId(attendeeId);
    const res = await apiFetch<{ success: boolean; message?: string }>(
      `/events/${eventId}/attendees/${attendeeId}/invite`,
      { method: "POST", token, body: JSON.stringify({ template: event?.registrationRequired ? "with-registration" : "without-registration" }) }
    );
    setSendingInviteId(null);
    if (!res.success || res.data?.success === false) {
      setMessage(res.data?.message ?? res.error?.message ?? "寄送失敗");
    } else {
      setMessage("邀請信已寄出！");
    }
  }

  const checkedIn = attendees.filter((a) => {
    const capacity = a.checkInCapacity ?? 1;
    const count = a.checkInCount ?? (a.checkInStatus === "CHECKED_IN" ? capacity : 0);
    return count >= capacity;
  }).length;
  const partiallyCheckedIn = attendees.filter((a) => {
    const capacity = a.checkInCapacity ?? 1;
    const count = a.checkInCount ?? (a.checkInStatus === "CHECKED_IN" ? capacity : 0);
    return count > 0 && count < capacity;
  }).length;

  const q = searchQuery.trim().toLowerCase();

  function statusRank(a: AttendeeDTO) {
    const cap = a.checkInCapacity ?? 1;
    const count = a.checkInCount ?? 0;
    if (count >= cap) return 2;   // 已報到
    if (count > 0) return 1;      // 部分報到
    return 0;                      // 未報到
  }

  const displayedAttendees = attendees
    .filter((a) => !q || a.name.toLowerCase().includes(q) || a.phone.includes(q) || (a.checkInCode ?? "").toLowerCase().includes(q))
    .sort((a, b) => {
      if (!statusSort) return 0;
      const diff = statusRank(a) - statusRank(b);
      return statusSort === "checked" ? -diff : diff;
    });

  return (
    <>
      <div className="flex items-start gap-3">
        <Link href="/admin/events" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-charcoal/15 bg-white hover:bg-cloud transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div className="min-w-0">
          <p className="text-sm font-bold text-orange">活動詳情</p>
          <h1 className="break-words text-2xl font-bold leading-tight">{event?.name ?? <span className="text-charcoal/40">載入中<DotsLoading /></span>}</h1>
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
          <section className="mt-5 rounded-lg border border-charcoal/10 bg-white p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <span className="text-charcoal/50">活動名稱</span>
                  <p className="break-words font-semibold">{event.name}</p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-charcoal/50">活動頁面</span>
                  <div className="mt-0.5 flex items-center gap-2">
                    <a
                      href={`/event/${event.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="break-all font-semibold text-orange underline-offset-2 hover:underline"
                    >
                      {typeof window !== "undefined" ? `${window.location.origin}/event/${event.slug}` : `/event/${event.slug}`}
                    </a>
                    <a href={`/event/${event.slug}`} target="_blank" rel="noreferrer" className="shrink-0 text-charcoal/40 hover:text-orange">
                      <ExternalLink size={14} />
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        const url = `${window.location.origin}/event/${event.slug}`;
                        void navigator.clipboard.writeText(url).then(() => {
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        });
                      }}
                      className="shrink-0 text-charcoal/40 hover:text-orange"
                      title="複製連結"
                    >
                      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
                <div>
                  <span className="text-charcoal/50">開始時間</span>
                  <p className="break-words font-semibold">{formatDate(event.startAt)}</p>
                </div>
                {event.endAt && (
                  <div>
                    <span className="text-charcoal/50">結束時間</span>
                    <p className="break-words font-semibold">{formatDate(event.endAt)}</p>
                  </div>
                )}
                {event.location && (
                  <div>
                    <span className="text-charcoal/50">地點</span>
                    <p className="break-words font-semibold">{event.location}</p>
                  </div>
                )}
                {event.attendeeLimit && (
                  <div>
                    <span className="text-charcoal/50">人數上限</span>
                    <p className="font-semibold">{event.attendeeLimit} 人</p>
                  </div>
                )}
                <div>
                  <span className="text-charcoal/50">公開報名</span>
                  <p className={`font-semibold ${event.openRegistration ? "text-green-600" : "text-charcoal/40"}`}>
                    {event.openRegistration ? "開放中" : "未開放"}
                  </p>
                </div>
                {event.description && (
                  <div className="sm:col-span-2">
                    <span className="text-charcoal/50">簡短說明</span>
                    <p className="whitespace-pre-wrap break-words font-semibold">{event.description}</p>
                  </div>
                )}
              </div>
              <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:flex-wrap lg:w-auto lg:shrink-0 lg:justify-end">
                <button
                  type="button"
                  onClick={() => setShowEditModal(true)}
                  className="flex h-10 items-center justify-center gap-2 rounded-lg border border-charcoal/15 bg-white px-3 text-sm font-bold hover:bg-paper sm:px-4"
                >
                  <Pencil size={14} />
                  編輯
                </button>
                <button
                  type="button"
                  onClick={() => setShowStaffModal(true)}
                  className="flex h-10 items-center justify-center gap-2 rounded-lg border border-charcoal/15 bg-white px-3 text-sm font-bold hover:bg-paper sm:px-4"
                >
                  <UserCog size={14} />
                  工作人員
                </button>
                <Link
                  href={`/admin/survey?eventId=${event.id}`}
                  className="flex h-10 items-center justify-center gap-2 rounded-lg border border-charcoal/15 bg-white px-3 text-sm font-bold hover:bg-paper sm:px-4"
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
                {attendees.length > 0 && (
                  <div className="relative">
                    <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-charcoal/40 pointer-events-none" />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="搜尋…"
                      className="h-8 w-44 rounded-lg border border-charcoal/15 bg-paper pl-7 pr-6 text-xs outline-none focus:border-mint"
                    />
                    {searchQuery && (
                      <button type="button" onClick={() => setSearchQuery("")}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal">
                        <X size={13} />
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-charcoal/60">共 <strong>{attendees.length}</strong> 人</span>
                <span className="flex items-center gap-1 font-semibold text-green-600">
                  <Check size={14} />已報到 {checkedIn}
                </span>
                {partiallyCheckedIn > 0 && (
                  <span className="font-semibold text-orange">部分 {partiallyCheckedIn}</span>
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
            ) : displayedAttendees.length === 0 ? (
              <div className="py-8 text-center text-sm text-charcoal/50">沒有符合的搜尋結果</div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[960px] overflow-hidden rounded-lg border border-charcoal/10">
                  <div className="grid grid-cols-[1.2fr_0.9fr_1.1fr_0.9fr_0.65fr_0.65fr_1fr_64px] bg-cloud px-4 py-3 text-sm font-bold">
                    <span>姓名</span><span>電話</span><span>Email</span><span>報到碼</span><span>報名人數</span>
                    <button type="button" onClick={() => setStatusSort((s) => s === "" ? "checked" : s === "checked" ? "unchecked" : "")}
                      className={`flex items-center gap-1 transition-colors ${statusSort ? "text-orange" : "hover:text-charcoal/60"}`}>
                      狀態<ArrowUpDown size={12} />
                    </button>
                    <span>備註</span><span>操作</span>
                  </div>
                  {displayedAttendees.map((attendee) => (
                    (() => {
                      const attendance = getAttendanceState(attendee);
                      return (
                        <div key={attendee.id}
                          className="grid grid-cols-[1.2fr_0.9fr_1.1fr_0.9fr_0.65fr_0.65fr_1fr_64px] items-center border-t border-charcoal/10 px-4 py-3 text-sm">
                          <span className="font-semibold">{attendee.name}</span>
                          <span className="text-charcoal/70">{attendee.phone}</span>
                          <span className="truncate text-sm text-charcoal/60" title={attendee.email ?? ""}>
                            {attendee.email ?? <span className="text-charcoal/30">—</span>}
                          </span>
                          <span className="font-mono text-sm text-charcoal/60">{attendee.checkInCode}</span>
                          <span className="text-sm text-charcoal/70">
                            {(attendee.checkInCapacity ?? 1) > 1
                              ? `${attendee.checkInCount ?? 0}／${attendee.checkInCapacity} 人`
                              : "1 人"}
                          </span>
                          <span className={`inline-flex items-center gap-1 text-sm font-bold ${attendance.tone}`}>
                            {attendance.showCheck && <Check size={12} />}
                            {attendance.label}
                          </span>
                          <span className="truncate text-sm text-charcoal/60" title={attendee.note ?? ""}>
                            {attendee.note ?? <span className="text-charcoal/30">—</span>}
                          </span>
                          <div className="flex items-center gap-1">
                            <button type="button"
                              onClick={() => void sendSingleInvite(attendee.id)}
                              disabled={!attendee.email || sendingInviteId === attendee.id}
                              title={attendee.email ? "發送邀請信" : "無 Email，無法寄送"}
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-charcoal/15 text-charcoal/50 hover:border-orange/60 hover:text-orange transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                              <Send size={12} className={sendingInviteId === attendee.id ? "animate-pulse" : ""} />
                            </button>
                            <button type="button" onClick={() => openEditAttendee(attendee)}
                              title="編輯報名資料"
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-charcoal/15 text-charcoal/50 hover:border-mint/60 hover:text-charcoal transition-colors">
                              <Pencil size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })()
                  ))}
                </div>
              </div>
            )}
          </section>
        </>
      )}

      {/* ── 編輯報名資料 Modal ── */}
      {editingAttendee && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-16"
          onClick={() => setEditingAttendee(null)}>
          <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl sm:p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pencil size={18} />
                <h2 className="text-lg font-bold">編輯報名資料</h2>
              </div>
              <button type="button" onClick={() => setEditingAttendee(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-charcoal/15 hover:bg-paper">
                <X size={15} />
              </button>
            </div>

            {editAttendeeMsg && <p className="mb-3 text-sm font-semibold text-red-600">{editAttendeeMsg}</p>}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold">
                姓名
                <input value={editAttendeeName} onChange={(e) => setEditAttendeeName(e.target.value)}
                  className="mt-2 h-11 w-full rounded-lg border border-charcoal/15 bg-paper px-3 outline-none focus:border-mint" />
              </label>
              <label className="text-sm font-semibold">
                電話
                <input value={editAttendeePhone} onChange={(e) => setEditAttendeePhone(e.target.value)}
                  className="mt-2 h-11 w-full rounded-lg border border-charcoal/15 bg-paper px-3 outline-none focus:border-mint" />
              </label>
              <label className="sm:col-span-2 text-sm font-semibold">
                Email
                <input type="email" value={editAttendeeEmail} onChange={(e) => setEditAttendeeEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="mt-2 h-11 w-full rounded-lg border border-charcoal/15 bg-paper px-3 outline-none focus:border-mint" />
              </label>
              <label className="text-sm font-semibold">
                報名人數
                <input type="number" min={1} max={999} value={editAttendeeCapacity}
                  onChange={(e) => setEditAttendeeCapacity(e.target.value)}
                  onBlur={(e) => {
                    const n = parseInt(e.target.value);
                    setEditAttendeeCapacity(String(isNaN(n) || n < 1 ? 1 : n));
                  }}
                  className="mt-2 h-11 w-full rounded-lg border border-charcoal/15 bg-paper px-3 outline-none focus:border-mint" />
              </label>
              <label className="text-sm font-semibold">
                實際報到人數
                <input type="number" min={0} max={parseInt(editAttendeeCapacity) || 1} value={editAttendeeCount}
                  onChange={(e) => setEditAttendeeCount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="mt-2 h-11 w-full rounded-lg border border-charcoal/15 bg-paper px-3 outline-none focus:border-mint" />
              </label>
              <label className="sm:col-span-2 text-sm font-semibold">
                備註
                <textarea rows={3} value={editAttendeeNote} onChange={(e) => setEditAttendeeNote(e.target.value)}
                  className="mt-2 w-full resize-none rounded-lg border border-charcoal/15 bg-paper p-3 text-sm outline-none focus:border-mint" />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button type="button" onClick={() => setEditingAttendee(null)}
                className="h-10 rounded-lg border border-charcoal/15 px-4 text-sm font-semibold hover:bg-paper">取消</button>
              <button type="button" disabled={isSavingAttendee} onClick={() => void saveAttendeeEdit()}
                className="h-10 rounded-lg bg-orange px-5 text-sm font-bold text-white disabled:opacity-40">
                {isSavingAttendee ? "儲存中…" : "儲存變更"}
              </button>
            </div>
          </div>
        </div>
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
                活動頁面網址
                <input value={editSlug} onChange={(e) => setEditSlug(e.target.value)}
                  className="mt-2 h-11 w-full rounded-lg border border-charcoal/15 bg-paper px-3 outline-none focus:border-mint" />
                <span className="mt-1 block text-xs font-normal text-charcoal/45">修改後原連結將失效</span>
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
            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold">活動內容（一頁式網站）</p>
              <RichEditor value={editContent} onChange={setEditContent} placeholder="活動詳細說明、注意事項…" />
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
              <label className="mt-4 flex cursor-pointer items-start gap-2">
                <input type="checkbox" checked={editOpenRegistration}
                  onChange={(e) => setEditOpenRegistration(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded accent-orange" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold">開放公開報名</p>
                    <div className="group relative inline-flex">
                      <Info size={13} className="text-charcoal/40 cursor-help" />
                      <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-64 -translate-x-1/2 rounded-lg bg-charcoal p-3 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                        <p className="font-semibold mb-1">開啟：公開報名</p>
                        <p className="text-white/80 mb-2">活動頁面會顯示「我要報名」按鈕，任何收到連結的人都能直接報名。</p>
                        <p className="font-semibold mb-1">關閉：純展示頁面</p>
                        <p className="text-white/80">頁面僅供受邀者查看活動資訊，無法自行報名。</p>
                      </div>
                    </div>
                  </div>
                  <p className="mt-0.5 text-xs text-charcoal/55">開啟後，收到連結的人可直接在活動頁面報名</p>
                </div>
              </label>
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
          <div className="w-full max-w-2xl rounded-xl bg-white p-4 shadow-xl sm:p-6" onClick={(e) => e.stopPropagation()}>
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
                <div className="hidden grid-cols-[1fr_1.5fr_1fr] bg-cloud px-4 py-3 text-sm font-bold sm:grid">
                  <span>姓名</span><span>Email</span><span>建立時間</span>
                </div>
                {staffList.map((s) => (
                  <div key={s.id} className="grid gap-3 border-t border-charcoal/10 px-4 py-3 text-sm first:border-t-0 sm:grid-cols-[1fr_1.5fr_1fr] sm:items-center sm:first:border-t">
                    <div className="min-w-0">
                      <span className="mb-0.5 block text-xs font-semibold text-charcoal/45 sm:hidden">姓名</span>
                      <span className="break-words font-semibold">{s.name}</span>
                    </div>
                    <div className="min-w-0">
                      <span className="mb-0.5 block text-xs font-semibold text-charcoal/45 sm:hidden">Email</span>
                      <span className="break-all text-charcoal/70">{s.email}</span>
                    </div>
                    <div className="flex min-w-0 items-center justify-between gap-3">
                      <div className="min-w-0">
                        <span className="mb-0.5 block text-xs font-semibold text-charcoal/45 sm:hidden">建立時間</span>
                        <span className="text-xs text-charcoal/50">{formatDate(s.createdAt)}</span>
                      </div>
                      <button type="button" onClick={() => void removeStaff(s.id)}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-charcoal/40 hover:bg-red-50 hover:text-red-500 transition-colors">
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

    </>
  );
}
