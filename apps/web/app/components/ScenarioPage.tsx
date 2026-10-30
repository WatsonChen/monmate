import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BarChart3, CalendarPlus, CheckCircle2, QrCode, Users, type LucideIcon } from "lucide-react";
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
  /** 首屏右側插圖（public 下的路徑） */
  image?: string;
  pains: { title: string; text: string }[];
  before: string[];
  during: string[];
  after: string[];
  staffing: string[];
  exampleIntro: string;
  exampleHeadcounts: number[];
  /** 費用表多顯示「加購品牌客製化後」欄位 */
  showBranding?: boolean;
  /** 適合哪些活動（條列） */
  suitable?: { title: string; items: string[] };
  /** 與既有做法（Excel、紙本）的差異，不攻擊競品 */
  compare?: { title: string; leftLabel: string; left: string[]; right: string[] };
  /** 相關頁面（內部連結） */
  related?: { label: string; href: string; desc: string }[];
  /** 次要 CTA 文案，預設「查看費用試算」，連到 /pricing */
  secondaryCtaLabel?: string;
  faq: [string, string][];
};

// 全站共用的核心訊息
const VALUE_PROPOSITION = "讓工作人員從逐一核對名單，變成只處理例外與引導動線。";

export function scenarioMetadata(c: ScenarioContent): Metadata {
  return {
    // 標題已自帶品牌名，不再套用全站的「｜MonMate 活動報到系統」模板
    title: { absolute: c.metaTitle },
    description: c.description,
    alternates: { canonical: c.path },
    openGraph: { type: "website", locale: "zh_TW", title: c.metaTitle, description: c.description, url: c.path },
  };
}

function buildPageNav(c: ScenarioContent) {
  return [
    { href: "#pains", label: "常見痛點" },
    { href: "#flow", label: "使用流程" },
    ...(c.suitable ? [{ href: "#suitable", label: "適用活動" }] : []),
    ...(c.compare ? [{ href: "#compare", label: "做法比較" }] : []),
    { href: "#staffing", label: "現場人力" },
    { href: "#cost", label: "費用範例" },
    { href: "#faq", label: "常見問題" },
  ];
}

function Stage({
  step,
  title,
  items,
  icon: Icon,
}: {
  step: string;
  title: string;
  items: string[];
  icon: LucideIcon;
}) {
  return (
    <div className="flex flex-col rounded-lg border border-charcoal/10 bg-white p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mint/20 text-mint">
          <Icon size={20} />
        </span>
        <div>
          <p className="text-xs font-bold tracking-wide text-orange">{step}</p>
          <h3 className="text-base font-bold text-charcoal">{title}</h3>
        </div>
      </div>
      <ul className="mt-4 grid gap-3">
        {items.map((t) => (
          <li key={t} className="flex gap-2.5 text-[15px] leading-6">
            <CheckCircle2 size={16} className="mt-1 shrink-0 text-mint" />
            <span>{t}</span>
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
  // 流程區是 paper 底，之後的區塊依序交錯白／淺底，不論有沒有選配的區塊都不會連續同色
  let toneIndex = 0;
  const nextTone = (): "white" | "paper" => (toneIndex++ % 2 === 0 ? "white" : "paper");
  const examples = c.exampleHeadcounts.map((n) => ({
    n,
    ...estimateCost(n),
    branded: c.showBranding ? estimateCost(n, true) : null,
  }));

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
      <div className="mx-auto max-w-4xl px-5 pb-8 pt-8">
        <Breadcrumb crumbs={crumbs} />
        <div className="mt-6 flex items-center gap-8">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-orange">{c.eyebrow}</p>
            <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">{c.h1}</h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-charcoal/75">{c.intro}</p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <CtaButton />
              <Link href="/pricing" className="text-sm font-bold text-orange">
                {c.secondaryCtaLabel ?? "查看費用試算"} →
              </Link>
            </div>
          </div>
          {c.image ? (
            <Image
              src={c.image}
              alt=""
              width={220}
              height={220}
              className="hidden h-[200px] w-[200px] shrink-0 object-contain md:block"
              unoptimized
            />
          ) : null}
        </div>
        <nav aria-label="本頁內容" className="mt-8 flex flex-wrap gap-2">
          {buildPageNav(c).map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="rounded-full border border-charcoal/10 bg-white px-4 py-1.5 text-sm font-semibold text-charcoal/70 transition-colors hover:border-orange/40 hover:text-orange"
            >
              {n.label}
            </a>
          ))}
        </nav>
      </div>

      <Section id="pains" title="常見的報到痛點" tone="white">
        <div className="grid gap-4 sm:grid-cols-3">
          {c.pains.map((p, i) => (
            <div key={p.title} className="rounded-lg border border-charcoal/10 bg-paper p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange/12 text-sm font-bold text-orange">
                {i + 1}
              </span>
              <h3 className="mt-3 text-base font-bold text-charcoal">{p.title}</h3>
              <p className="mt-2 text-[15px] leading-6">{p.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="flow" title="用 MonMate 的流程">
        <p className="mb-5 max-w-2xl text-[15px] font-semibold text-charcoal">{VALUE_PROPOSITION}</p>
        <div className="grid gap-4 md:grid-cols-3">
          <Stage step="STEP 1" title="活動前" items={c.before} icon={CalendarPlus} />
          <Stage step="STEP 2" title="活動當天" items={c.during} icon={QrCode} />
          <Stage step="STEP 3" title="活動後" items={c.after} icon={BarChart3} />
        </div>
      </Section>

      {c.suitable ? (
        <Section id="suitable" title={c.suitable.title} tone={nextTone()}>
          <ul className="grid gap-3 sm:grid-cols-2">
            {c.suitable.items.map((t) => (
              <li key={t} className="flex gap-2.5 rounded-lg border border-charcoal/10 bg-paper px-4 py-3 text-[15px] leading-6">
                <CheckCircle2 size={16} className="mt-1 shrink-0 text-mint" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {c.compare ? (
        <Section id="compare" title={c.compare.title} tone={nextTone()}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-charcoal/10 bg-white p-5">
              <h3 className="text-base font-bold text-charcoal/70">{c.compare.leftLabel}</h3>
              <ul className="mt-3 grid gap-2.5">
                {c.compare.left.map((t) => (
                  <li key={t} className="flex gap-2.5 text-[15px] leading-6 text-charcoal/75">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-charcoal/30" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-mint/40 bg-white p-5">
              <h3 className="text-base font-bold text-charcoal">用 MonMate</h3>
              <ul className="mt-3 grid gap-2.5">
                {c.compare.right.map((t) => (
                  <li key={t} className="flex gap-2.5 text-[15px] leading-6">
                    <CheckCircle2 size={16} className="mt-1 shrink-0 text-mint" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>
      ) : null}

      <Section id="staffing" title="現場人力怎麼安排" tone={nextTone()}>
        <div className="grid gap-4 sm:grid-cols-3">
          {c.staffing.map((t) => (
            <div key={t} className="rounded-lg border border-charcoal/10 bg-paper p-5">
              <Users size={20} className="text-orange" />
              <p className="mt-3 text-[15px] leading-6">{t}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="cost" title="費用範例" tone={nextTone()}>
        <p className="max-w-2xl">{c.exampleIntro}</p>
        <div className="mt-4 overflow-x-auto rounded-lg border border-charcoal/10 bg-white">
          <table className={`w-full text-left text-sm ${c.showBranding ? "min-w-[640px]" : "min-w-[420px]"}`}>
            <thead className="bg-paper text-xs text-charcoal/60">
              <tr>
                <th className="px-4 py-3 font-semibold">報名／匯入人數（含攜伴）</th>
                <th className="px-4 py-3 font-semibold">需扣點數</th>
                <th className="px-4 py-3 font-semibold">最划算的購買方式</th>
                <th className="px-4 py-3 font-semibold">零餘額時最低購買金額</th>
                {c.showBranding ? (
                  <th className="px-4 py-3 font-semibold">加購品牌客製化後需購買金額</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {examples.map((e) => (
                <tr key={e.n} className="border-t border-charcoal/10">
                  <td className="px-4 py-3 font-semibold">{e.n.toLocaleString("en-US")} 人</td>
                  <td className="px-4 py-3">{e.needed} 點</td>
                  <td className="px-4 py-3">{describePlan(e.counts)}</td>
                  <td className="px-4 py-3 font-bold">{formatTwd(e.total)}</td>
                  {e.branded ? (
                    <td className="px-4 py-3">
                      {formatTwd(e.branded.total)}
                      <span className="ml-1 text-xs text-charcoal/50">（共 {e.branded.needed} 點）</span>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 max-w-2xl text-xs leading-6 text-charcoal/60">
          每人 1 點，報名者與攜伴分別計算；依報名／匯入人數計算，不是實際到場人數；建立活動免費；人數上限只是容量設定，不扣點；點數可跨活動使用，用不完會保留在帳號中。
          <Link href="/pricing" className="ml-1 font-bold text-orange">
            完整價格說明
          </Link>
        </p>
      </Section>

      <Section id="faq" title="常見問題" tone={nextTone()}>
        <FaqAccordion items={c.faq} />
      </Section>

      {c.related && c.related.length > 0 ? (
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
      ) : null}

      <section className="bg-paper">
        <div className="mx-auto max-w-4xl px-5 py-12 text-center">
          <h2 className="text-2xl font-bold">準備好試試看了嗎？</h2>
          <p className="mt-3 text-sm text-charcoal/70">建立活動免費，點數用多少扣多少。</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <CtaButton />
            <Link href="/pricing" className="text-sm font-bold text-orange">
              {c.secondaryCtaLabel ?? "查看費用試算"} →
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
