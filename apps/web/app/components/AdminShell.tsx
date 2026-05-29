"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarPlus,
  Download,
  FileSpreadsheet,
  Home,
  ListChecks,
  QrCode,
  Send
} from "lucide-react";
import { BrandLogo } from "./BrandLogo";

const navItems = [
  { label: "總覽", icon: Home, href: "/admin" },
  { label: "活動列表", icon: ListChecks, href: "/admin/events" },
  { label: "新增活動", icon: CalendarPlus, href: "/admin/events/new" },
  { label: "匯入名單", icon: FileSpreadsheet, href: "/admin/import" },
  { label: "寄送資訊", icon: Send, href: "/admin/notifications" },
  { label: "匯出報表", icon: Download, href: "/admin/export" }
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <main className="min-h-dvh bg-paper text-charcoal">
      <div className="md:grid md:min-h-dvh md:grid-cols-[248px_minmax(0,1fr)]">
        <aside className="hidden border-r border-charcoal/10 bg-white md:sticky md:top-0 md:flex md:h-dvh md:flex-col">
          <div className="px-5 py-5">
            <BrandLogo
              variant="horizontal"
              className="h-16 w-44 object-contain object-left"
            />
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
          <div className="border-t border-charcoal/10 p-4">
            <Link
              href="/event/monmate-demo/checkin"
              className="flex h-11 items-center justify-center gap-2 rounded-lg bg-orange px-4 text-sm font-bold text-white"
            >
              <QrCode size={18} />
              Demo 報到頁
            </Link>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-charcoal/10 bg-white/95 backdrop-blur md:hidden">
            <div className="flex h-16 items-center justify-between px-4">
              <BrandLogo
                variant="horizontal"
                className="h-14 w-40 object-contain object-left"
              />
              <Link
                href="/event/monmate-demo/checkin"
                className="flex h-10 items-center gap-2 rounded-lg bg-orange px-3 text-sm font-bold text-white"
              >
                <QrCode size={16} />
                報到
              </Link>
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
