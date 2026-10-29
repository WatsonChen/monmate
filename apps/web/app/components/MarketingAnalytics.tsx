"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useState } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-NC9BVMGFV7";
// 只在正式網域載入，本機與 Vercel 預覽網址的流量不會污染資料
const PRODUCTION_HOSTS = new Set(["www.monmate.tw", "monmate.tw"]);

// 只追蹤公開的行銷頁面。後台、工作人員、報到、票券、問卷等頁面的網址帶有個人 token，
// 一律不載入、不送出，避免憑證被傳到第三方。
const TRACKED_EXACT = new Set(["/", "/pricing", "/privacy", "/refund"]);
const TRACKED_PREFIXES = ["/scenarios/", "/cases/"];

function isTrackedPath(pathname: string | null) {
  if (!pathname) return false;
  return TRACKED_EXACT.has(pathname) || TRACKED_PREFIXES.some((p) => pathname.startsWith(p));
}

type Gtag = (...args: unknown[]) => void;

export function MarketingAnalytics() {
  const pathname = usePathname();
  const [onProductionHost, setOnProductionHost] = useState(false);
  useEffect(() => setOnProductionHost(PRODUCTION_HOSTS.has(window.location.hostname)), []);
  const tracked = onProductionHost && isTrackedPath(pathname);

  useEffect(() => {
    if (!tracked) return;
    const gtag = (window as unknown as { gtag?: Gtag }).gtag;
    // 手動送 page_view，只帶路徑，不帶 query 與 hash
    gtag?.("event", "page_view", {
      page_path: pathname,
      page_location: `${window.location.origin}${pathname}`,
      page_title: document.title
    });
  }, [tracked, pathname]);

  if (!tracked) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${GA_ID}', { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false });`}
      </Script>
    </>
  );
}
