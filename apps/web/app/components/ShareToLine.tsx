"use client";

import { Send } from "lucide-react";

type Props = {
  /** 要分享的完整網址 */
  url: string;
  /** 連結前面的說明文字，例如活動名稱 */
  text: string;
  label?: string;
  className?: string;
};

const defaultClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#06C755] px-4 text-sm font-bold text-white hover:brightness-95";

/** 開啟 LINE 的分享畫面：手機直接叫出 LINE App，電腦開 LINE 官方分享頁。 */
export function ShareToLine({ url, text, label = "分享到 LINE", className }: Props) {
  function share() {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const target = isMobile
      ? `https://line.me/R/share?text=${encodeURIComponent(`${text}\n${url}`)}`
      : `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(target, "_blank", "noopener,noreferrer");
  }

  return (
    <button type="button" onClick={share} className={className ?? defaultClass}>
      <Send size={15} />
      {label}
    </button>
  );
}
