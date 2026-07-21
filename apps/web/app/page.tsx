import type { ComponentType, CSSProperties, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BarChart3,
  CalendarPlus,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  FileSpreadsheet,
  GraduationCap,
  LayoutTemplate,
  LogIn,
  Mail,
  MessageSquareText,
  PartyPopper,
  Presentation,
  QrCode,
  Search,
  Send,
  Smartphone,
  Store,
  UserCog,
  Users,
} from "lucide-react";
import { BrandLogo } from "./components/BrandLogo";
import { FlowTimeline } from "./components/FlowTimeline";
import {
  MiniCapacityPreview,
  MiniChartPreview,
  MiniCompanionPreview,
  MiniEmailPreview,
  MiniExportPreview,
  MiniListPreview,
  MiniQrPreview,
  MiniSurveyPreview,
  MiniWebpagePreview,
} from "./components/MiniPreviews";
import { Reveal } from "./components/Reveal";

type FeatureItem = {
  title: string;
  text: string;
  icon: ComponentType<{ className?: string; size?: number }>;
  preview?: ReactNode;
};

const demoCheckInHref = "/event/monmate-demo/checkin?v=homepage-demo";

const navItems = [
  { label: "功能", href: "#features" },
  { label: "流程", href: "#flow" },
  { label: "價格", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

const heroHighlights = [
  {
    label: "QR／序號／電話報到",
    desc: "工作人員手機直接用，不用額外裝置",
    icon: QrCode,
  },
  {
    label: "開放報名或匯入名單",
    desc: "來賓自己填表，或直接匯入 Excel",
    icon: FileSpreadsheet,
  },
  {
    label: "報到後看數據",
    desc: "報到率、時段熱圖，問卷也能發",
    icon: BarChart3,
  },
];

const featureGroups: { stage: string; items: FeatureItem[] }[] = [
  {
    stage: "報名前",
    items: [
      {
        title: "一頁式活動網站",
        text: "活動名稱、時間、地點、簡介一次呈現，還能設定要收集哪些報名資訊。",
        icon: LayoutTemplate,
        preview: <MiniWebpagePreview />,
      },
      {
        title: "開放報名或匯入名單",
        text: "開放讓來賓自己填表報名，也能直接匯入 Excel／CSV 名單，支援攜伴人數。",
        icon: FileSpreadsheet,
        preview: <MiniListPreview />,
      },
      {
        title: "Email 報到通知",
        text: "系統寄送含 QR Code 的報到信給每位來賓，不用另外找工具寄信。",
        icon: Mail,
        preview: <MiniEmailPreview />,
      },
    ],
  },
  {
    stage: "報到當天",
    items: [
      {
        title: "QR／序號／電話，三種報到方式",
        text: "現場沒訊號、掃不到碼都有備案，工作人員用手機就能操作。",
        icon: QrCode,
        preview: <MiniQrPreview />,
      },
      {
        title: "人數上限彈性控制",
        text: "可以設定報名容量上限，也能開放超額報名不卡關。",
        icon: Users,
        preview: <MiniCapacityPreview />,
      },
      {
        title: "攜伴一次報到",
        text: "一組報名可以分次報到，系統自動算出剩餘可報到人數。",
        icon: CheckCircle2,
        preview: <MiniCompanionPreview />,
      },
    ],
  },
  {
    stage: "報到後",
    items: [
      {
        title: "即時數據儀表板",
        text: "報到率、性別年齡分布、報到時段熱圖，活動當下就看得到。",
        icon: BarChart3,
        preview: <MiniChartPreview />,
      },
      {
        title: "報到紀錄匯出",
        text: "CSV／XLSX 匯出報到紀錄，方便核對與後續存檔。",
        icon: ClipboardCheck,
        preview: <MiniExportPreview />,
      },
      {
        title: "活動後問卷",
        text: "自建問卷題目，報到後發送給來賓，蒐集活動回饋意見。",
        icon: MessageSquareText,
        preview: <MiniSurveyPreview />,
      },
    ],
  },
];

const teamItems: FeatureItem[] = [
  {
    title: "角色權限分工",
    text: "OWNER／ADMIN／STAFF，工作人員只看得到被指派的活動。",
    icon: UserCog,
  },
  {
    title: "多裝置同時上線",
    text: "報到桌可以擺好幾支手機，同時掃碼不衝突。",
    icon: Smartphone,
  },
  {
    title: "Google 帳號登入",
    text: "不用額外記密碼，一鍵登入後台。",
    icon: LogIn,
  },
];

const scenarioItems = [
  {
    title: "講座／發表會",
    text: "現場人數多，快速核對名單、加快報到速度。",
    icon: Presentation,
  },
  {
    title: "課程／內部訓練",
    text: "多場次、多梯次課程，出席資料好整理。",
    icon: GraduationCap,
  },
  {
    title: "品牌活動／展會",
    text: "來賓資訊需要準確核對，維持現場品牌形象。",
    icon: Store,
  },
  {
    title: "社群聚會",
    text: "不需要對外正式報名，也能簡單管理報到。",
    icon: PartyPopper,
  },
];

const flowItems = [
  {
    title: "建立活動",
    text: "設定名稱、時間、地點，決定要開放報名還是之後匯入名單。",
    icon: <CalendarPlus className="text-mint" size={24} />,
  },
  {
    title: "準備名單",
    text: "開放公開報名讓來賓自己填，或直接匯入 Excel／CSV，支援攜伴人數。",
    icon: <FileSpreadsheet className="text-mint" size={24} />,
  },
  {
    title: "寄送報到資訊",
    text: "Email 通知、複製連結或列印 QR Code，放進通知信或現場立牌。",
    icon: <Send className="text-mint" size={24} />,
  },
  {
    title: "現場報到",
    text: "工作人員用手機掃 QR Code、輸入序號或查電話完成報到。",
    icon: <CheckCircle2 className="text-mint" size={24} />,
  },
  {
    title: "報到後追蹤",
    text: "看報到率與數據、匯出報表，還能發問卷蒐集回饋。",
    icon: <BarChart3 className="text-mint" size={24} />,
  },
];

const pricingTiers = [
  { credits: "199", price: "590", perUnit: "2.97", fit: "適合小型講座、內部聚會" },
  { credits: "599", price: "790", perUnit: "1.32", fit: "適合品牌活動、發表會" },
  { credits: "999", price: "990", perUnit: "0.99", fit: "適合大型研討會、展覽" },
];

const faqItems = [
  [
    "與會者需要登入嗎？",
    "不需要。與會者或現場工作人員只要開啟活動專屬報到連結即可操作。",
  ],
  [
    "適合哪些活動？",
    "講座、課程、品牌活動、發表會、內部訓練與需要快速核對名單的現場活動都適合。",
  ],
  [
    "人次額度要怎麼算？可以跨活動使用嗎？",
    "額度是儲值到帳號，不限定單一活動；新增或匯入報名者時依實際人數扣除，用多少扣多少，可以分次用在不同活動。",
  ],
  [
    "同事可以一起顧報到桌嗎？",
    "可以。主辦方能新增工作人員帳號並指定負責的活動，支援多裝置同時登入，各自只看得到被指派的活動。",
  ],
  [
    "活動結束後可以整理資料嗎？",
    "可以查看報到狀態、時間與方式，並匯出報表提供後續統計或對帳使用。",
  ],
  [
    "活動後可以做問卷調查嗎？",
    "可以，後台能自建問卷題目，報到後由主辦方發送給來賓填寫，蒐集活動回饋。",
  ],
];

export default function HomePage() {
  return (
    <main className="min-h-dvh bg-paper text-charcoal">
      <header className="sticky top-0 z-20 border-b border-charcoal/10 bg-paper/95 backdrop-blur">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href="/" className="flex items-center">
            <BrandLogo
              variant="horizontal"
              className="h-14 w-40 object-contain object-left"
            />
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-bold text-charcoal/70 hover:text-charcoal"
              >
                {item.label}
              </a>
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

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-5 py-8 md:min-h-[calc(100svh-4rem)] md:grid-cols-[1.05fr_0.95fr] md:items-center md:py-10">
        <div className="relative max-w-2xl overflow-hidden pb-2 md:overflow-visible md:pb-0">
          <div className="relative z-10 max-w-[68%] sm:max-w-[60%] md:max-w-none">
            <p className="text-sm font-bold text-orange">MonMate・活動報到系統</p>
            <h1 className="mt-3 text-5xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
              活動報到，從報名到現場一次搞定
            </h1>
            <p className="mt-5 text-base leading-7 text-charcoal/70 md:max-w-xl">
              建立活動、開放報名或匯入名單，產生報到連結；現場用手機掃
              QR Code、輸入序號或查電話完成報到，事後還有數據與問卷追蹤成效。
            </p>
          </div>

          <Image
            src="/brand/mascot-mobile.png"
            alt="MonMate mascot"
            width={280}
            height={280}
            className="mascot-float absolute right-0 top-4 z-0 w-[170px] object-contain sm:-right-4 sm:w-[220px] md:hidden"
            priority
            unoptimized
          />

          <div className="relative z-10 mt-7 flex flex-wrap gap-3">
            <Link
              href="/admin/login"
              className="flex h-12 items-center gap-2 rounded-full bg-orange px-5 text-sm font-semibold text-white shadow-soft"
            >
              <CalendarPlus size={18} />
              登入建立活動
            </Link>
            <Link
              href={demoCheckInHref}
              className="flex h-12 items-center gap-2 rounded-full bg-mint px-5 text-sm font-semibold text-charcoal"
            >
              <QrCode size={18} />
              查看報到 Demo
            </Link>
          </div>

          <div className="relative z-10 mt-8 grid gap-3 sm:grid-cols-3">
            {heroHighlights.map((card, index) => (
              <Reveal key={card.label} delay={index * 100} className="h-full">
                <div className="h-full rounded-lg border border-charcoal/10 bg-white p-4">
                  <card.icon className="text-orange" size={22} />
                  <p className="mt-3 text-sm font-bold">{card.label}</p>
                  <p className="mt-1 text-xs leading-5 text-charcoal/55">
                    {card.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="hidden md:flex md:justify-center">
          <div className="mascot-float relative w-full min-w-[320px] max-w-[480px]">
            <Image
              src="/brand/mascot-phone.png"
              alt="MonMate mascot holding a phone"
              width={447}
              height={558}
              className="h-auto w-full object-contain"
              priority
              unoptimized
            />

            <div className="absolute left-[10.5%] top-[39%] h-[47%] w-[29%] overflow-hidden px-[clamp(4px,1vw,8px)] py-[clamp(6px,1.4vw,10px)]">
              <span
                className="success-firework left-3 top-24 h-3 w-1"
                style={{ "--rotate": "-44deg" } as CSSProperties}
              />
              <span
                className="success-firework right-4 top-24 h-3 w-1"
                style={{ "--delay": "0.45s", "--rotate": "40deg" } as CSSProperties}
              />
              <span
                className="success-spark right-4 top-36 h-2 w-2"
                style={{ "--delay": "0.25s" } as CSSProperties}
              />

              <div className="relative z-10 flex h-full flex-col items-center text-center">
                <BrandLogo
                  variant="horizontal"
                  className="h-[clamp(18px,3vw,26px)] w-[clamp(60px,9vw,82px)] object-contain"
                />
                <p className="mt-[clamp(8px,1.8vw,14px)] text-[clamp(10px,1.45vw,13px)] font-bold">
                  來賓報到
                </p>
                <p className="mt-0.5 whitespace-nowrap text-[clamp(7px,1vw,9px)] font-semibold text-charcoal/55">
                  2026 MonMate 年度峰會
                </p>

                <div className="mt-[clamp(12px,2.2vw,18px)] flex h-[clamp(38px,6vw,52px)] w-[clamp(38px,6vw,52px)] items-center justify-center rounded-full bg-mint shadow-soft">
                  <CheckCircle2
                    className="h-[62%] w-[62%] text-white"
                    strokeWidth={2.8}
                  />
                </div>

                <h3 className="mt-[clamp(10px,2vw,16px)] whitespace-nowrap text-[clamp(12px,1.8vw,16px)] font-bold">
                  報到成功！
                </h3>
                <p className="mt-0.5 whitespace-nowrap text-[clamp(7px,1vw,9px)] font-semibold text-charcoal/55">
                  王小明，電話末三碼 678
                </p>

                <div className="mt-auto grid w-full gap-[clamp(4px,0.9vw,7px)] pt-[clamp(8px,1.6vw,14px)]">
                  <Link
                    href={demoCheckInHref}
                    className="flex h-[clamp(20px,3vw,28px)] items-center justify-center rounded-full bg-orange text-[clamp(8px,1.1vw,10px)] font-semibold text-white shadow-soft"
                  >
                    下一位來賓
                  </Link>
                  <Link
                    href="/admin"
                    className="flex h-[clamp(20px,3vw,28px)] items-center justify-center rounded-full border border-orange/35 bg-white text-[clamp(8px,1.1vw,10px)] font-semibold text-charcoal/70"
                  >
                    查看報到紀錄
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="border-y border-charcoal/10 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-12">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold text-orange">功能</p>
              <h2 className="mt-2 text-2xl font-bold">
                從報名、報到到事後追蹤，一次講清楚
              </h2>
            </div>
            <p className="text-sm leading-6 text-charcoal/65 sm:whitespace-nowrap">
              專注在主辦方最常遇到的現場問題：名單太散、報到排隊、報到後難整理。
            </p>
          </div>

          <div className="mt-10 space-y-10">
            {featureGroups.map((group) => (
              <div key={group.stage}>
                <p className="text-sm font-bold text-orange">{group.stage}</p>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  {group.items.map((item, index) => (
                    <Reveal key={item.title} delay={index * 100} className="h-full">
                      <div className="h-full rounded-lg border border-charcoal/10 bg-paper p-5">
                        <item.icon className="text-orange" size={24} />
                        <h3 className="mt-4 text-base font-bold">{item.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-charcoal/65">
                          {item.text}
                        </p>
                        {item.preview && <div className="mt-4">{item.preview}</div>}
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-12 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <div>
            <p className="text-sm font-bold text-orange">團隊</p>
            <h2 className="mt-2 text-2xl font-bold">不只你一個人顧報到桌</h2>
            <p className="mt-3 text-sm leading-6 text-charcoal/65">
              邀請工作人員一起顧現場，各自登入、只看得到被指派的活動，報到紀錄清楚不會互相干擾。
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {teamItems.map((item, index) => (
              <Reveal key={item.title} delay={index * 100} className="h-full">
                <div className="h-full rounded-lg border border-charcoal/10 bg-white p-5">
                  <item.icon className="text-orange" size={22} />
                  <h3 className="mt-4 text-base font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-charcoal/65">
                    {item.text}
                  </p>
                  {item.preview && <div className="mt-4">{item.preview}</div>}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-5 py-12">
          <div className="text-center">
            <p className="text-sm font-bold text-orange">適用場景</p>
            <h2 className="mt-2 text-2xl font-bold">這些場合都適合用 MonMate</h2>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {scenarioItems.map((item, index) => (
              <Reveal key={item.title} delay={index * 100} className="h-full">
                <div className="h-full rounded-lg border border-charcoal/10 bg-paper p-5 text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-mint/15">
                    <item.icon className="text-mint" size={22} />
                  </span>
                  <h3 className="mt-4 text-base font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-charcoal/65">
                    {item.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="flow" className="bg-paper">
        <div className="mx-auto max-w-6xl px-5 py-12">
          <p className="text-sm font-bold text-orange">流程</p>
          <h2 className="mt-2 text-2xl font-bold">
            主辦方建立活動後，產生可分享的報到 URL
          </h2>
          <div className="mt-8">
            <FlowTimeline steps={flowItems} />
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-12 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <div>
            <p className="text-sm font-bold text-orange">價格</p>
            <h2 className="mt-2 text-2xl font-bold">儲值人次額度，用多少扣多少</h2>
            <p className="mt-3 text-sm leading-6 text-charcoal/65">
              先依需求購買人次額度，之後新增或匯入報名者才會從額度扣抵；額度可以跨活動使用，不用每辦一場活動就重新開通，建立活動本身不額外收費。
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {pricingTiers.map((tier, index) => (
              <Reveal key={tier.credits} delay={index * 100} className="h-full">
                <div className="h-full rounded-lg border border-charcoal/10 bg-paper p-5">
                  <CreditCard className="text-orange" size={22} />
                  <p className="mt-4 text-2xl font-bold">NT$ {tier.price}</p>
                  <p className="mt-1 text-sm font-semibold text-charcoal/60">
                    {tier.credits} 人次・約 NT$ {tier.perUnit} / 人
                  </p>
                  <p className="mt-3 text-sm leading-6 text-charcoal/65">
                    {tier.fit}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="bg-paper">
        <div className="mx-auto max-w-6xl px-5 py-12">
          <p className="text-sm font-bold text-orange">FAQ</p>
          <h2 className="mt-2 text-2xl font-bold">常見問題</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {faqItems.map(([question, answer], index) => (
              <Reveal key={question} delay={(index % 3) * 100} className="h-full">
                <div className="h-full rounded-lg border border-charcoal/10 bg-white p-5">
                  <Search className="text-mint" size={22} />
                  <h3 className="mt-4 text-base font-bold">{question}</h3>
                  <p className="mt-2 text-sm leading-6 text-charcoal/65">
                    {answer}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-charcoal/10 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
          <div>
            <BrandLogo
              variant="horizontal"
              className="h-16 w-44 object-contain object-left"
            />
            <p className="mt-4 max-w-md text-sm leading-6 text-charcoal/65">
              MonMate
              致力於讓活動報到變得簡單、快速、好整理，成為主辦方與現場工作人員的神隊友。
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold">產品</h3>
            <div className="mt-3 grid gap-2 text-sm font-semibold text-charcoal/65">
              <a href="#features" className="hover:text-charcoal">
                功能
              </a>
              <a href="#flow" className="hover:text-charcoal">
                流程
              </a>
              <a href="#pricing" className="hover:text-charcoal">
                價格
              </a>
              <a href="#faq" className="hover:text-charcoal">
                FAQ
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold">開始使用</h3>
            <div className="mt-3 grid gap-2 text-sm font-semibold text-charcoal/65">
              <Link href="/admin/login" className="hover:text-charcoal">
                登入後台
              </Link>
              <Link href="/admin/login" className="hover:text-charcoal">
                建立活動
              </Link>
              <Link href={demoCheckInHref} className="hover:text-charcoal">
                查看 Demo
              </Link>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold">條款與政策</h3>
            <div className="mt-3 grid gap-2 text-sm font-semibold text-charcoal/65">
              <Link href="/privacy" className="hover:text-charcoal">
                隱私權條款
              </Link>
              <Link href="/refund" className="hover:text-charcoal">
                退款條款
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-charcoal/10 px-5 py-4">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 text-xs font-semibold text-charcoal/50 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 MonMate. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="/privacy" className="hover:text-charcoal">隱私權條款</Link>
              <Link href="/refund" className="hover:text-charcoal">退款條款</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
