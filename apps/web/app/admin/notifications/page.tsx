import { Send } from "lucide-react";
import { AdminShell } from "../../components/AdminShell";

export default function AdminNotificationsPage() {
  return (
    <AdminShell>
      <div>
        <p className="text-sm font-bold text-orange">寄送資訊</p>
        <h1 className="text-2xl font-bold">行前說明與報到連結</h1>
      </div>
      <section className="mt-5 rounded-lg border border-charcoal/10 bg-white p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-mint/30">
            <Send size={20} />
          </span>
          <div>
            <h2 className="text-lg font-bold">通知任務</h2>
            <p className="text-sm text-charcoal/60">MVP 先保留 email / SMS / LINE 擴充介面</p>
          </div>
        </div>
        <textarea
          className="mt-5 min-h-40 w-full rounded-lg border border-charcoal/15 bg-paper p-3 text-sm outline-none focus:border-mint"
          placeholder="輸入行前說明內容"
        />
        <button className="mt-4 h-11 rounded-lg bg-orange px-4 text-sm font-bold text-white">
          建立寄送任務
        </button>
      </section>
    </AdminShell>
  );
}
