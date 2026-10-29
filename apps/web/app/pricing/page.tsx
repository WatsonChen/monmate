import type { Metadata } from "next";
import Link from "next/link";
import { CreditEstimator } from "../components/CreditEstimator";
import { FaqAccordion } from "../components/FaqAccordion";
import {
  Breadcrumb,
  CtaButton,
  JsonLd,
  PageShell,
  Section,
  pageJsonLd,
  type Crumb,
} from "../components/SiteChrome";
import {
  BRANDING_CREDITS,
  EXAMPLE_HEADCOUNTS,
  PRICING_TIERS,
  describePlan,
  estimateCost,
  formatTwd,
} from "../lib/pricing";

const path = "/pricing";
const title = "價格說明：點數制計費與各人數費用表";
const description =
  "MonMate 採點數制：每人 1 點（報名者與攜伴分別計算），建立活動免費，點數可跨活動使用。提供 50／100／300／500／1,000 人的費用表與品牌客製化扣點方式。";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: path },
  openGraph: { type: "website", locale: "zh_TW", title, description, url: path },
};

const crumbs: Crumb[] = [
  { name: "首頁", href: "/" },
  { name: "價格說明", href: path },
];

const faq: [string, string][] = [
  [
    "建立活動要收費嗎？",
    "不用。建立活動免費，只有新增或匯入報名者、以及解鎖品牌客製化時才會扣點。",
  ],
  [
    "活動設定的人數上限會扣點嗎？",
    "不會。人數上限只是容量設定，實際扣點依新增或匯入的報名人數（含攜伴）計算。",
  ],
  [
    "是依實際到場人數扣點嗎？",
    "不是。計費人數是新增或匯入的報名人數（含攜伴），每人 1 點，報名者與攜伴分別計算。",
  ],
  [
    "買了點數用不完怎麼辦？",
    "點數保留在帳號中，可以跨活動使用，下一場活動繼續扣。",
  ],
  [
    "品牌客製化要多少點？",
    `每場活動 ${BRANDING_CREDITS} 點，可上傳專屬 Logo、置換頂部大圖，並隱藏頁尾與 QR Code 上的 MonMate 標示。不解鎖也能正常使用。`,
  ],
  [
    "可以退款嗎？",
    "退款規則請見退款條款頁面。",
  ],
];

const rows = EXAMPLE_HEADCOUNTS.map((n) => ({
  n,
  plain: estimateCost(n),
  branded: estimateCost(n, true),
}));

export default function PricingPage() {
  return (
    <PageShell>
      <JsonLd data={pageJsonLd({ path, name: title, description, crumbs, faq })} />
      <div className="mx-auto max-w-4xl px-5 pb-6 pt-8">
        <Breadcrumb crumbs={crumbs} />
        <p className="mt-6 text-sm font-bold text-orange">價格說明</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">
          點數制計費，用多少扣多少
        </h1>
        <p className="mt-4 text-base leading-7 text-charcoal/75">
          建立活動免費。先儲值點數，之後新增或匯入報名者時依人數扣點，點數可以跨活動使用，用不完會保留在帳號中。
        </p>
        <div className="mt-6">
          <CtaButton />
        </div>
      </div>

      <Section title="計價規則" tone="white">
        <ul className="grid gap-2 pl-5">
          <li className="list-disc">
            <strong>每人 1 點，報名者與攜伴分別計算。</strong>例如 1 位報名者帶 2 位同伴，共 3 人，扣 3 點。
          </li>
          <li className="list-disc">
            <strong>建立活動免費。</strong>
          </li>
          <li className="list-disc">
            <strong>人數上限只是容量設定，不扣點。</strong>計費人數＝新增或匯入的報名人數（含攜伴），不是當天實際到場人數。
          </li>
          <li className="list-disc">
            <strong>品牌客製化每場 {BRANDING_CREDITS} 點，選用。</strong>
          </li>
          <li className="list-disc">
            <strong>點數可跨活動使用。</strong>不用每辦一場活動就重新開通。
          </li>
        </ul>
      </Section>

      <Section title="點數方案">
        <div className="grid gap-4 sm:grid-cols-3">
          {PRICING_TIERS.map((t) => (
            <div key={t.credits} className="rounded-lg border border-charcoal/10 bg-white p-5">
              <p className="text-2xl font-bold text-charcoal">{formatTwd(t.price)}</p>
              <p className="mt-1 text-sm font-semibold text-charcoal/60">{t.credits} 點</p>
              <p className="mt-3 text-sm">{t.fit}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="各人數級距的費用" tone="white">
        <p>
          以下依上方方案與計價規則自動計算，列出湊足所需點數、總價最低的購買方式（方案可重複購買）。
        </p>
        <div className="mt-4 overflow-x-auto rounded-lg border border-charcoal/10 bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-paper text-xs text-charcoal/60">
              <tr>
                <th className="px-4 py-3 font-semibold">報名／匯入人數（含攜伴）</th>
                <th className="px-4 py-3 font-semibold">本場扣點</th>
                <th className="px-4 py-3 font-semibold">零餘額時的購買方式</th>
                <th className="px-4 py-3 font-semibold">本次需購買金額</th>
                <th className="px-4 py-3 font-semibold">活動後剩餘點數</th>
                <th className="px-4 py-3 font-semibold">加購品牌客製化後需購買金額</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.n} className="border-t border-charcoal/10">
                  <td className="px-4 py-3 font-semibold">{r.n.toLocaleString("en-US")} 人</td>
                  <td className="px-4 py-3">{r.plain.needed} 點</td>
                  <td className="px-4 py-3">{describePlan(r.plain.counts)}</td>
                  <td className="px-4 py-3 font-bold">{formatTwd(r.plain.total)}</td>
                  <td className="px-4 py-3">{r.plain.credits - r.plain.needed} 點</td>
                  <td className="px-4 py-3">
                    {formatTwd(r.branded.total)}
                    <span className="ml-1 text-xs text-charcoal/50">（共 {r.branded.needed} 點）</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-charcoal/60">
          「本次需購買金額」是帳戶沒有餘額時，湊足本場所需點數的最低購買金額，不是每場都要重新付費；剩下的點數會保留在帳號，下一場活動可以繼續使用。實際金額以購買當下的方案價格為準。
        </p>
        <div className="mt-6">
          <CreditEstimator tiers={PRICING_TIERS} />
        </div>
      </Section>

      <Section title="品牌客製化怎麼扣點">
        <p>
          品牌客製化以「單場活動」為單位解鎖，每場 {BRANDING_CREDITS} 點，從帳號點數中扣除。解鎖後可上傳專屬
          Logo、置換頂部大圖，並隱藏頁尾與 QR Code 上的 MonMate 標示；不解鎖也能正常使用所有報到功能。
        </p>
      </Section>

      <Section title="退款" tone="white">
        <p>
          付款與退款規則請見
          <Link href="/refund" className="mx-1 font-bold text-orange">
            退款條款
          </Link>
          。
        </p>
      </Section>

      <Section title="想先看實際案例或情境？">
        <p className="flex flex-wrap gap-x-5 gap-y-2 font-bold text-orange">
          <Link href="/cases/elementary-school">小學家長會案例</Link>
          <Link href="/scenarios/school">學校活動</Link>
          <Link href="/scenarios/seminar">講座、課程、教育訓練</Link>
          <Link href="/scenarios/excel-list">已有 Excel 名單</Link>
        </p>
      </Section>

      <Section title="價格常見問題" tone="white">
        <FaqAccordion items={faq} />
      </Section>

      <section className="bg-paper">
        <div className="mx-auto max-w-4xl px-5 py-12 text-center">
          <h2 className="text-2xl font-bold">建立活動免費，先試試看</h2>
          <div className="mt-6">
            <CtaButton />
          </div>
        </div>
      </section>
    </PageShell>
  );
}
