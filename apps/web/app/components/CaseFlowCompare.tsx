import { Check, ClipboardList, DoorOpen, LogIn, QrCode, Smartphone, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// 入口流程對照：只呈現案例中「已知」的差別，不放任何時間或人數數字。
// 改用前：工作人員在入口逐一核對名單；改用後：與會者自行掃現場 QR Code，工作人員處理例外並引導動線。

type Step = { icon: LucideIcon; title: string; note: string };

const before: Step[] = [
  { icon: DoorOpen, title: "到入口", note: "與會者來到活動入口" },
  { icon: ClipboardList, title: "逐一核對名單", note: "承辦人與工作人員在入口人工核對" },
  { icon: LogIn, title: "入場", note: "核對後入場" },
];

const after: Step[] = [
  { icon: QrCode, title: "看到現場 QR Code", note: "張貼在活動現場" },
  { icon: Smartphone, title: "用手機自行掃描", note: "與會者自助完成報到" },
  { icon: Check, title: "直接入場", note: "報到完成即可進場" },
];

function Flow({
  label,
  tone,
  steps,
  staff,
}: {
  label: string;
  tone: "muted" | "brand";
  steps: Step[];
  staff: string;
}) {
  const brand = tone === "brand";
  return (
    <section
      aria-label={label}
      className={`rounded-2xl border p-5 sm:p-6 ${brand ? "border-mint/40 bg-mint/10" : "border-charcoal/10 bg-white"}`}
    >
      <p
        className={`inline-block rounded-full px-3 py-1 text-sm font-bold ${
          brand ? "bg-orange text-white" : "bg-cloud text-charcoal/70"
        }`}
      >
        {label}
      </p>

      <ol className="mt-5">
        {steps.map(({ icon: Icon, title, note }, i) => (
          <li key={title} className="relative flex gap-4 pb-6 last:pb-0">
            {i < steps.length - 1 && (
              <span aria-hidden="true" className="absolute left-5 top-11 h-[calc(100%-2.75rem)] w-px bg-charcoal/15" />
            )}
            <span
              className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                brand ? "bg-mint text-white" : "bg-charcoal/10 text-charcoal/60"
              }`}
            >
              <Icon size={20} aria-hidden="true" />
            </span>
            <div className="min-w-0 pt-0.5">
              <p className="text-base font-semibold leading-6">
                <span className="mr-1.5 text-charcoal/40">{i + 1}.</span>
                {title}
              </p>
              <p className="mt-0.5 text-sm leading-6 text-charcoal/65">{note}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-5 flex items-start gap-3 border-t border-charcoal/10 pt-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange text-white">
          <UserRound size={16} aria-hidden="true" />
        </span>
        <p className="text-sm leading-6 text-charcoal/80">
          <span className="font-semibold">工作人員：</span>
          {staff}
        </p>
      </div>
    </section>
  );
}

export function CaseFlowCompare() {
  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-6">
        <Flow label="改用前" tone="muted" steps={before} staff="負責核對每一位與會者。" />
        <Flow label="改用後" tone="brand" steps={after} staff="只處理例外狀況，並引導動線。" />
      </div>
      <p className="mt-3 text-xs text-charcoal/50">流程示意，非實際數據。</p>
    </div>
  );
}
