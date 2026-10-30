import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(appRoot, "../..");

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@monmate/types", "@monmate/config"],
  async headers() {
    const noindex = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];
    // 全站共通的安全標頭。刻意不加 CSP 的 script／connect 限制與 COOP：
    // Google 登入、GA、藍新付款表單都需要跨網域，貿然限制會讓登入或付款壞掉。
    const security = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      // 不允許被其他網站用 iframe 嵌入，避免點擊劫持（後台、報到、付款頁都是敏感操作）
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
      // 工作人員掃碼只需要本站的攝影機；麥克風、定位、付款 API 用不到，一律關閉
      { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(), payment=()" }
    ];
    return [
      { source: "/:path*", headers: security },
      { source: "/admin/:path*", headers: noindex },
      { source: "/staff/:path*", headers: noindex },
      { source: "/checkin", headers: noindex },
      { source: "/event/:slug/checkin", headers: noindex },
      { source: "/event/:slug/ticket", headers: noindex },
      { source: "/event/:slug/survey", headers: noindex }
    ];
  },
  turbopack: {
    root: repoRoot
  }
};

export default nextConfig;
