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
  Smartphone
} from "lucide-react";
import { BrandLogo } from "./components/BrandLogo";

const navItems = [
  { label: "功能", href: "#features" },
  { label: "流程", href: "#flow" },
  { label: "價格", href: "#pricing" },
  { label: "FAQ", href: "#faq" }
];

const featureItems = [
  {
    title: "活動專屬報到連結",
    text: "每場活動建立後產生獨立 URL，可轉成 QR Code 或放進行前通知。",
    icon: QrCode
  },
  {
    title: "Excel 名單匯入",
    text: "匯入姓名與電話，系統自動產生報到序號與 QR token。",
    icon: FileSpreadsheet
  },
  {
    title: "手機現場報到",
    text: "工作人員用手機掃碼或輸入序號，快速核對報到結果。",
    icon: Smartphone
  },
  {
    title: "報到紀錄與匯出",
    text: "查看已報到、未報到、報到時間與方式，活動後可匯出報表。",
    icon: ClipboardCheck
  }
];

const flowItems = [
  ["單場儲值", "主辦方登入後台，為單場活動開通建立權限。", CreditCard],
  ["建立活動", "輸入活動資訊、日期、地點與活動 slug。", CalendarPlus],
  ["匯入名單", "上傳報名 Excel，產生序號與 QR token。", FileSpreadsheet],
  ["寄送連結", "複製活動報到 URL 或 QR Code，寄給受邀客戶。", Send],
  ["現場報到", "工作人員掃 QR Code 或手動輸入序號完成核銷。", CheckCircle2]
];

const faqItems = [
  ["與會者需要登入嗎？", "不需要。與會者或現場工作人員只要開啟活動專屬報到連結即可操作。"],
  ["可以先不串金流嗎？", "可以。MVP 先保留單場儲值入口與資料結構，流程確認後再串接實際付款。"],
  ["資料會不會和前端混在一起？", "不會。前端只呼叫 Express API，Prisma 與資料庫存取只存在後端。"]
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

      <section className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-6xl grid-cols-1 gap-8 px-5 py-8 md:grid-cols-[1.05fr_0.95fr] md:items-center md:py-10">
        <div className="max-w-2xl">
          <p className="text-sm font-bold text-orange">活動報到的神隊友</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">
            MonMate
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-charcoal/70">
            給主辦方使用的活動報到工具。單場儲值後建立活動、匯入名單，產生活動專屬報到連結，再把 QR Code 或 URL 寄送給受邀客戶。
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
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

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              ["單場開通", CreditCard],
              ["匯入名單", FileSpreadsheet],
              ["手機報到", Smartphone]
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

        <div className="grid gap-4 md:justify-items-center">
          <Image
            src="/brand/mascot.png"
            alt="MonMate mascot"
            width={520}
            height={520}
            className="mx-auto aspect-square w-full max-w-[280px] object-contain sm:max-w-sm"
            priority
          />
          <div className="w-full max-w-sm rounded-lg border border-charcoal/10 bg-white p-4 shadow-soft">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-mint/25">
                <CheckCircle2 size={22} />
              </span>
              <div>
                <p className="text-sm font-bold">報到成功</p>
                <p className="text-xs font-semibold text-charcoal/60">
                  王小明，電話末三碼 678
                </p>
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
              <h2 className="mt-2 text-2xl font-bold">從名單到現場報到，一條線完成</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-charcoal/65">
              不做複雜 CRM，也不拆成多套後台。MVP 先把活動建立、名單、報到、匯出這條主流程打通。
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
                <p className="mt-2 text-sm leading-6 text-charcoal/65">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="flow" className="bg-paper">
        <div className="mx-auto max-w-6xl px-5 py-12">
          <p className="text-sm font-bold text-orange">流程</p>
          <h2 className="mt-2 text-2xl font-bold">主辦方建立活動後，產生可分享的報到 URL</h2>
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
                <p className="mt-2 text-sm leading-6 text-charcoal/65">{text as string}</p>
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
              不先做訂閱制或複雜方案。主辦方需要辦活動時，儲值單場建立權限，建立後即可取得報到 URL。
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["單場開通", "適合講座、發表會、課程"],
              ["名單匯入", "姓名、電話、序號與 QR token"],
              ["紀錄匯出", "活動後整理報到報表"]
            ].map(([title, text]) => (
              <div
                key={title}
                className="rounded-lg border border-charcoal/10 bg-paper p-5"
              >
                <ShieldCheck className="text-orange" size={22} />
                <h3 className="mt-4 text-base font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-charcoal/65">{text}</p>
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
                <p className="mt-2 text-sm leading-6 text-charcoal/65">{answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
