import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./components/Providers";

export const metadata: Metadata = {
  title: "MonMate",
  description: "活動報到的神隊友"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
