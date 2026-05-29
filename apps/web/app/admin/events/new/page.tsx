import { CalendarPlus, CreditCard, QrCode } from "lucide-react";
import { AdminShell } from "../../../components/AdminShell";
import { CopyLink } from "../../../components/CopyLink";

const demoCheckInUrl = "http://localhost:3000/event/monmate-demo/checkin";

export default function AdminNewEventPage() {
  return (
    <AdminShell>
      <div>
        <p className="text-sm font-bold text-orange">新增活動</p>
        <h1 className="text-2xl font-bold">建立活動並產生報到 URL</h1>
      </div>

      <section className="mt-5 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-lg border border-charcoal/10 bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-mint/30">
              <CalendarPlus size={20} />
            </span>
            <div>
              <h2 className="text-lg font-bold">活動基本資料</h2>
              <p className="text-sm text-charcoal/60">資料會由 Express API 寫入 PostgreSQL</p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {["活動名稱", "活動 Slug", "開始時間", "地點"].map((label) => (
              <label key={label} className="text-sm font-semibold">
                {label}
                <input className="mt-2 h-11 w-full rounded-lg border border-charcoal/15 bg-paper px-3 outline-none focus:border-mint" />
              </label>
            ))}
          </div>
          <button className="mt-5 flex h-11 items-center gap-2 rounded-lg bg-orange px-4 text-sm font-bold text-white">
            <CalendarPlus size={18} />
            建立活動
          </button>
        </div>

        <div className="rounded-lg border border-charcoal/10 bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange/15 text-orange">
              <CreditCard size={20} />
            </span>
            <div>
              <h2 className="text-lg font-bold">單場儲值</h2>
              <p className="text-sm text-charcoal/60">MVP 先保留建立活動前置狀態</p>
            </div>
          </div>
          <div className="mt-5 rounded-lg border border-dashed border-charcoal/20 bg-paper p-5 text-center">
            <p className="text-2xl font-bold">單場活動</p>
            <p className="mt-1 text-sm font-semibold text-charcoal/60">建立活動權限</p>
            <button className="mt-4 h-10 rounded-lg bg-orange px-4 text-sm font-bold text-white">
              儲值建立
            </button>
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-lg border border-charcoal/10 bg-white p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-mint/30">
            <QrCode size={20} />
          </span>
          <div>
            <h2 className="text-lg font-bold">建立後的報到連結</h2>
            <p className="text-sm text-charcoal/60">可複製 URL，轉成 QR Code 或寄送給受邀客戶</p>
          </div>
        </div>
        <div className="mt-5">
          <CopyLink value={demoCheckInUrl} />
        </div>
      </section>
    </AdminShell>
  );
}
