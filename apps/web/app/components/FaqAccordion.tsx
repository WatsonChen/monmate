"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

export function FaqAccordion({ items }: { items: [string, string][] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-charcoal/10 overflow-hidden rounded-lg border border-charcoal/10 bg-white">
      {items.map(([question, answer], index) => {
        const isOpen = openIndex === index;
        return (
          <div key={question}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="text-sm font-bold">{question}</span>
              <ChevronDown
                size={18}
                className={`shrink-0 text-charcoal/40 transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            <div
              className="grid transition-[grid-template-rows] duration-300 ease-out"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-4 text-sm leading-6 text-charcoal/65">{answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
