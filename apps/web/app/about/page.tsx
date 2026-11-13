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

const path = "/about";
const title = "關於 MonMate｜活動報到與報名管理平台｜聯絡方式";
const description =
  "MonMate 是台灣的活動報到與報名管理平台：建立活動、報名或匯入名單、QR Code／序號／電話報到、出席數據與問卷。這裡說明服務內容、計費方式與聯絡方式。";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: path },
  openGraph: { type: "website", locale: "zh_TW", title, description, url: path }
};

const crumbs: Crumb[] = [
  { name: "首頁", href: "/" },
  { name: "關於 MonMate", href: path }
];

export default function AboutPage() {
  return (
    <PageShell>
      <JsonLd data={pageJsonLd({ path, name: title, description, crumbs })} />
      <div className="mx-auto max-w-4xl px-5 pb-8 pt-8">
        <Breadcrumb crumbs={crumbs} />
        <p className="mt-6 text-sm font-bold text-orange">關於我們</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">關於 MonMate</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-charcoal/75">
          MonMate 是活動報到與報名管理平台，讓主辦方從名單準備、現場報到到活動後的出席統計，在同一個地方完成。
        </p>
      </div>

      <Section id="service" title="提供什麼服務" tone="white">
        <ul className="grid max-w-2xl gap-2 pl-5">
          <li className="list-disc">建立活動，開放線上報名，或匯入 Excel／CSV 名單。</li>
          <li className="list-disc">現場以 QR Code、序號或電話完成報到，工作人員用手機即可操作。</li>
          <li className="list-disc">查看報到率與時段分布、匯出報表，並在活動後發送問卷。</li>
        </ul>
        <p className="mt-4 max-w-2xl">
          適用學校活動、講座課程、品牌活動、展會與社群聚會。報到操作需要網路連線，詳見
          <Link href="/guides/offline-check-in" className="mx-1 font-bold text-orange">
            現場網路不穩時的備援做法
          </Link>
          。
        </p>
      </Section>

      <Section id="pricing" title="怎麼計費">
        <p className="max-w-2xl">
          建立活動免費。主辦方先購買點數，報名或匯入名單時每人 1 點，點數可跨活動使用，用不完會保留在帳號中。完整規則與費用試算請見
          <Link href="/pricing" className="mx-1 font-bold text-orange">
            價格說明
          </Link>
          ，購買與退款規則請見
          <Link href="/refund" className="mx-1 font-bold text-orange">
            退款條款
          </Link>
          。
        </p>
      </Section>

      <Section id="trust" title="資料與付款" tone="white">
        <ul className="grid max-w-2xl gap-2 pl-5">
          <li className="list-disc">
            個人資料的蒐集與使用方式，請見
            <Link href="/privacy" className="mx-1 font-bold text-orange">
              隱私權條款
            </Link>
            。
          </li>
          <li className="list-disc">付款透過藍新金流處理，本服務不直接儲存完整信用卡號。</li>
        </ul>
      </Section>

      <Section id="contact" title="聯絡我們">
        <p className="max-w-2xl">
          產品使用、付款或退款問題，請來信：
          <a href="mailto:support@monmate.tw" className="ml-1 font-bold text-orange">
            support@monmate.tw
          </a>
          。
        </p>
        <p className="mt-3 max-w-2xl text-[13px] text-charcoal/60">
          MonMate Powered by
          <a href="https://www.weihui.io/" target="_blank" rel="noreferrer" className="ml-1 font-bold hover:text-orange">
            瑋慧數位
          </a>
          。
        </p>
        <div className="mt-6">
          <CtaButton />
        </div>
      </Section>
    </PageShell>
  );
}
