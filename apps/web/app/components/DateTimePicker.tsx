"use client";

import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";

interface Props {
  value: string; // "YYYY-MM-DDTHH:mm" or ""
  onChange: (value: string) => void;
  placeholder?: string;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function parseValue(value: string) {
  if (!value) return null;
  const [datePart, timePart = "00:00"] = value.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  if (!year || !month || !day) return null;
  return { date: new Date(year, month - 1, day), hour: hour ?? 0, minute: minute ?? 0 };
}

function buildValue(date: Date, hour: number, minute: number) {
  const y = date.getFullYear();
  return `${y}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(hour)}:${pad(minute)}`;
}

function formatDisplay(date: Date, hour: number, minute: number) {
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const ampm = hour < 12 ? "上午" : "下午";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${y}/${m}/${d} ${ampm} ${pad(h12)}:${pad(minute)}`;
}

export function DateTimePicker({ value, onChange, placeholder }: Props) {
  const parsed = parseValue(value);
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(parsed?.date);
  const [hour, setHour] = useState(parsed?.hour ?? 10);
  const [minute, setMinute] = useState(parsed?.minute ?? 0);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const p = parseValue(value);
    setSelectedDate(p?.date);
    if (p) { setHour(p.hour); setMinute(p.minute); }
  }, [value]);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  function handleDaySelect(date: Date | undefined) {
    setSelectedDate(date);
    onChange(date ? buildValue(date, hour, minute) : "");
  }

  function handleHour(h: number) {
    setHour(h);
    if (selectedDate) onChange(buildValue(selectedDate, h, minute));
  }

  function handleMinute(m: number) {
    setMinute(m);
    if (selectedDate) onChange(buildValue(selectedDate, hour, m));
  }

  return (
    <div ref={wrapRef} className="relative mt-2">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        className="flex h-11 w-full items-center gap-2.5 rounded-lg border border-charcoal/15 bg-paper px-3 text-sm text-left outline-none focus:border-orange transition-colors hover:border-charcoal/30"
      >
        <Calendar size={15} className="shrink-0 text-charcoal/35" />
        {selectedDate ? (
          <span>{formatDisplay(selectedDate, hour, minute)}</span>
        ) : (
          <span className="text-charcoal/35">{placeholder ?? "選擇日期與時間"}</span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-[300px] rounded-xl border border-charcoal/10 bg-white p-4 shadow-soft">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleDaySelect}
            showOutsideDays
            components={{
              IconLeft: () => <ChevronLeft size={15} />,
              IconRight: () => <ChevronRight size={15} />,
            }}
            classNames={{
              root: "w-full",
              caption: "flex justify-between items-center mb-3",
              caption_label: "text-sm font-bold text-charcoal",
              nav: "flex items-center gap-1",
              nav_button:
                "flex h-7 w-7 items-center justify-center rounded-lg border border-charcoal/15 bg-paper hover:bg-cloud hover:border-charcoal/25 transition-colors text-charcoal/60 hover:text-charcoal",
              nav_button_previous: "",
              nav_button_next: "",
              table: "w-full border-collapse",
              head_row: "",
              head_cell: "w-9 text-[11px] font-semibold text-charcoal/40 text-center pb-1.5",
              tbody: "",
              row: "",
              cell: "p-px text-center",
              day: "h-9 w-9 rounded-lg text-sm font-medium text-charcoal hover:bg-orange/10 hover:text-orange transition-colors w-full",
              day_selected:
                "!bg-orange !text-white hover:!bg-orange/90 hover:!text-white font-bold",
              day_today: "ring-1 ring-orange text-orange font-bold",
              day_outside: "opacity-30",
              day_disabled: "opacity-20 cursor-not-allowed",
              day_range_middle: "rounded-none bg-orange/10",
              day_hidden: "invisible",
            }}
          />

          <div className="mt-3 flex items-center gap-2 border-t border-charcoal/10 pt-3">
            <span className="text-xs font-semibold text-charcoal/50">時間</span>

            <select
              value={hour}
              onChange={(e) => handleHour(Number(e.target.value))}
              className="rounded-md border border-charcoal/15 bg-paper px-2 py-1 text-sm font-bold tabular-nums outline-none focus:border-orange transition-colors"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>{pad(i)}</option>
              ))}
            </select>

            <span className="font-bold text-charcoal/30">:</span>

            <select
              value={minute}
              onChange={(e) => handleMinute(Number(e.target.value))}
              className="rounded-md border border-charcoal/15 bg-paper px-2 py-1 text-sm font-bold tabular-nums outline-none focus:border-orange transition-colors"
            >
              {Array.from({ length: 60 }, (_, i) => (
                <option key={i} value={i}>{pad(i)}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setOpen(false); }}
              className="ml-auto rounded-lg bg-orange px-3 py-1.5 text-xs font-bold text-white hover:bg-orange/90 transition-colors"
            >
              確定
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
