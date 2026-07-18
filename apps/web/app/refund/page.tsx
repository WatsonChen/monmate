import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "../components/BrandLogo";

export const metadata: Metadata = {
  title: "退款條款 | MonMate",
};

export default function RefundPage() {
  return (
    <main className="min-h-dvh bg-paper text-charcoal">
      <header className="border-b border-charcoal/10 bg-paper/95">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href="/" className="flex items-center">
            <BrandLogo
              variant="horizontal"
              className="h-14 w-40 object-contain object-left"
            />
          </Link>
        </nav>
      </header>

      <div className="mx-auto max-w-3xl px-5 py-12">
        <p className="text-sm font-bold text-orange">法律文件</p>
        <h1 className="mt-2 text-3xl font-bold">退款條款</h1>
        <p className="mt-3 text-sm text-charcoal/50">最後更新日期：2026 年 6 月 5 日</p>

        <div className="mt-10 grid gap-8 text-sm leading-7 text-charcoal/80">
          <section>
            <h2 className="text-base font-bold text-charcoal">一、服務說明</h2>
            <p className="mt-3">
              MonMate 提供以「單場活動」為單位的報到管理服務，主辦方於付款完成後即可建立活動、匯入名單並取得報到連結。本條款說明付款後的退款申請規則。
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-charcoal">二、退款申請資格</h2>
            <p className="mt-3">符合以下條件者，可申請退款：</p>
            <ul className="mt-3 grid gap-2 pl-5">
              <li className="list-disc">
                <strong>活動尚未建立：</strong>付款成功後，若尚未使用該筆費用建立任何活動，可於付款後 <strong>7 日內</strong>申請全額退款。
              </li>
              <li className="list-disc">
                <strong>服務重大瑕疵：</strong>因本服務系統故障，導致活動無法正常使用且無法於活動日前修復，可申請全額退款。
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-charcoal">三、不適用退款之情況</h2>
            <p className="mt-3">以下情況恕不受理退款：</p>
            <ul className="mt-3 grid gap-2 pl-5">
              <li className="list-disc">活動已建立並取得報到連結，無論活動是否實際舉辦。</li>
              <li className="list-disc">活動因主辦方自身因素取消或延期。</li>
              <li className="list-disc">付款後超過 7 日且無法提供服務瑕疵證明。</li>
              <li className="list-disc">因使用者操作不當導致的問題。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-charcoal">四、退款申請方式</h2>
            <p className="mt-3">請以電子郵件聯繫我們，並提供以下資訊：</p>
            <ul className="mt-3 grid gap-2 pl-5">
              <li className="list-disc">帳號電子郵件地址</li>
              <li className="list-disc">付款日期及金額</li>
              <li className="list-disc">申請退款原因</li>
            </ul>
            <p className="mt-3">
              退款申請信箱：<a href="mailto:contact@weihui.io" className="text-orange hover:underline">contact@weihui.io</a>
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-charcoal">五、退款處理時間</h2>
            <p className="mt-3">
              退款申請審核通過後，款項將退回原付款方式。退款時間依金融機構作業，通常需要 <strong>7 至 14 個工作天</strong>。
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-charcoal">六、消費者保護</h2>
            <p className="mt-3">
              依《消費者保護法》第 19 條規定，透過網路購買數位服務之消費者，享有收受服務後 7 日內解除契約之權利（即「猶豫期」）。但使用者一經使用服務功能，即視為同意放棄猶豫期之適用。
            </p>
            <p className="mt-3">
              如對本服務有消費爭議，亦可向行政院消費者保護委員會或各地消費者服務中心申訴。
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-charcoal">七、條款修訂</h2>
            <p className="mt-3">
              本服務保留修訂本退款條款之權利，修訂後將於服務頁面公告，修訂前已付款之訂單仍適用付款當時之條款。
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-charcoal">八、聯絡我們</h2>
            <p className="mt-3">
              如您對本退款條款有任何疑問，請聯絡我們：
            </p>
            <p className="mt-2">
              電子郵件：<a href="mailto:contact@weihui.io" className="text-orange hover:underline">contact@weihui.io</a>
            </p>
          </section>
        </div>

        <div className="mt-12 border-t border-charcoal/10 pt-6 text-sm text-charcoal/50">
          <Link href="/" className="hover:text-charcoal">← 回首頁</Link>
          <span className="mx-3">·</span>
          <Link href="/privacy" className="hover:text-charcoal">隱私權條款</Link>
        </div>
      </div>
    </main>
  );
}
