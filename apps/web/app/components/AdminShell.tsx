"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart2,
  ClipboardCheck,
  CreditCard,
  Download,
  Home,
  ListChecks,
  LogOut,
  QrCode,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { BrandLogo } from "./BrandLogo";
import { apiFetch } from "../lib/api";
import type { UserDTO } from "@monmate/types";

const navItems = [
  { label: "總覽", icon: Home, href: "/admin" },
  { label: "活動列表", icon: ListChecks, href: "/admin/events" },
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
  const [user, setUser] = useState<UserDTO | null>(null);

  function fetchUser() {
    const token = window.localStorage.getItem("monmate.token");
    if (!token) return;
    void apiFetch<UserDTO>("/auth/me", { token }).then((res) => {
      if (res.success && res.data) setUser(res.data);
    });
  }

  useEffect(() => {
    fetchUser();
    window.addEventListener("credits-changed", fetchUser);
    return () => window.removeEventListener("credits-changed", fetchUser);
  }, []);

  const credits = user?.attendeeCredits ?? null;

  function logout() {
    window.localStorage.removeItem("monmate.token");
    router.push("/");
  }

  return (
    <main className="min-h-dvh bg-paper text-charcoal">
      <div className="md:grid md:min-h-dvh md:grid-cols-[248px_minmax(0,1fr)]">
        <aside className="hidden border-r border-charcoal/10 bg-white md:sticky md:top-0 md:flex md:h-dvh md:flex-col print:hidden">
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
            {user && (
              <div className="flex items-center gap-2.5 rounded-lg bg-paper px-3 py-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mint/30 text-sm font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{user.name}</p>
                  <p className="truncate text-xs text-charcoal/50">{user.email}</p>
                </div>
              </div>
            )}
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
          <header className="sticky top-0 z-20 border-b border-charcoal/10 bg-white/95 backdrop-blur md:hidden print:hidden">
            <div className="flex h-16 min-w-0 items-center justify-between gap-2 px-3 sm:px-4">
              <BrandLogo
                variant="horizontal"
                className="h-12 w-32 shrink-0 object-contain object-left sm:h-14 sm:w-40"
              />
              <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                {credits !== null && (
                  <Link
                    href="/admin/billing"
                    className="flex h-9 items-center gap-1 rounded-lg border border-orange/20 bg-orange/10 px-2 text-xs font-bold text-orange whitespace-nowrap sm:gap-1.5 sm:px-3"
                  >
                    <CreditCard size={13} className="shrink-0" />
                    <span>{credits} 人次</span>
                  </Link>
                )}
                <button
                  type="button"
                  onClick={logout}
                  aria-label="登出"
                  title="登出"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-charcoal/15 text-sm font-bold sm:w-auto sm:gap-2 sm:px-3"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">登出</span>
                </button>
              </div>
            </div>
            <nav className="grid grid-cols-3 gap-2 px-3 pb-3 sm:flex sm:max-w-full sm:overflow-x-auto sm:px-4">
              {navItems.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex h-10 min-w-0 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-bold sm:shrink-0 sm:justify-start sm:gap-2 sm:px-3 sm:text-sm ${
                      active
                        ? "bg-mint/30 text-charcoal"
                        : "bg-paper text-charcoal/65"
                    }`}
                  >
                    <item.icon size={16} className="shrink-0" />
                    <span className="truncate whitespace-nowrap">{item.label}</span>
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
