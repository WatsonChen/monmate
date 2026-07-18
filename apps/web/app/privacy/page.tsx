import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "../components/BrandLogo";

export const metadata: Metadata = {
  title: "隱私權條款 | MonMate",
};

export default function PrivacyPage() {
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
        <h1 className="mt-2 text-3xl font-bold">隱私權條款</h1>
        <p className="mt-3 text-sm text-charcoal/50">最後更新日期：2026 年 6 月 5 日</p>

        <div className="mt-10 grid gap-8 text-sm leading-7 text-charcoal/80">
          <section>
            <h2 className="text-base font-bold text-charcoal">一、前言</h2>
            <p className="mt-3">
              MonMate（以下簡稱「本服務」）由本公司負責提供活動報到管理服務。本隱私權政策說明本服務如何蒐集、使用、保存及保護您的個人資料，請您在使用本服務前詳細閱讀。
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-charcoal">二、蒐集的資料類型</h2>
            <p className="mt-3">本服務可能蒐集以下個人資料：</p>
            <ul className="mt-3 grid gap-2 pl-5">
              <li className="list-disc">
                <strong>主辦方帳號資料：</strong>電子郵件地址、登入憑證。
              </li>
              <li className="list-disc">
                <strong>活動與名單資料：</strong>活動名稱、時間地點，以及匯入之與會者姓名、電話號碼等識別資訊。
              </li>
              <li className="list-disc">
                <strong>報到紀錄：</strong>報到時間、報到方式（掃碼或手動）。
              </li>
              <li className="list-disc">
                <strong>付款資料：</strong>本服務透過第三方金流服務商（藍新金流）處理交易，本服務不直接儲存完整信用卡號或金融帳戶資訊。
              </li>
              <li className="list-disc">
                <strong>裝置與使用紀錄：</strong>IP 位址、瀏覽器類型、存取時間等技術資訊。
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-charcoal">三、資料使用目的</h2>
            <p className="mt-3">本服務蒐集的個人資料僅用於以下目的：</p>
            <ul className="mt-3 grid gap-2 pl-5">
              <li className="list-disc">提供活動建立、名單管理、現場報到等核心服務功能。</li>
              <li className="list-disc">處理付款及開立相關紀錄。</li>
              <li className="list-disc">發送服務通知，例如簡訊報到連結。</li>
              <li className="list-disc">改善服務品質及使用者體驗。</li>
              <li className="list-disc">依法律要求配合主管機關。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-charcoal">四、資料分享與第三方</h2>
            <p className="mt-3">
              本服務不會出售您的個人資料。在以下情況下，本服務可能與第三方共享必要資訊：
            </p>
            <ul className="mt-3 grid gap-2 pl-5">
              <li className="list-disc">
                <strong>金流服務商（藍新金流）：</strong>處理付款所需之交易資訊。
              </li>
              <li className="list-disc">
                <strong>簡訊服務商：</strong>傳送報到通知所需之電話號碼。
              </li>
              <li className="list-disc">
                <strong>法律要求：</strong>依法院命令或主管機關要求提供必要資料。
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-charcoal">五、資料保存期限</h2>
            <p className="mt-3">
              本服務保存個人資料至帳號刪除或服務停止使用為止。主辦方可透過帳號設定刪除活動及相關資料。依法律義務需保存的資料，將依相關法規期限保留。
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-charcoal">六、資料安全</h2>
            <p className="mt-3">
              本服務採用業界標準之安全措施，包含 HTTPS 傳輸加密、資料庫存取控制等，以防止個人資料遭到未授權存取、洩露或竄改。
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-charcoal">七、您的權利</h2>
            <p className="mt-3">
              依據《個人資料保護法》，您對本服務持有的個人資料享有查詢、複製、補充、更正、停止蒐集使用及刪除之權利。如需行使上述權利，請透過下方聯絡方式與我們聯繫。
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-charcoal">八、Cookie 使用</h2>
            <p className="mt-3">
              本服務使用 Cookie 及類似技術以維持登入狀態及改善使用體驗。您可透過瀏覽器設定拒絕 Cookie，但部分功能可能因此受到影響。
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-charcoal">九、條款修訂</h2>
            <p className="mt-3">
              本服務保留隨時修訂本政策之權利。重大變更時，將於服務頁面公告或以電子郵件通知主辦方帳號。繼續使用本服務即代表您接受修訂後的條款。
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-charcoal">十、聯絡我們</h2>
            <p className="mt-3">
              如您對本隱私權政策有任何疑問，請聯絡我們：
            </p>
            <p className="mt-2">
              電子郵件：<a href="mailto:contact@weihui.io" className="text-orange hover:underline">contact@weihui.io</a>
            </p>
          </section>
        </div>

        <div className="mt-12 border-t border-charcoal/10 pt-6 text-sm text-charcoal/50">
          <Link href="/" className="hover:text-charcoal">← 回首頁</Link>
          <span className="mx-3">·</span>
          <Link href="/refund" className="hover:text-charcoal">退款條款</Link>
        </div>
      </div>
    </main>
  );
}
