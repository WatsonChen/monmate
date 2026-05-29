import Image from "next/image";
import Link from "next/link";
import { CalendarPlus, ClipboardCheck, QrCode } from "lucide-react";
import { AdminShell } from "../components/AdminShell";

export default function AdminHomePage() {
  return (
    <AdminShell>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-bold text-orange">MonMate Admin</p>
          <h1 className="text-2xl font-bold">活動報到總覽</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/events/new"
            className="flex h-11 items-center justify-center gap-2 rounded-lg bg-orange px-4 text-sm font-bold text-white"
          >
            <CalendarPlus size={18} />
            新增活動
          </Link>
          <Link
            href="/event/monmate-demo/checkin"
            className="flex h-11 items-center justify-center gap-2 rounded-lg bg-mint px-4 text-sm font-bold text-charcoal"
          >
            <QrCode size={18} />
            Demo 報到頁
          </Link>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          ["總報名", "--"],
          ["已報到", "--"],
          ["未報到", "--"]
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-charcoal/10 bg-white p-4">
            <p className="text-sm font-semibold text-charcoal/60">{label}</p>
            <p className="mt-2 text-3xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <section className="mt-5 rounded-lg border border-charcoal/10 bg-white p-5">
        <div className="grid gap-6 lg:grid-cols-[1fr_220px] lg:items-center">
          <div>
            <h2 className="text-xl font-bold">尚未選擇活動</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-charcoal/65">
              建立活動後即可匯入名單、產生報到序號與 QR Token，並在這裡查看報到狀態。
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/admin/events/new"
                className="flex h-11 items-center gap-2 rounded-lg bg-mint px-4 text-sm font-bold"
              >
                <CalendarPlus size={18} />
                建立活動
              </Link>
              <Link
                href="/admin/events"
                className="flex h-11 items-center gap-2 rounded-lg border border-charcoal/15 px-4 text-sm font-bold"
              >
                <ClipboardCheck size={18} />
                查看活動
              </Link>
            </div>
          </div>
          <Image
            src="/brand/mascot.png"
            alt="MonMate mascot"
            width={320}
            height={320}
            className="mx-auto aspect-square w-44 object-contain"
          />
        </div>
      </section>
    </AdminShell>
  );
}
