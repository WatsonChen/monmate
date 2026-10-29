import type { Metadata } from "next";
import "./globals.css";
import { MarketingAnalytics } from "./components/MarketingAnalytics";
import { Providers } from "./components/Providers";

const siteName = "MonMate 活動報到系統";
const siteDescription =
  "MonMate 是活動報到系統：建立活動、開放線上報名或匯入名單，現場用手機掃 QR Code、輸入序號或查電話即可報到，並提供報到率數據、報表匯出與問卷。講座、課程、品牌活動、展會都適用。";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.monmate.tw"),
  title: {
    default: "MonMate 活動報到系統｜QR Code 報到、線上報名、名單管理",
    template: "%s｜MonMate 活動報到系統"
  },
  description: siteDescription,
  applicationName: "MonMate",
  keywords: [
    "MonMate",
    "活動報到系統",
    "QR Code 報到",
    "線上報名系統",
    "活動報名",
    "報到名單管理",
    "講座報到",
    "展會報到"
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "zh_TW",
    siteName,
    title: "MonMate 活動報到系統｜QR Code 報到、線上報名、名單管理",
    description: siteDescription,
    url: "/",
    images: [{ url: "/brand/logo-slogan.png", alt: "MonMate 活動報到系統" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "MonMate 活動報到系統",
    description: siteDescription,
    images: ["/brand/logo-slogan.png"]
  }
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body>
        <Providers>{children}</Providers>
        <MarketingAnalytics />
      </body>
    </html>
  );
}
