import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MonMate",
  description: "活動報到的神隊友"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
