import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import {
  Breadcrumb,
  CtaButton,
  JsonLd,
  PageShell,
  Section,
  pageJsonLd,
  type Crumb,
} from "./SiteChrome";
import { FaqAccordion } from "./FaqAccordion";

export type GuideSection = {
  id: string;
  title: string;
  paragraphs?: string[];
  items?: string[];
  steps?: string[];
  /** 需要特別提醒的一句話 */
  note?: string;
};

export type GuideContent = {
  path: string;
  metaTitle: string;
  description: string;
  h1: string;
  eyebrow: string;
  intro: string[];
  crumbName: string;
  sections: GuideSection[];
  faq: [string, string][];
  related: { label: string; href: string; desc: string }[];
};

export function guideMetadata(c: GuideContent): Metadata {
  return {
    // 標題已自帶品牌名，不再套用全站的標題模板
    title: { absolute: c.metaTitle },
    description: c.description,
    alternates: { canonical: c.path },
    openGraph: { type: "website", locale: "zh_TW", title: c.metaTitle, description: c.description, url: c.path },
  };
}

export function GuidePage({ c }: { c: GuideContent }) {
  const crumbs: Crumb[] = [
    { name: "首頁", href: "/" },
    { name: c.crumbName, href: c.path },
  ];
  let toneIndex = 0;
  const nextTone = (): "white" | "paper" => (toneIndex++ % 2 === 0 ? "white" : "paper");

  return (
    <PageShell>
      <JsonLd
        data={pageJsonLd({ path: c.path, name: c.metaTitle, description: c.description, crumbs, faq: c.faq })}
      />
      <div className="mx-auto max-w-4xl px-5 pb-8 pt-8">
        <Breadcrumb crumbs={crumbs} />
        <p className="mt-6 text-sm font-bold text-orange">{c.eyebrow}</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">{c.h1}</h1>
        <div className="mt-4 grid max-w-2xl gap-3 text-base leading-7 text-charcoal/75">
          {c.intro.map((t) => (
            <p key={t}>{t}</p>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <CtaButton />
          <Link href="/pricing" className="text-sm font-bold text-orange">
            查看費用試算 →
          </Link>
        </div>
        <nav aria-label="本頁內容" className="mt-8 flex flex-wrap gap-2">
          {c.sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="rounded-full border border-charcoal/10 bg-white px-4 py-1.5 text-sm font-semibold text-charcoal/70 transition-colors hover:border-orange/40 hover:text-orange"
            >
              {s.title.replace(/[？?]$/, "")}
            </a>
          ))}
          <a
            href="#faq"
            className="rounded-full border border-charcoal/10 bg-white px-4 py-1.5 text-sm font-semibold text-charcoal/70 transition-colors hover:border-orange/40 hover:text-orange"
          >
            常見問題
          </a>
        </nav>
      </div>

      {c.sections.map((s) => (
        <Section key={s.id} id={s.id} title={s.title} tone={nextTone()}>
          <div className="grid max-w-2xl gap-4">
            {s.paragraphs?.map((t) => (
              <p key={t} className="text-[15px] leading-7">
                {t}
              </p>
            ))}
            {s.items ? (
              <ul className="grid gap-3">
                {s.items.map((t) => (
                  <li key={t} className="flex gap-2.5 text-[15px] leading-6">
                    <CheckCircle2 size={16} className="mt-1 shrink-0 text-mint" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {s.steps ? (
              <ol className="grid gap-3">
                {s.steps.map((t, i) => (
                  <li key={t} className="flex gap-3 text-[15px] leading-6">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange/12 text-sm font-bold text-orange">
                      {i + 1}
                    </span>
                    <span className="pt-0.5">{t}</span>
                  </li>
                ))}
              </ol>
            ) : null}
            {s.note ? (
              <p className="rounded-lg border-l-4 border-orange bg-white px-4 py-3 text-[15px] font-semibold leading-6 text-charcoal">
                {s.note}
              </p>
            ) : null}
          </div>
        </Section>
      ))}

      <Section id="faq" title="常見問題" tone={nextTone()}>
        <FaqAccordion items={c.faq} />
      </Section>

      <Section id="related" title="相關頁面" tone={nextTone()}>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {c.related.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="rounded-lg border border-charcoal/10 bg-white p-4 transition-colors hover:border-orange/40"
            >
              <span className="text-sm font-bold text-charcoal">{r.label} →</span>
              <span className="mt-1 block text-[13px] leading-5 text-charcoal/65">{r.desc}</span>
            </Link>
          ))}
        </div>
      </Section>

      <section className="bg-paper">
        <div className="mx-auto max-w-4xl px-5 py-12 text-center">
          <h2 className="text-2xl font-bold">準備好試試看了嗎？</h2>
          <p className="mt-3 text-sm text-charcoal/70">建立活動免費，點數用多少扣多少。</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <CtaButton />
            <Link href="/pricing" className="text-sm font-bold text-orange">
              查看費用試算 →
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
