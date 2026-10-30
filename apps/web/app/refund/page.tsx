import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "../components/BrandLogo";
import { REFUND_TERMS_DATE_ZH } from "../lib/refund-terms";

export const metadata: Metadata = {
  title: "退款條款",
  description: "MonMate 點數制的退款與點數退回規則：付款後 7 日內且點數尚未使用可全額退款，已使用的點數不予退回。",
  alternates: { canonical: "/refund" },
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
        <p className="mt-3 text-sm text-charcoal/50">最後更新日期：{REFUND_TERMS_DATE_ZH}</p>

        <div className="mt-10 grid gap-8 text-sm leading-7 text-charcoal/80">
          <section>
            <h2 className="text-base font-bold text-charcoal">一、服務說明</h2>
            <p className="mt-3">
              MonMate 以點數制計費：建立活動免費，主辦方先購買點數，之後新增或匯入報名者時，每位報名者（含攜伴）扣 1 點，並可選用品牌客製化等功能（每場 50 點）。點數可跨活動使用，用不完會保留在帳號中。本條款說明購買點數後的退款與點數退回規則。
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-charcoal">二、付款退款（退回款項）</h2>
            <p className="mt-3">符合以下任一條件者，可申請退款：</p>
            <ul className="mt-3 grid gap-2 pl-5">
              <li className="list-disc">
                <strong>點數尚未使用：</strong>付款成功後 <strong>7 日內</strong>，且自該筆付款成功起，帳戶沒有任何扣點紀錄（尚未用於新增報名者、匯入名單或解鎖功能），可申請全額退款。
              </li>
              <li className="list-disc">
                <strong>服務重大瑕疵：</strong>因本服務系統故障，導致活動無法正常使用且無法於活動日前修復，可申請全額退款。
              </li>
            </ul>
            <p className="mt-3">建立活動本身不扣點，不影響上述「尚未使用」的認定。</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-charcoal">三、點數退回（已使用的點數）</h2>
            <p className="mt-3">
              點數一經用於新增報名者、匯入名單或解鎖功能，即視為服務已提供，<strong>不予退回</strong>。包含但不限於以下情況，已扣除的點數不會退回：
            </p>
            <ul className="mt-3 grid gap-2 pl-5">
              <li className="list-disc">報名者未到場，或活動因主辦方自身因素取消、延期。</li>
              <li className="list-disc">取消報名、減少攜伴人數、刪除名單或刪除活動。</li>
              <li className="list-disc">重新匯入名單時，已存在且人數未增加的報名者不會重複扣點，已扣的點數也不會因調低人數而退回。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-charcoal">四、不適用付款退款之情況</h2>
            <ul className="mt-3 grid gap-2 pl-5">
              <li className="list-disc">付款成功後已有任何扣點紀錄的部分。</li>
              <li className="list-disc">付款後超過 7 日，且無法提供服務瑕疵證明。</li>
              <li className="list-disc">因使用者操作不當導致的問題。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-charcoal">五、退款申請方式</h2>
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
            <h2 className="text-base font-bold text-charcoal">六、退款處理時間</h2>
            <p className="mt-3">
              退款申請審核通過後，款項將退回原付款方式。退款時間依金融機構作業，通常需要 <strong>7 至 14 個工作天</strong>。
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-charcoal">七、消費者保護</h2>
            <p className="mt-3">
              依《消費者保護法》規定，透過網路購買商品或服務的消費者，原則上享有收受後 7 日內解除契約的權利。本服務為線上服務，購買前會於結帳畫面提示並請您勾選同意：點數一經使用，即視為服務已提供，該已使用的部分不適用 7 日解除權；尚未使用的點數，仍可依本條款第二條申請退款。
            </p>
            <p className="mt-3">
              如對本服務有消費爭議，亦可向各地消費者服務中心申訴。
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-charcoal">八、條款修訂</h2>
            <p className="mt-3">
              本服務保留修訂本退款條款之權利，修訂後將於服務頁面公告，修訂前已付款之訂單仍適用付款當時您所同意的條款版本。
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-charcoal">九、聯絡我們</h2>
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
