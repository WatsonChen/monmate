import { FileSpreadsheet } from "lucide-react";
import { AdminShell } from "../../components/AdminShell";

export default function AdminImportPage() {
  return (
    <AdminShell>
      <div>
        <p className="text-sm font-bold text-orange">匯入名單</p>
        <h1 className="text-2xl font-bold">上傳報名 Excel</h1>
      </div>
      <section className="mt-5 rounded-lg border border-charcoal/10 bg-white p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange/15 text-orange">
            <FileSpreadsheet size={20} />
          </span>
          <div>
            <h2 className="text-lg font-bold">名單欄位</h2>
            <p className="text-sm text-charcoal/60">至少包含姓名、電話</p>
          </div>
        </div>
        <div className="mt-5 rounded-lg border border-dashed border-charcoal/20 bg-paper p-8 text-center text-sm font-semibold text-charcoal/65">
          Excel 上傳區
        </div>
      </section>
    </AdminShell>
  );
}
