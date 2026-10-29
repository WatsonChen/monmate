import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "./BrandLogo";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.monmate.tw").replace(
  /\/$/,
  "",
);

export type Crumb = { name: string; href: string };

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${siteUrl}${c.href}`,
    })),
  };
}

export function faqJsonLd(items: [string, string][]) {
  return {
    "@type": "FAQPage",
    mainEntity: items.map(([q, a]) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

export function pageJsonLd({
  path,
  name,
  description,
  crumbs,
  faq,
}: {
  path: string;
  name: string;
  description: string;
  crumbs: Crumb[];
  faq?: [string, string][];
}) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${siteUrl}${path}`,
        url: `${siteUrl}${path}`,
        name,
        description,
        inLanguage: "zh-Hant-TW",
        isPartOf: { "@type": "WebSite", url: siteUrl, name: "MonMate 活動報到系統" },
        breadcrumb: { "@id": `${siteUrl}${path}#breadcrumb` },
      },
      { ...breadcrumbJsonLd(crumbs), "@id": `${siteUrl}${path}#breadcrumb` },
      ...(faq ? [faqJsonLd(faq)] : []),
    ],
  };
}

export function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="麵包屑" className="text-xs font-semibold text-charcoal/55">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {crumbs.map((c, i) => (
          <li key={c.href} className="flex items-center gap-2">
            {i < crumbs.length - 1 ? (
              <>
                <Link href={c.href} className="hover:text-charcoal">
                  {c.name}
                </Link>
                <span aria-hidden="true">/</span>
              </>
            ) : (
              <span aria-current="page" className="text-charcoal/80">
                {c.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

const headerLinks = [
  { label: "價格說明", href: "/pricing" },
  { label: "客戶案例", href: "/cases/elementary-school" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-charcoal/10 bg-paper/95 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center">
          <BrandLogo variant="horizontal" className="h-14 w-40 object-contain object-left" />
        </Link>
        <div className="hidden items-center gap-6 md:flex">
          {headerLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-bold text-charcoal/70 hover:text-charcoal"
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/login"
            className="hidden h-10 items-center rounded-full border border-charcoal/15 px-4 text-sm font-semibold sm:flex"
          >
            登入
          </Link>
          <Link
            href="/admin/login"
            className="flex h-10 items-center rounded-full bg-orange px-4 text-sm font-semibold text-white"
          >
            建立活動
          </Link>
        </div>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  const links = [
    { label: "首頁", href: "/" },
    { label: "價格說明", href: "/pricing" },
    { label: "客戶案例", href: "/cases/elementary-school" },
    { label: "學校活動", href: "/scenarios/school" },
    { label: "講座、課程簽到", href: "/scenarios/seminar" },
    { label: "Excel 名單報到", href: "/scenarios/excel-list" },
    { label: "隱私權條款", href: "/privacy" },
    { label: "退款條款", href: "/refund" },
  ];
  return (
    <footer className="border-t border-charcoal/10 bg-white">
      <div className="mx-auto max-w-6xl px-5 py-8">
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-charcoal/65">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-charcoal">
              {l.label}
            </Link>
          ))}
        </div>
        <p className="mt-5 text-xs font-semibold text-charcoal/50">© 2026 MonMate. All rights reserved.</p>
      </div>
    </footer>
  );
}

export function CtaButton({ children = "免費建立活動" }: { children?: ReactNode }) {
  return (
    <Link
      href="/admin/login"
      className="inline-flex h-12 items-center rounded-full bg-orange px-6 text-sm font-semibold text-white shadow-soft"
    >
      {children}
    </Link>
  );
}

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-dvh bg-paper text-charcoal">
      <SiteHeader />
      {children}
      <SiteFooter />
    </main>
  );
}

export function Section({
  title,
  children,
  tone = "paper",
}: {
  title: string;
  children: ReactNode;
  tone?: "paper" | "white";
}) {
  return (
    <section className={tone === "white" ? "bg-white" : "bg-paper"}>
      <div className="mx-auto max-w-4xl px-5 py-10">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="mt-5 text-sm leading-7 text-charcoal/80">{children}</div>
      </div>
    </section>
  );
}
