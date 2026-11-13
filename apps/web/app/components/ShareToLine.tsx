"use client";

import { Send } from "lucide-react";

type Props = {
  /** 要分享的完整網址 */
  url: string;
  /** 連結前面的說明文字，例如活動名稱 */
  text: string;
  label?: string;
  className?: string;
  /** 只顯示 LINE 圖示（用在連結旁，與「開新分頁」「複製」同一排的灰色小圖示） */
  iconOnly?: boolean;
};

const defaultClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#06C755] px-4 text-sm font-bold text-white hover:brightness-95";

/** 開啟 LINE 的分享畫面：手機直接叫出 LINE App，電腦開 LINE 官方分享頁。 */
export function ShareToLine({ url, text, label = "分享到 LINE", className, iconOnly }: Props) {
  function share() {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const target = isMobile
      ? `https://line.me/R/share?text=${encodeURIComponent(`${text}\n${url}`)}`
      : `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(target, "_blank", "noopener,noreferrer");
  }

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={share}
        title={label}
        aria-label={label}
        className={className ?? "shrink-0 text-charcoal/40 hover:text-[#06C755]"}
      >
        <LineIcon size={16} />
      </button>
    );
  }

  return (
    <button type="button" onClick={share} className={className ?? defaultClass}>
      <Send size={15} />
      {label}
    </button>
  );
}

/** LINE 對話框圖示（單色，顏色跟著文字色走） */
export function LineIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 5.58 2 10c0 3.95 3.56 7.26 8.37 7.89.33.07.77.22.88.5.1.25.07.65.03.9l-.14.85c-.04.25-.2.99.87.54 1.07-.45 5.78-3.4 7.89-5.83C21.3 13.2 22 11.67 22 10c0-4.42-4.48-8-10-8zM8.1 12.55H6.1a.45.45 0 0 1-.45-.45V8.4a.45.45 0 0 1 .9 0v3.25h1.55a.45.45 0 0 1 0 .9zm2.1-.45a.45.45 0 0 1-.9 0V8.4a.45.45 0 0 1 .9 0v3.7zm4.9 0a.45.45 0 0 1-.8.28l-1.9-2.58v2.3a.45.45 0 0 1-.9 0V8.4a.45.45 0 0 1 .8-.28l1.9 2.58V8.4a.45.45 0 0 1 .9 0v3.7zm3-2.37a.45.45 0 0 1 0 .9h-1.1v.72h1.1a.45.45 0 0 1 0 .9h-1.55a.45.45 0 0 1-.45-.45V8.4c0-.25.2-.45.45-.45h1.55a.45.45 0 0 1 0 .9h-1.1v.88h1.1z" />
    </svg>
  );
}
