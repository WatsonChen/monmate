"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function DemoVideoTrigger({
  className,
  children
}: {
  className?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>

      {open && mounted &&
        createPortal(
          // Rendered via portal directly under <body> — an ancestor
          // elsewhere on the page (the floating mascot's transform
          // animation) creates its own compositing layer and paints above
          // this modal if it's left nested in the normal component tree.
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/70 p-4 sm:p-8"
            onClick={() => setOpen(false)}
          >
            <div
              className="relative w-full max-w-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="關閉"
                className="absolute -top-11 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 sm:-top-12"
              >
                <X size={20} />
              </button>
              <video
                src="/brand/demo.mp4"
                poster="/brand/demo-poster.png"
                controls
                autoPlay
                playsInline
                className="w-full rounded-lg shadow-soft"
              />
              {/* 影片本身沒有提到計費，所以在影片下方補一行說明 */}
              <p className="mt-3 text-center text-sm leading-6 text-white/90">
                此為示範活動。實際使用時，建立活動免費；報名或匯入名單時每人 1 點，點數可跨活動使用。
                <Link href="/pricing" onClick={() => setOpen(false)} className="ml-1 font-bold text-white underline">
                  查看價格說明
                </Link>
              </p>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
