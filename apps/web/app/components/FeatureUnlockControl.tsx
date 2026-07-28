"use client";

import { useState } from "react";
import { Lock, Loader2, Sparkles } from "lucide-react";
import type { EventDTO, FeatureUnlockKey } from "@monmate/types";
import { FEATURE_UNLOCK_COSTS } from "@monmate/types";
import { unlockFeature } from "../lib/api";

const FEATURE_COPY: Record<FeatureUnlockKey, { title: string; description: string }> = {
  BRANDING: {
    title: "品牌客製化",
    description: "上傳專屬 Logo、置換頂部大圖，並隱藏頁尾與 QR Code 上的 MonMate 標示。不解鎖也能正常使用，解鎖後這場活動對外看起來完全是你自己的品牌。"
  }
};

export function FeatureUnlockControl({
  eventId,
  feature,
  token,
  onUnlocked
}: {
  eventId: string;
  feature: FeatureUnlockKey;
  token: string;
  onUnlocked: (event: EventDTO) => void;
}) {
  const [open, setOpen] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [error, setError] = useState("");
  const copy = FEATURE_COPY[feature];
  const cost = FEATURE_UNLOCK_COSTS[feature];

  async function handleUnlock() {
    setIsUnlocking(true);
    setError("");
    const res = await unlockFeature(eventId, feature, token);
    setIsUnlocking(false);
    if (!res.success || !res.data) {
      setError(res.error?.message ?? "解鎖失敗，請稍後再試");
      return;
    }
    setOpen(false);
    window.dispatchEvent(new CustomEvent("credits-changed"));
    onUnlocked(res.data);
  }

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 rounded-full bg-orange/10 px-2 py-0.5 text-[11px] font-semibold text-orange"
      >
        <Lock size={11} />
        未解鎖
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 w-72 rounded-lg bg-charcoal p-3 text-xs text-white shadow-lg">
          <p className="text-sm font-bold">{copy.title}</p>
          <p className="mt-1 leading-relaxed text-white/75">{copy.description}</p>
          {error && <p className="mt-2 font-semibold text-orange">{error}</p>}
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              disabled={isUnlocking}
              onClick={() => void handleUnlock()}
              className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md bg-orange text-xs font-bold text-white disabled:opacity-50"
            >
              {isUnlocking ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              {isUnlocking ? "解鎖中…" : `解鎖（${cost} 點）`}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="h-8 rounded-md px-2 text-xs font-semibold text-white/60 hover:text-white"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </span>
  );
}
