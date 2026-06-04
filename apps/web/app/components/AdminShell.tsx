"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart2,
  ClipboardCheck,
  CreditCard,
  Download,
  FileSpreadsheet,
  Home,
  ListChecks,
  LogOut,
  QrCode,
  Send,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { BrandLogo } from "./BrandLogo";
import { apiFetch } from "../lib/api";
import type { UserDTO } from "@monmate/types";

const navItems = [
  { label: "總覽", icon: Home, href: "/admin" },
  { label: "活動列表", icon: ListChecks, href: "/admin/events" },
  { label: "匯入名單", icon: FileSpreadsheet, href: "/admin/import" },
  { label: "邀請簡訊", icon: Send, href: "/admin/invite" },
  { label: "活動問卷", icon: ClipboardCheck, href: "/admin/survey" },
  { label: "數據分析", icon: BarChart2, href: "/admin/analytics" },
  { label: "匯出報表", icon: Download, href: "/admin/export" },
  { label: "工作人員掃描", icon: QrCode, href: "/staff/scan" },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    const token = window.localStorage.getItem("monmate.token");
    if (!token) return;
    void apiFetch<UserDTO>("/auth/me", { token }).then((res) => {
      if (res.success && res.data) setCredits(res.data.attendeeCredits);
    });
  }, []);

  function logout() {
    window.localStorage.removeItem("monmate.token");
    router.push("/admin/login");
  }

  return (
    <main className="min-h-dvh bg-paper text-charcoal">
      <div className="md:grid md:min-h-dvh md:grid-cols-[248px_minmax(0,1fr)]">
        <aside className="hidden border-r border-charcoal/10 bg-white md:sticky md:top-0 md:flex md:h-dvh md:flex-col">
          <div className="px-5 py-5">
            <BrandLogo
              variant="horizontal"
              className="h-16 w-44 object-contain object-left"
            />
            {credits !== null && (
              <Link
                href="/admin/billing"
                className="mt-3 flex h-10 items-center justify-between rounded-lg bg-orange px-3 text-sm font-bold text-white hover:bg-orange/90 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <CreditCard size={15} />
                  <span>人次額度</span>
                </div>
                <span className="rounded-full bg-white/25 px-2.5 py-0.5 text-xs font-bold">
                  {credits}
                </span>
              </Link>
            )}
          </div>
          <nav className="flex-1 px-3">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`mt-1 flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-bold ${
                    active
                      ? "bg-mint/25 text-charcoal"
                      : "text-charcoal/65 hover:bg-paper hover:text-charcoal"
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-charcoal/10 p-4 space-y-2">
            <Link
              href="/admin/billing"
              className={`flex h-10 w-full items-center gap-2 rounded-lg px-3 text-sm font-bold transition-colors ${
                isActive(pathname, "/admin/billing")
                  ? "bg-orange/15 text-orange"
                  : "text-charcoal/65 hover:bg-paper hover:text-charcoal"
              }`}
            >
              <CreditCard size={16} />
              儲值 / 購買額度
            </Link>
            <button
              type="button"
              onClick={logout}
              className="flex h-10 w-full items-center gap-2 rounded-lg px-3 text-sm font-semibold text-charcoal/55 hover:bg-paper hover:text-charcoal"
            >
              <LogOut size={16} />
              登出
            </button>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-charcoal/10 bg-white/95 backdrop-blur md:hidden">
            <div className="flex h-16 items-center justify-between px-4">
              <BrandLogo
                variant="horizontal"
                className="h-14 w-40 object-contain object-left"
              />
              <div className="flex items-center gap-2">
                {credits !== null && (
                  <Link
                    href="/admin/billing"
                    className="flex h-9 items-center gap-1.5 rounded-lg border border-orange/20 bg-orange/10 px-3 text-xs font-bold text-orange"
                  >
                    <CreditCard size={13} />
                    {credits} 人次
                  </Link>
                )}
                <button
                  type="button"
                  onClick={logout}
                  className="flex h-10 items-center gap-2 rounded-lg border border-charcoal/15 px-3 text-sm font-bold"
                >
                  <LogOut size={16} />
                  登出
                </button>
              </div>
            </div>
            <nav className="flex gap-2 overflow-x-auto px-4 pb-3">
              {navItems.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-bold ${
                      active
                        ? "bg-mint/30 text-charcoal"
                        : "bg-paper text-charcoal/65"
                    }`}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </header>

          <div className="px-4 py-5 sm:px-6 md:px-8 md:py-7">{children}</div>
        </section>
      </div>
    </main>
  );
}
