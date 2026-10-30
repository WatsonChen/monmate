"use client";

import { QrCode } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// 入口動線示意圖：只呈現案例中「已知」的差別——
// 改用前：與會者排隊，由工作人員在入口逐一核對；改用後：與會者自行掃現場 QR Code，工作人員處理例外並引導動線。
// 這是示意，不是實測資料：沒有任何時間或人數數字。
const PEOPLE = 8;

const before = Array.from({ length: PEOPLE }, (_, i) => ({ left: 7 + i * 7.2, top: 52 }));
const after = Array.from({ length: PEOPLE }, (_, i) => ({ left: 34 + (i % 4) * 13, top: i < 4 ? 38 : 66 }));
const staffBefore = [
  { left: 76, top: 40 },
  { left: 76, top: 64 },
];
const staffAfter = [
  { left: 56, top: 14 },
  { left: 78, top: 86 },
];

export function CaseFlowDemo() {
  const [isAfter, setIsAfter] = useState(false);
  const touched = useRef(false);
  const sceneRef = useRef<HTMLDivElement>(null);

  // 捲到這一區時，自動從「改用前」切到「改用後」一次，吸引注意；使用者自己操作過或要求減少動態就不自動播放
  useEffect(() => {
    const node = sceneRef.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer: ReturnType<typeof setTimeout>;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        timer = setTimeout(() => {
          if (!touched.current) setIsAfter(true);
        }, 1000);
      },
      { threshold: 0.6 }
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  const choose = (next: boolean) => {
    touched.current = true;
    setIsAfter(next);
  };

  const move = (pos: { left: number; top: number }, i: number): React.CSSProperties => ({
    left: `${pos.left}%`,
    top: `${pos.top}%`,
    transitionDelay: `${i * 45}ms`,
  });
  const dot = "absolute h-4 w-4 sm:h-5 sm:w-5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-[left,top] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none";

  return (
    <div className="rounded-2xl border border-charcoal/10 bg-white p-4 shadow-soft sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="切換入口情境" className="inline-flex rounded-full bg-cloud p-1">
          {[
            { label: "改用前", value: false },
            { label: "改用後", value: true },
          ].map((tab) => (
            <button
              key={tab.label}
              type="button"
              aria-pressed={isAfter === tab.value}
              onClick={() => choose(tab.value)}
              className={`h-9 rounded-full px-5 text-sm font-semibold transition-colors motion-reduce:transition-none ${
                isAfter === tab.value ? "bg-orange text-white" : "text-charcoal/60 hover:text-charcoal"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-charcoal/50">示意圖，非實際數據</p>
      </div>

      <div
        ref={sceneRef}
        className="relative mt-4 h-52 overflow-hidden rounded-xl bg-paper sm:h-60"
        role="img"
        aria-label={isAfter ? "改用後：與會者分散掃描現場 QR Code 入場，工作人員在一旁處理例外與引導" : "改用前：與會者排成一列，工作人員在入口逐一核對名單"}
      >
        {/* 入口 */}
        <div className="absolute right-0 top-[22%] flex h-[56%] w-3 items-center rounded-l-full bg-charcoal/15" />
        <span className="absolute right-4 top-2 text-xs text-charcoal/40">入口</span>

        {/* 核對桌（改用前） */}
        <div
          className={`absolute left-[69%] top-[30%] flex h-[40%] w-[11%] min-w-[44px] items-center justify-center rounded-lg border border-charcoal/15 bg-white text-xs font-semibold text-charcoal/50 transition-opacity duration-500 motion-reduce:transition-none ${isAfter ? "opacity-0" : "opacity-100"}`}
        >
          核對
        </div>

        {/* 現場 QR Code（改用後） */}
        <div
          className={`absolute left-[17%] top-[52%] flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg bg-charcoal text-white transition-[opacity,transform] duration-500 motion-reduce:transition-none ${isAfter ? "scale-100 opacity-100" : "scale-75 opacity-0"}`}
        >
          <QrCode size={26} aria-hidden="true" />
        </div>

        {(isAfter ? after : before).map((pos, i) => (
          <span key={`p${i}`} className={`${dot} bg-mint`} style={move(pos, i)} />
        ))}
        {(isAfter ? staffAfter : staffBefore).map((pos, i) => (
          <span key={`s${i}`} className={`${dot} bg-orange`} style={move(pos, i)} />
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-charcoal/60">
        <span><span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full bg-mint align-middle" />與會者</span>
        <span><span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full bg-orange align-middle" />工作人員</span>
      </div>

      <p key={String(isAfter)} className="swap-in mt-3 min-h-[3.5rem] text-[15px] leading-7 text-charcoal/80" aria-live="polite">
        {isAfter
          ? "與會者掃現場張貼的 QR Code 自助報到；工作人員只處理例外狀況，並引導動線。"
          : "每位與會者都在入口排隊，由承辦人與工作人員逐一核對名單。"}
      </p>
    </div>
  );
}
