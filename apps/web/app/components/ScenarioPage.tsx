import type { Metadata } from "next";
import Link from "next/link";
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
import { describePlan, estimateCost, formatTwd } from "../lib/pricing";

export type ScenarioContent = {
  path: string;
  metaTitle: string;
  description: string;
  h1: string;
  eyebrow: string;
  intro: string;
  crumbName: string;
  pains: { title: string; text: string }[];
  before: string[];
  during: string[];
  after: string[];
  staffing: string[];
  exampleIntro: string;
  exampleHeadcounts: number[];
  faq: [string, string][];
};

export function scenarioMetadata(c: ScenarioContent): Metadata {
  return {
    title: c.metaTitle,
    description: c.description,
    alternates: { canonical: c.path },
    openGraph: { type: "website", locale: "zh_TW", title: c.metaTitle, description: c.description, url: c.path },
  };
}

function StepList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-charcoal/10 bg-white p-5">
      <h3 className="text-base font-bold text-charcoal">{title}</h3>
      <ul className="mt-3 grid gap-2 pl-5">
        {items.map((t) => (
          <li key={t} className="list-disc">
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ScenarioPage({ c }: { c: ScenarioContent }) {
  const crumbs: Crumb[] = [
    { name: "首頁", href: "/" },
    { name: "適用場景", href: "/#scenarios" },
    { name: c.crumbName, href: c.path },
  ];
  const examples = c.exampleHeadcounts.map((n) => ({ n, ...estimateCost(n) }));

  return (
    <PageShell>
      <JsonLd
        data={pageJsonLd({
          path: c.path,
          name: c.metaTitle,
          description: c.description,
          crumbs,
          faq: c.faq,
        })}
      />
      <div className="mx-auto max-w-4xl px-5 pb-6 pt-8">
        <Breadcrumb crumbs={crumbs} />
        <p className="mt-6 text-sm font-bold text-orange">{c.eyebrow}</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">{c.h1}</h1>
        <p className="mt-4 text-base leading-7 text-charcoal/75">{c.intro}</p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <CtaButton />
          <Link href="/pricing" className="text-sm font-bold text-orange">
            看價格說明 →
          </Link>
        </div>
      </div>

      <Section title="常見的報到痛點" tone="white">
        <div className="grid gap-4 sm:grid-cols-3">
          {c.pains.map((p) => (
            <div key={p.title} className="rounded-lg border border-charcoal/10 bg-paper p-5">
              <h3 className="text-base font-bold text-charcoal">{p.title}</h3>
              <p className="mt-2">{p.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="用 MonMate 的流程">
        <div className="grid gap-4 md:grid-cols-3">
          <StepList title="活動前" items={c.before} />
          <StepList title="活動當天" items={c.during} />
          <StepList title="活動後" items={c.after} />
        </div>
      </Section>

      <Section title="現場人力怎麼安排" tone="white">
        <ul className="grid gap-2 pl-5">
          {c.staffing.map((t) => (
            <li key={t} className="list-disc">
              {t}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="費用範例">
        <p>{c.exampleIntro}</p>
        <div className="mt-4 overflow-x-auto rounded-lg border border-charcoal/10 bg-white">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead className="bg-paper text-xs text-charcoal/60">
              <tr>
                <th className="px-4 py-3 font-semibold">報名／匯入人數（含攜伴）</th>
                <th className="px-4 py-3 font-semibold">需扣點數</th>
                <th className="px-4 py-3 font-semibold">最划算的購買方式</th>
                <th className="px-4 py-3 font-semibold">零餘額時最低購買金額</th>
              </tr>
            </thead>
            <tbody>
              {examples.map((e) => (
                <tr key={e.n} className="border-t border-charcoal/10">
                  <td className="px-4 py-3 font-semibold">{e.n.toLocaleString("en-US")} 人</td>
                  <td className="px-4 py-3">{e.needed} 點</td>
                  <td className="px-4 py-3">{describePlan(e.counts)}</td>
                  <td className="px-4 py-3 font-bold">{formatTwd(e.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-charcoal/60">
          每人 1 點，報名者與攜伴分別計算；依報名／匯入人數計算，不是實際到場人數；建立活動免費；人數上限只是容量設定，不扣點；點數可跨活動使用，用不完會保留在帳號中。
          <Link href="/pricing" className="ml-1 font-bold text-orange">
            完整價格說明
          </Link>
          ・
          <Link href="/cases/elementary-school" className="font-bold text-orange">
            小學家長會案例
          </Link>
        </p>
      </Section>

      <Section title="常見問題" tone="white">
        <FaqAccordion items={c.faq} />
      </Section>

      <section className="bg-paper">
        <div className="mx-auto max-w-4xl px-5 py-12 text-center">
          <h2 className="text-2xl font-bold">準備好試試看了嗎？</h2>
          <p className="mt-3 text-sm text-charcoal/70">建立活動免費，點數用多少扣多少。</p>
          <div className="mt-6">
            <CtaButton />
          </div>
        </div>
      </section>
    </PageShell>
  );
}
