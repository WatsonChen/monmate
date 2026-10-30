import type { Metadata } from "next";
import Image from "next/image";
import { QrCode, ThumbsUp, Users } from "lucide-react";
import { CaseFlowDemo } from "../../components/CaseFlowDemo";
import { ScenarioLinks } from "../../components/ScenarioLinks";
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
      <div className="mx-auto max-w-4xl px-5 pb-8 pt-8">
        <Breadcrumb crumbs={crumbs} />
        <div className="mt-6 flex items-center gap-6">
          <div className="min-w-0 flex-1">
            <p className="pricing-rise text-sm font-bold text-orange">客戶案例・匿名</p>
            <h1
              className="pricing-rise mt-2 max-w-2xl text-balance text-3xl font-bold leading-tight sm:text-4xl"
              style={{ "--d": "80ms" } as React.CSSProperties}
            >
              一所台灣小學，用 QR Code 讓家長會與研討會自助報到
            </h1>
            <p
              className="pricing-rise mt-4 text-base leading-7 text-charcoal/75"
              style={{ "--d": "180ms" } as React.CSSProperties}
            >
              本案例為匿名分享，學校名稱不公開。
            </p>
          </div>
          <Image
            src="/brand/scenario-school.png"
            alt=""
            width={200}
            height={200}
            className="mascot-float hidden h-[170px] w-[170px] shrink-0 object-contain sm:block"
            priority
            unoptimized
          />
        </div>
      </div>

      <Section title="入口的差別">
        <p className="mb-4 max-w-2xl">
          這所小學的家長會與研討會，原本都在入口逐一核對名單。切換看看，改用後的入口是什麼樣子。
        </p>
        <CaseFlowDemo />
      </Section>

      <Section title="背景" tone="white">
        <p className="max-w-2xl">
          這所小學原本以人工方式報到，活動類型包含家長會與研討會。每次活動由承辦人與工作人員在入口逐一核對名單。
        </p>
      </Section>

      <Section title="改用 MonMate 後">
        <ul className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: QrCode, text: "在現場張貼 QR Code，讓與會者自行掃描報到。" },
            { icon: Users, text: "工作人員從逐一人工核對，改成只處理例外狀況和引導動線。" },
            { icon: ThumbsUp, text: "承辦人覺得整理資料的過程很快、很流暢，下一場活動也會繼續使用。" },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="rounded-2xl border border-charcoal/10 bg-white p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-mint/20 text-mint">
                <Icon size={20} aria-hidden="true" />
              </span>
              <p className="mt-3 text-[15px] leading-6">{text}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="想了解更多？" tone="white">
        <ScenarioLinks exclude={path} />
        <div className="mt-8">
          <CtaButton />
        </div>
      </Section>
    </PageShell>
  );
}
