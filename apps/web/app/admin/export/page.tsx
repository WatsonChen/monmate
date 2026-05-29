import { Download } from "lucide-react";
import { AdminShell } from "../../components/AdminShell";

export default function AdminExportPage() {
  return (
    <AdminShell>
      <div>
        <p className="text-sm font-bold text-orange">匯出報表</p>
        <h1 className="text-2xl font-bold">下載報到紀錄</h1>
      </div>
      <section className="mt-5 rounded-lg border border-charcoal/10 bg-white p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange/15 text-orange">
            <Download size={20} />
          </span>
          <div>
            <h2 className="text-lg font-bold">CSV / Excel 報表</h2>
            <p className="text-sm text-charcoal/60">包含姓名、電話、報到狀態、報到時間、報到方式</p>
          </div>
        </div>
        <button className="mt-5 h-11 rounded-lg bg-orange px-4 text-sm font-bold text-white">
          匯出報表
        </button>
      </section>
    </AdminShell>
  );
}
