"use client";

import type { ReactNode } from "react";
import { Fragment, useEffect, useRef, useState } from "react";

type StageFeature = {
  title: string;
  text: string;
  icon: ReactNode;
  preview?: ReactNode;
};

type Stage = {
  stage: string;
  items: StageFeature[];
};

const STICKY_OFFSET_PX = 96; // matches top-24, desktop sticky panels
const ACTIVE_STAGE_THRESHOLD_PX = STICKY_OFFSET_PX * 2;
const MOBILE_HEADER_PX = 64; // matches site header h-16
const MOBILE_BAR_PX = 44; // height of each collapsed mobile bar

export function StageStack({ stages }: { stages: Stage[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const railContentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let ticking = false;

    function updateActiveIndex() {
      ticking = false;
      let current = 0;
      panelRefs.current.forEach((el, index) => {
        if (!el) return;
        if (el.getBoundingClientRect().top <= ACTIVE_STAGE_THRESHOLD_PX) {
          current = index;
        }
      });

      const lastPanel = panelRefs.current[stages.length - 1];
      if (lastPanel && railContentRef.current) {
        const exitOffset = Math.min(
          0,
          lastPanel.getBoundingClientRect().top - STICKY_OFFSET_PX,
        );
        railContentRef.current.style.transform = `translate3d(0, ${exitOffset}px, 0)`;
      }

      setActiveIndex(current);
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateActiveIndex);
    }

    const initialFrame = requestAnimationFrame(updateActiveIndex);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(initialFrame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [stages]);

  return (
    <>
      {/* Desktop: side tab rail + cards that stack and cover each other */}
      <div className="hidden lg:flex lg:items-start lg:gap-8">
        <div className="lg:sticky lg:top-24 lg:w-10 lg:shrink-0 lg:self-start">
          <div
            ref={railContentRef}
            className="flex flex-col items-center gap-8 pt-2 will-change-transform"
          >
            {stages.map((s, index) => (
              <div
                key={s.stage}
                className={`flex items-center gap-2 [writing-mode:vertical-rl] text-sm font-bold tracking-wide transition-colors duration-300 ${
                  index === activeIndex ? "text-orange" : "text-charcoal/25"
                }`}
              >
                <span className="text-xs">{String(index + 1).padStart(2, "0")}</span>
                {s.stage}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1">
          {stages.map((s, index) => (
            <div
              key={s.stage}
              ref={(el) => {
                panelRefs.current[index] = el;
              }}
              className="sticky top-24 min-h-[clamp(680px,80svh,900px)] pt-6"
              style={{ zIndex: index + 1 }}
            >
              <div className="relative isolate overflow-hidden rounded-2xl border border-charcoal/10 bg-paper p-10 shadow-soft">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-6 top-4 text-8xl font-black text-charcoal/[0.04]"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="relative text-sm font-bold text-orange">{s.stage}</p>
                <div className="relative mt-6 grid gap-4 sm:grid-cols-2">
                  {s.items.map((item) => (
                    <FeatureCard key={item.title} item={item} />
                  ))}
                </div>
              </div>
            </div>
          ))}
          <div aria-hidden="true" className="h-[clamp(180px,24svh,260px)]" />
        </div>
      </div>

      {/* Mobile/tablet: collapsed stage bars cascade and stack at the top,
          current stage's full content shows below them */}
      <div className="lg:hidden">
        {stages.map((s, index) => (
          <Fragment key={s.stage}>
            <div
              className="sticky z-10 flex items-center gap-2 border-b border-charcoal/10 bg-paper/95 px-1 backdrop-blur"
              style={{ top: MOBILE_HEADER_PX + index * MOBILE_BAR_PX, height: MOBILE_BAR_PX }}
            >
              <span className="text-xs font-bold text-orange">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-sm font-bold">{s.stage}</span>
            </div>
            <div className="bg-paper py-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {s.items.map((item) => (
                  <FeatureCard key={item.title} item={item} />
                ))}
              </div>
            </div>
          </Fragment>
        ))}
      </div>
    </>
  );
}

function FeatureCard({ item }: { item: StageFeature }) {
  return (
    <div className="h-full rounded-lg border border-charcoal/10 bg-white p-5">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-mint/20">
        {item.icon}
      </span>
      <h3 className="mt-4 text-base font-bold">{item.title}</h3>
      <p className="mt-2 text-sm leading-6 text-charcoal/65">{item.text}</p>
      {item.preview && <div className="mt-4">{item.preview}</div>}
    </div>
  );
}
