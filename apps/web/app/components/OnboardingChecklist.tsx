"use client";

import { Check, X } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
  eventId: string;
  openRegistration: boolean;
  hasAttendees: boolean;
  hasStaff: boolean;
  hasCheckIns: boolean;
};

/** 新活動的三步引導：讓第一次使用的主辦知道「報名 → 現場 → 報到」要做什麼。全部完成或手動關閉後就不再出現。 */
export function OnboardingChecklist({ eventId, openRegistration, hasAttendees, hasStaff, hasCheckIns }: Props) {
  const storageKey = `monmate.onboarding.${eventId}`;
  const [dismissed, setDismissed] = useState(true); // 先藏起來，讀完設定再決定要不要顯示，避免閃一下

  useEffect(() => {
    try {
      setDismissed(window.localStorage.getItem(storageKey) === "1");
    } catch {
      setDismissed(false);
    }
  }, [storageKey]);

  const steps = [
    {
      done: hasAttendees,
      title: "把名單放進來",
      body: openRegistration
        ? "用上方「活動頁面」的連結或 LINE 分享，讓大家自己報名；也可以在下方報名名單直接新增或匯入 Excel。"
        : "在下方報名名單新增參與者或匯入 Excel，再從每位參與者寄出邀請連結。"
    },
    {
      done: hasStaff || hasCheckIns,
      title: "準備現場報到",
      body: "按上方「現場 QR」下載並貼在入口，來賓可以自己掃碼報到；現場有人協助的話，用「工作人員」新增帳號，他們用手機掃來賓票券就好。（沒有人手協助可略過）"
    },
    {
      done: hasCheckIns,
      title: "活動當天報到",
      body: "報到狀態會即時出現在下方名單，活動後可到「匯出報表」下載出席紀錄。"
    }
  ];

  const allDone = steps.every((s) => s.done);
  if (dismissed || allDone) return null;

  function dismiss() {
    setDismissed(true);
    try {
      window.localStorage.setItem(storageKey, "1");
    } catch {
      /* 無法儲存時只在這次瀏覽隱藏 */
    }
  }

  return (
    <section className="mt-5 rounded-lg border border-mint/40 bg-mint/10 p-4 sm:p-5 print:hidden" aria-label="新手引導">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold">三步完成活動報到</h2>
          <p className="mt-0.5 text-xs text-charcoal/60">完成的步驟會自動打勾</p>
        </div>
        <button type="button" onClick={dismiss} aria-label="關閉引導" className="rounded p-1 text-charcoal/50 hover:bg-white/60">
          <X size={16} />
        </button>
      </div>
      <ol className="mt-3 grid gap-3">
        {steps.map((step, i) => (
          <li key={step.title} className="flex gap-3">
            <span
              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                step.done ? "bg-mint text-charcoal" : "border border-charcoal/25 bg-white text-charcoal/60"
              }`}
            >
              {step.done ? <Check size={14} /> : i + 1}
            </span>
            <div className="min-w-0">
              <p className={`text-sm font-bold ${step.done ? "text-charcoal/50 line-through" : ""}`}>{step.title}</p>
              {!step.done && <p className="mt-0.5 text-xs leading-5 text-charcoal/65">{step.body}</p>}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
