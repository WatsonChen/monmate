import Link from "next/link";
import { CalendarPlus, ClipboardCheck, QrCode, Search } from "lucide-react";
import { AdminShell } from "../../components/AdminShell";
import { CopyLink } from "../../components/CopyLink";

const demoCheckInUrl = "http://localhost:3000/event/monmate-demo/checkin";

export default function AdminEventsPage() {
  return (
    <AdminShell>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-bold text-orange">活動列表</p>
          <h1 className="text-2xl font-bold">管理活動與報到連結</h1>
        </div>
        <Link
          href="/admin/events/new"
          className="flex h-11 items-center justify-center gap-2 rounded-lg bg-orange px-4 text-sm font-bold text-white"
        >
          <CalendarPlus size={18} />
          新增活動
        </Link>
      </div>

      <section className="mt-5 rounded-lg border border-charcoal/10 bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-mint/30">
              <ClipboardCheck size={20} />
            </span>
            <div>
              <h2 className="text-lg font-bold">MonMate Demo 活動</h2>
              <p className="text-sm text-charcoal/60">slug: monmate-demo</p>
            </div>
          </div>
          <Link
            href="/event/monmate-demo/checkin"
            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-mint px-4 text-sm font-bold"
          >
            <QrCode size={18} />
            開啟報到頁
          </Link>
        </div>
        <div className="mt-5">
          <CopyLink value={demoCheckInUrl} />
        </div>
      </section>

      <section className="mt-5 rounded-lg border border-charcoal/10 bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold">活動資料</h2>
          <div className="flex h-10 items-center gap-2 rounded-lg border border-charcoal/15 bg-paper px-3">
            <Search size={16} />
            <input
              className="w-full bg-transparent text-sm outline-none"
              placeholder="搜尋活動名稱 / slug"
            />
          </div>
        </div>
        <div className="mt-5 overflow-x-auto">
          <div className="min-w-[680px] overflow-hidden rounded-lg border border-charcoal/10">
            <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] bg-cloud px-4 py-3 text-sm font-bold">
              <span>活動</span>
              <span>報名</span>
              <span>報到</span>
              <span>狀態</span>
            </div>
            <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] px-4 py-4 text-sm">
              <span className="font-bold">MonMate Demo 活動</span>
              <span>5</span>
              <span>0</span>
              <span className="font-bold text-orange">測試中</span>
            </div>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
