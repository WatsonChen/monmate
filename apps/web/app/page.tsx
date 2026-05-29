import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarPlus,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  FileSpreadsheet,
  QrCode,
  Search,
  Send,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { BrandLogo } from "./components/BrandLogo";

const navItems = [
  { label: "功能", href: "#features" },
  { label: "流程", href: "#flow" },
  { label: "價格", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

const featureItems = [
  {
    title: "活動專屬報到連結",
    text: "每場活動都有獨立報到頁，可轉成 QR Code 或放進行前通知寄出。",
    icon: QrCode,
  },
  {
    title: "Excel 名單匯入",
    text: "上傳名單後自動整理報到資訊，減少手動核對與重複建檔。",
    icon: FileSpreadsheet,
  },
  {
    title: "手機現場報到",
    text: "現場工作人員用手機掃碼或輸入序號，即可完成核銷。",
    icon: Smartphone,
  },
  {
    title: "報到紀錄與匯出",
    text: "查看已報到、未報到、報到時間與方式，活動後可匯出報表。",
    icon: ClipboardCheck,
  },
];

const flowItems = [
  ["單場開通", "依活動需求開通單場使用，不需要先綁長約。", CreditCard],
  ["建立活動", "輸入活動名稱、時間、地點，建立活動報到頁。", CalendarPlus],
  [
    "匯入名單",
    "上傳報名名單，讓每位來賓都有可辨識的報到資訊。",
    FileSpreadsheet,
  ],
  ["寄送連結", "複製活動報到連結或 QR Code，放進通知信、簡訊或 LINE。", Send],
  ["現場報到", "工作人員掃 QR Code 或手動輸入序號完成核銷。", CheckCircle2],
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
    "活動結束後可以整理資料嗎？",
    "可以查看報到狀態、時間與方式，並匯出報表提供後續統計或對帳使用。",
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
              className="hidden h-10 items-center rounded-lg border border-charcoal/15 px-4 text-sm font-bold sm:flex"
            >
              登入
            </Link>
            <Link
              href="/admin"
              className="flex h-10 items-center rounded-lg bg-orange px-4 text-sm font-bold text-white"
            >
              建立活動
            </Link>
          </div>
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-5 py-8 md:min-h-[calc(100svh-4rem)] md:grid-cols-[1.05fr_0.95fr] md:items-center md:py-10">
        <div className="relative max-w-2xl overflow-hidden pb-2 md:overflow-visible md:pb-0">
          <div className="relative z-10 max-w-[68%] sm:max-w-[60%] md:max-w-none">
            <p className="text-sm font-bold text-orange">活動報到的神隊友</p>
            <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">
              MonMate
            </h1>
            <p className="mt-5 text-base leading-7 text-charcoal/70 md:max-w-xl">
              給主辦方使用的活動報到工具。單場儲值後建立活動、匯入名單，產生活動專屬報到連結，再把
              QR Code 或 URL 寄送給受邀客戶。
            </p>
          </div>

          <Image
            src="/brand/mascot-mobile.png"
            alt="MonMate mascot"
            width={280}
            height={280}
            className="absolute right-0 top-4 z-0 w-[170px] object-contain sm:-right-4 sm:w-[220px] md:hidden"
            priority
            unoptimized
          />

          <div className="relative z-10 mt-7 flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="flex h-12 items-center gap-2 rounded-lg bg-orange px-5 text-sm font-bold text-white shadow-soft"
            >
              <CalendarPlus size={18} />
              登入建立活動
            </Link>
            <Link
              href="/event/monmate-demo/checkin"
              className="flex h-12 items-center gap-2 rounded-lg bg-mint px-5 text-sm font-bold text-charcoal"
            >
              <QrCode size={18} />
              查看報到 Demo
            </Link>
          </div>

          <div className="relative z-10 mt-8 grid gap-3 sm:grid-cols-3">
            {[
              ["單場開通", CreditCard],
              ["匯入名單", FileSpreadsheet],
              ["手機報到", Smartphone],
            ].map(([label, Icon]) => (
              <div
                key={label as string}
                className="rounded-lg border border-charcoal/10 bg-white p-4"
              >
                <Icon className="text-orange" size={22} />
                <p className="mt-3 text-sm font-bold">{label as string}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden md:flex md:justify-center">
          <div className="relative w-full min-w-[320px] max-w-[480px]">
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
                    href="/event/monmate-demo/checkin"
                    className="flex h-[clamp(20px,3vw,28px)] items-center justify-center rounded-md bg-orange text-[clamp(8px,1.1vw,10px)] font-bold text-white shadow-soft"
                  >
                    下一位來賓
                  </Link>
                  <Link
                    href="/admin"
                    className="flex h-[clamp(20px,3vw,28px)] items-center justify-center rounded-md border border-orange/35 bg-white text-[clamp(8px,1.1vw,10px)] font-bold text-charcoal/70"
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
                從名單到現場報到，一條線完成
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-charcoal/65">
              專注在主辦方最常遇到的現場問題：名單太散、排隊太久、報到後難整理。
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {featureItems.map((item) => (
              <div
                key={item.title}
                className="rounded-lg border border-charcoal/10 bg-paper p-5"
              >
                <item.icon className="text-orange" size={24} />
                <h3 className="mt-4 text-base font-bold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-charcoal/65">
                  {item.text}
                </p>
              </div>
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
          <div className="mt-8 grid gap-3 lg:grid-cols-5">
            {flowItems.map(([title, text, Icon], index) => (
              <div
                key={title as string}
                className="rounded-lg border border-charcoal/10 bg-white p-5"
              >
                <div className="flex items-center justify-between">
                  <Icon className="text-mint" size={24} />
                  <span className="text-xs font-bold text-charcoal/35">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-bold">{title as string}</h3>
                <p className="mt-2 text-sm leading-6 text-charcoal/65">
                  {text as string}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-12 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <div>
            <p className="text-sm font-bold text-orange">價格</p>
            <h2 className="mt-2 text-2xl font-bold">先以單場活動付費為主</h2>
            <p className="mt-3 text-sm leading-6 text-charcoal/65">
              需要辦活動時再開通單場使用，建立活動後即可取得報到連結，適合不固定辦活動的團隊。
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["單場開通", "適合講座、發表會、課程"],
              ["名單匯入", "快速整理來賓姓名與聯絡資訊"],
              ["紀錄匯出", "活動後整理報到報表"],
            ].map(([title, text]) => (
              <div
                key={title}
                className="rounded-lg border border-charcoal/10 bg-paper p-5"
              >
                <ShieldCheck className="text-orange" size={22} />
                <h3 className="mt-4 text-base font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-charcoal/65">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="bg-paper">
        <div className="mx-auto max-w-6xl px-5 py-12">
          <p className="text-sm font-bold text-orange">FAQ</p>
          <h2 className="mt-2 text-2xl font-bold">常見問題</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {faqItems.map(([question, answer]) => (
              <div
                key={question}
                className="rounded-lg border border-charcoal/10 bg-white p-5"
              >
                <Search className="text-mint" size={22} />
                <h3 className="mt-4 text-base font-bold">{question}</h3>
                <p className="mt-2 text-sm leading-6 text-charcoal/65">
                  {answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-charcoal/10 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
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
              <Link href="/admin" className="hover:text-charcoal">
                建立活動
              </Link>
              <Link
                href="/event/monmate-demo/checkin"
                className="hover:text-charcoal"
              >
                查看 Demo
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-charcoal/10 px-5 py-4">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 text-xs font-semibold text-charcoal/50 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 MonMate. All rights reserved.</p>
            <p>活動報到的神隊友</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
