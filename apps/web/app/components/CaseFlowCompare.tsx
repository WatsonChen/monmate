"use client";

import { useCallback, useRef, useState } from "react";
import { ArrowLeftRight, Check, ClipboardList, DoorOpen, LogIn, QrCode, Smartphone, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// 入口流程對照：只呈現案例中「已知」的差別，不放任何時間或人數數字。
// 改用前：工作人員在入口逐一核對名單；改用後：與會者自行掃現場 QR Code，工作人員處理例外並引導動線。
// 兩層內容疊在同一位置，拖曳中間的拉桿即可左右比對。

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

function Flow({ tone, steps, staff }: { tone: "muted" | "brand"; steps: Step[]; staff: string }) {
  const brand = tone === "brand";
  return (
    <div className="mx-auto max-w-lg px-6 pb-8 pt-20 sm:px-8">
      <ol>
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
      <div className="mt-6 flex items-start gap-3 border-t border-charcoal/10 pt-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange text-white">
          <UserRound size={16} aria-hidden="true" />
        </span>
        <p className="text-sm leading-6 text-charcoal/80">
          <span className="font-semibold">工作人員：</span>
          {staff}
        </p>
      </div>
    </div>
  );
}

export function CaseFlowCompare() {
  const [pos, setPos] = useState(50);
  const [touched, setTouched] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const move = useCallback((clientX: number) => {
    const el = box.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
    setTouched(true);
  }, []);

  return (
    <div>
      <div
        ref={box}
        className="relative cursor-ew-resize select-none overflow-hidden rounded-2xl border border-charcoal/10 bg-white"
        style={{ touchAction: "pan-y" }}
        onPointerDown={(e) => {
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          move(e.clientX);
        }}
        onPointerMove={(e) => dragging.current && move(e.clientX)}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => (dragging.current = false)}
      >
        {/* 改用前（底層） */}
        <Flow tone="muted" steps={before} staff="負責核對每一位與會者。" />

        {/* 改用後（上層，從拉桿位置往右顯示） */}
        <div
          className="absolute inset-0 bg-white"
          style={{ clipPath: `inset(0 0 0 ${pos}%)` }}
          aria-hidden={pos > 95 ? "true" : undefined}
        >
          <div className="absolute inset-0 bg-mint/10" />
          <div className="relative">
            <Flow tone="brand" steps={after} staff="只處理例外狀況，並引導動線。" />
          </div>
        </div>

        {/* 固定標籤 */}
        <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-cloud px-3 py-1 text-sm font-bold text-charcoal/70">
          改用前
        </span>
        <span className="pointer-events-none absolute right-4 top-4 rounded-full bg-orange px-3 py-1 text-sm font-bold text-white">
          改用後
        </span>

        {/* 拉桿 */}
        <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-orange" style={{ left: `${pos}%` }}>
          <button
            type="button"
            role="slider"
            aria-label="拖曳比較改用前與改用後"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(pos)}
            className="pointer-events-auto absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-orange text-white shadow-lg ring-4 ring-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - 5));
              else if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + 5));
              else return;
              setTouched(true);
              e.preventDefault();
            }}
          >
            <ArrowLeftRight size={20} aria-hidden="true" />
          </button>
        </div>
      </div>
      <p className="mt-3 text-xs text-charcoal/50">
        {touched ? "" : "左右拖曳中間的拉桿，比較改用前後的差別。"}
        流程示意，非實際數據。
      </p>
    </div>
  );
}
