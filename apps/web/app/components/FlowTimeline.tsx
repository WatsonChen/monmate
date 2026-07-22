"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

type FlowStep = {
  title: string;
  text: string;
  icon: ReactNode;
};

const STEP_DELAY_MS = 220;

export function FlowTimeline({ steps }: { steps: FlowStep[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -60px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const lineDuration = 700 + (steps.length - 1) * STEP_DELAY_MS;

  return (
    <div ref={ref}>
      {/* connecting line + step markers */}
      <div className="relative mb-3 hidden h-8 lg:block">
        <div className="absolute inset-x-4 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-charcoal/10" />
        <div
          className="absolute left-4 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-orange to-mint transition-[width] ease-out"
          style={{
            width: visible ? "calc(100% - 2rem)" : "0%",
            transitionDuration: `${lineDuration}ms`,
          }}
        />
        <div className="absolute inset-x-4 top-1/2 flex -translate-y-1/2 justify-between">
          {steps.map((step, index) => (
            <span
              key={step.title}
              className={`h-3 w-3 rounded-full border-2 border-white ring-2 transition-colors duration-300 ${
                visible ? "bg-orange ring-orange" : "bg-white ring-charcoal/15"
              }`}
              style={{ transitionDelay: visible ? `${index * STEP_DELAY_MS}ms` : "0ms" }}
            />
          ))}
        </div>
      </div>

      {/* step cards, revealed in the same sequence as the line/markers */}
      <div className="grid gap-3 lg:grid-cols-5">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className={`rounded-lg border border-charcoal/10 bg-white p-5 transition-all duration-500 ease-out ${
              visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
            }`}
            style={{ transitionDelay: visible ? `${index * STEP_DELAY_MS}ms` : "0ms" }}
          >
            <div className="flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-mint/15">
                {step.icon}
              </span>
              <span className="text-xs font-bold text-charcoal/35">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <h3 className="mt-4 text-base font-bold">{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-charcoal/65">{step.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
