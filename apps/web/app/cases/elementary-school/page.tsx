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
} from "../../components/SiteChrome";

const path = "/cases/elementary-school";
const title = "客戶案例：小學家長會與研討會的報到";
const description =
  "一所台灣小學從人工報到改用 MonMate 的經驗：現場張貼 QR Code 讓與會者自助報到，工作人員只處理例外狀況與引導動線。";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: path },
  openGraph: { type: "website", locale: "zh_TW", title, description, url: path },
};

const crumbs: Crumb[] = [
  { name: "首頁", href: "/" },
  { name: "客戶案例：小學家長會與研討會", href: path },
];

// 成效數據與承辦人引言待取得學校同意與實際資料後再加入，未取得前不公開空白區塊

export default function ElementarySchoolCasePage() {
  return (
    <PageShell>
      <JsonLd data={pageJsonLd({ path, name: title, description, crumbs })} />
      <div className="mx-auto max-w-4xl px-5 pb-6 pt-8">
        <Breadcrumb crumbs={crumbs} />
        <p className="mt-6 text-sm font-bold text-orange">客戶案例・匿名</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">
          一所台灣小學，用 QR Code 讓家長會與研討會自助報到
        </h1>
        <p className="mt-4 text-base leading-7 text-charcoal/75">
          本案例為匿名分享，學校名稱不公開。
        </p>
      </div>

      <Section title="背景" tone="white">
        <p>
          這所小學原本以人工方式報到，活動類型包含家長會與研討會。每次活動由承辦人與工作人員在入口逐一核對名單。
        </p>
      </Section>

      <Section title="改用 MonMate 後">
        <ul className="grid gap-2 pl-5">
          <li className="list-disc">在現場張貼 QR Code，讓與會者自行掃描報到。</li>
          <li className="list-disc">
            工作人員從逐一人工核對，改成只處理例外狀況和引導動線。
          </li>
          <li className="list-disc">
            承辦人覺得整理資料的過程很快、很流暢，下一場活動也會繼續使用。
          </li>
        </ul>
      </Section>

      <Section title="想了解更多？" tone="white">
        <p className="flex flex-wrap gap-x-5 gap-y-2 font-bold text-orange">
          <Link href="/scenarios/school">學校活動報到怎麼做</Link>
          <Link href="/pricing">價格說明</Link>
        </p>
        <div className="mt-6">
          <CtaButton />
        </div>
      </Section>
    </PageShell>
  );
}
