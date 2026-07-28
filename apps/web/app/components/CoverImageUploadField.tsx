"use client";

import { ImagePlus, Loader2, Lock, X } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { IMAGE_UPLOAD_ACCEPT, uploadImage } from "../lib/api";

export function CoverImageUploadField({
  value,
  onChange,
  token,
  unlocked = true,
  unlockControl
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  token: string;
  /** BRANDING feature gate — defaults to true so existing callers keep working unchanged. */
  unlocked?: boolean;
  /** FeatureUnlockControl to show when locked; omit (e.g. during event creation, before an eventId exists) to show a plain note instead. */
  unlockControl?: ReactNode;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError("");
    setIsUploading(true);
    const res = await uploadImage(file, token);
    setIsUploading(false);
    if (!res.success || !res.data) {
      setError(res.error?.message ?? "上傳失敗");
      return;
    }
    onChange(res.data.url);
  }

  return (
    <div>
      <div className="flex items-center gap-1.5">
        <p className="text-sm font-semibold">活動頂部大圖（選填）</p>
        {!unlocked && (unlockControl ?? (
          <span className="inline-flex items-center gap-1 rounded-full bg-charcoal/10 px-2 py-0.5 text-[11px] font-semibold text-charcoal/50">
            <Lock size={11} />
            建立活動後可解鎖
          </span>
        ))}
      </div>
      <p className="mt-0.5 text-xs text-charcoal/45">
        會顯示在活動頁面最上方，取代預設的示意圖；PNG / JPG / WebP，檔案大小上限 2MB，建議寬圖（例如 1600×600）
      </p>
      {unlocked ? (
        <div className="mt-2">
          {value ? (
            <div className="relative h-28 w-full overflow-hidden rounded-lg border border-charcoal/15 bg-paper">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value} alt="活動頂部大圖" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onChange(null)}
                title="移除圖片"
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-charcoal/70 text-white hover:bg-charcoal"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <div className="flex h-28 w-full items-center justify-center rounded-lg border border-dashed border-charcoal/20 bg-paper text-charcoal/30">
              <ImagePlus size={24} />
            </div>
          )}
          <div className="mt-2">
            <input
              ref={inputRef}
              type="file"
              accept={IMAGE_UPLOAD_ACCEPT}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFile(file);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              disabled={isUploading}
              onClick={() => inputRef.current?.click()}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-charcoal/15 px-3 text-xs font-semibold hover:bg-paper disabled:opacity-50"
            >
              {isUploading ? <Loader2 size={13} className="animate-spin" /> : <ImagePlus size={13} />}
              {isUploading ? "上傳中…" : value ? "更換圖片" : "上傳圖片"}
            </button>
            {error && <p className="mt-1 text-xs font-semibold text-red-500">{error}</p>}
          </div>
        </div>
      ) : (
        <div className="mt-2 flex h-28 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-charcoal/15 bg-charcoal/5 text-charcoal/25">
          <Lock size={20} />
          <p className="text-xs text-charcoal/45">解鎖品牌客製化後才能上傳</p>
        </div>
      )}
    </div>
  );
}
