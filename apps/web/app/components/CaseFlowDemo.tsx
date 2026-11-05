"use client";

import { Check, ClipboardList, DoorOpen, QrCode, Smartphone, User, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// 入口動線示意圖：只呈現案例中「已知」的差別——
// 改用前：與會者排隊，由工作人員在入口逐一核對名單；改用後：與會者自行掃現場 QR Code，工作人員處理例外並引導動線。
// 這是示意，不是實測資料：沒有任何時間或人數數字。

const person = "absolute -translate-x-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-mint text-white shadow-sm sm:h-9 sm:w-9";

export function CaseFlowDemo() {
  const [isAfter, setIsAfter] = useState(false);
  const touched = useRef(false);
  const sceneRef = useRef<HTMLDivElement>(null);

  // 捲到這一區、看完「改用前」幾秒後，自動切到「改用後」一次；使用者自己操作過或要求減少動態就不自動播放
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
        }, 6000);
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
        className="relative mt-4 h-60 overflow-hidden rounded-xl bg-paper sm:h-64"
        role="img"
        aria-label={isAfter ? "改用後：與會者各自用手機掃現場 QR Code 後直接入場，工作人員在一旁處理例外與引導" : "改用前：與會者排成一列，工作人員在入口逐一核對名單"}
      >
        {/* 入口 */}
        <div className="absolute right-3 top-3 flex items-center gap-1.5 text-xs font-medium text-charcoal/50">
          <DoorOpen size={16} aria-hidden="true" />
          入口
        </div>
        <div className="absolute right-0 top-[24%] h-[52%] w-2 rounded-l-full bg-charcoal/15" />

        {isAfter ? (
          <div key="after">
            {/* 現場 QR Code */}
            <div className="absolute left-3 top-1/2 flex -translate-y-1/2 flex-col items-center gap-1.5 sm:left-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-charcoal text-white shadow-soft sm:h-20 sm:w-20">
                <QrCode size={40} aria-hidden="true" />
              </div>
              <span className="text-xs font-semibold text-charcoal/70">現場 QR Code</span>
            </div>

            {/* 三條動線同時進行，每人自己掃、掃完直接入場 */}
            {[22, 50, 78].map((top, lane) => (
              <div key={top}>
                <div className="absolute left-[24%] right-3 border-t border-dashed border-charcoal/10" style={{ top: `${top}%` }} />
                {[0, 1].map((n) => {
                  const delay = `${lane * 0.9 + n * 2.6}s`;
                  return (
                    <span
                      key={n}
                      className={`${person} case-flow-fast`}
                      style={{ top: `${top}%`, left: "44%", animationDelay: delay }}
                    >
                      <User size={18} aria-hidden="true" />
                      <Smartphone size={13} aria-hidden="true" className="absolute -left-2 bottom-0 rounded-sm bg-charcoal p-0.5 text-white" />
                      <span
                        className="case-scan-pop absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange text-white"
                        style={{ animationDelay: delay }}
                      >
                        <Check size={11} strokeWidth={3} aria-hidden="true" />
                      </span>
                    </span>
                  );
                })}
              </div>
            ))}

            {/* 工作人員：只處理例外 */}
            <div className="absolute bottom-3 right-6 flex items-center gap-2">
              <span className="text-xs font-semibold text-charcoal/70">處理例外・引導</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange text-white shadow-sm">
                <UserRound size={18} aria-hidden="true" />
              </span>
            </div>
          </div>
        ) : (
          <div key="before">
            {/* 單一動線，排到核對桌前等待 */}
            <div className="absolute left-3 right-3 top-[56%] border-t border-dashed border-charcoal/10" />

            {/* 核對桌 */}
            <div className="absolute left-[68%] top-[62%] -translate-x-1/2 -translate-y-1/2">
              <div className="flex h-20 w-16 flex-col items-center justify-center gap-1 rounded-xl border border-charcoal/15 bg-white shadow-sm sm:h-24 sm:w-20">
                <ClipboardList size={26} className="text-charcoal/55" aria-hidden="true" />
                <span className="text-xs font-semibold text-charcoal/60">核對名單</span>
              </div>
            </div>
            <span className="absolute left-[68%] top-[17%] flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full bg-orange text-white shadow-sm">
              <UserRound size={18} aria-hidden="true" />
            </span>
            <span className="absolute left-[calc(68%+26px)] top-[17%] flex h-9 items-center text-xs font-semibold text-charcoal/70">逐一核對</span>

            {/* 排隊等待的人（固定在桌前），與一個個走過桌子的人 */}
            {[41, 28, 15].map((left) => (
              <span key={left} className={`${person} opacity-80`} style={{ top: "56%", left: `${left}%` }}>
                <User size={18} aria-hidden="true" />
              </span>
            ))}
            <span className={`${person} case-flow-slow`} style={{ top: "56%", left: "54%" }}>
              <User size={18} aria-hidden="true" />
            </span>
            <span className="absolute bottom-3 left-4 text-xs text-charcoal/50">後面的人等待</span>
          </div>
        )}
      </div>

      <p key={String(isAfter)} className="swap-in mt-3 min-h-[3.5rem] text-[15px] leading-7 text-charcoal/80" aria-live="polite">
        {isAfter
          ? "與會者用手機掃現場張貼的 QR Code 自助報到，不必排成一列；工作人員只處理例外狀況，並引導動線。"
          : "每位與會者都在入口排隊，由承辦人與工作人員逐一核對名單。"}
      </p>
    </div>
  );
}
