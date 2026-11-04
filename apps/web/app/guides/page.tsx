import type { Metadata } from "next";
import Link from "next/link";
import {
  Breadcrumb,
  CtaButton,
  JsonLd,
  PageShell,
  Section,
  pageJsonLd,
  type Crumb
} from "../components/SiteChrome";
import { ScenarioLinks } from "../components/ScenarioLinks";
import { GUIDES } from "../lib/site-content";

const path = "/guides";
const title = "活動報到使用指南｜QR Code 簽到、名單匯入與報表匯出｜MonMate";
const description =
  "活動報到怎麼做的實用指南：現場網路不穩的備援、活動後出席報表匯出，以及不同活動類型（學校、講座、品牌活動、社群聚會）的報到做法與費用範例。";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: path },
  openGraph: { type: "website", locale: "zh_TW", title, description, url: path }
};

const crumbs: Crumb[] = [
  { name: "首頁", href: "/" },
  { name: "使用指南", href: path }
];

export default function GuidesIndexPage() {
  return (
    <PageShell>
      <JsonLd data={pageJsonLd({ path, name: title, description, crumbs })} />
      <div className="mx-auto max-w-4xl px-5 pb-8 pt-8">
        <Breadcrumb crumbs={crumbs} />
        <p className="mt-6 text-sm font-bold text-orange">使用指南</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">活動報到使用指南</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-charcoal/75">
          從現場報到、名單匯入到活動後的出席報表，整理主辦方最常遇到的問題與做法。每篇都會說明 MonMate 實際能做到與做不到的部分。
        </p>
      </div>

      <Section id="guides" title="操作與做法" tone="white">
        <div className="grid gap-4 sm:grid-cols-2">
          {GUIDES.map((g) => (
            <Link
              key={g.href}
              href={g.href}
              className="rounded-lg border border-charcoal/10 bg-paper p-5 transition-colors hover:border-orange/40"
            >
              <h2 className="text-base font-bold text-charcoal">{g.label}</h2>
              <p className="mt-2 text-[15px] leading-6">{g.desc}</p>
              <span className="mt-3 block text-sm font-bold text-orange">閱讀指南 →</span>
            </Link>
          ))}
        </div>
      </Section>

      <Section id="scenarios" title="依活動類型找做法">
        <p className="max-w-2xl">不同活動的人數、現場人力與報到方式不同，各情境頁整理了流程與費用範例。</p>
        <div className="mt-5">
          <ScenarioLinks />
        </div>
      </Section>

      <Section id="pricing" title="想先知道要花多少？" tone="white">
        <p className="max-w-2xl">
          建立活動免費，報名或匯入名單時每人 1 點。
          <Link href="/pricing" className="ml-1 font-bold text-orange">
            查看價格說明與費用試算 →
          </Link>
        </p>
        <div className="mt-5">
          <CtaButton />
        </div>
      </Section>
    </PageShell>
  );
}
