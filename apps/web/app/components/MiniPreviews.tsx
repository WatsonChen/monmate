import { Download, LogIn, Mail, Smartphone, Star } from "lucide-react";

const qrPattern = [
  [1, 1, 1, 0, 1, 1, 1],
  [1, 0, 1, 0, 1, 0, 1],
  [1, 1, 1, 0, 1, 1, 1],
  [0, 0, 0, 1, 0, 0, 0],
  [1, 1, 0, 1, 0, 1, 1],
  [1, 0, 1, 0, 1, 0, 1],
  [1, 1, 1, 0, 1, 1, 1],
];

export function MiniListPreview() {
  return (
    <div className="flex min-h-32 w-full flex-col justify-center rounded-lg border border-charcoal/10 bg-white p-3">
      <div className="space-y-2">
        {[70, 55, 62].map((width, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="h-5 w-5 shrink-0 rounded-full bg-mint/30" />
            <span
              className="h-2 rounded-full bg-charcoal/10"
              style={{ width: `${width}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-bold text-orange">
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-orange/15">
          ↑
        </span>
        匯入 Excel
      </div>
    </div>
  );
}

export function MiniQrPreview() {
  return (
    <div className="flex min-h-32 w-full items-center gap-3 rounded-lg border border-charcoal/10 bg-white p-3">
      <div className="grid shrink-0 grid-cols-7 gap-[1.5px] rounded bg-charcoal p-1.5">
        {qrPattern.flat().map((cell, index) => (
          <span
            key={index}
            className={`h-[3px] w-[3px] ${cell ? "bg-white" : "bg-transparent"}`}
          />
        ))}
      </div>
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-mint">
        <span className="text-xs font-bold text-white">✓</span>
      </div>
      <p className="text-[11px] font-semibold text-charcoal/50">1 秒完成報到</p>
    </div>
  );
}

export function MiniCapacityPreview() {
  return (
    <div className="flex min-h-32 w-full flex-col justify-center rounded-lg border border-charcoal/10 bg-white p-3">
      <div className="flex items-center justify-between text-[11px] font-semibold text-charcoal/50">
        <span>報名容量</span>
        <span className="font-bold text-charcoal">164 / 200</span>
      </div>
      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-charcoal/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-mint to-orange"
          style={{ width: "82%" }}
        />
      </div>
    </div>
  );
}

export function MiniTeamPreview() {
  const colors = ["bg-orange", "bg-mint", "bg-charcoal/70"];
  return (
    <div className="flex min-h-32 w-full items-center gap-3 rounded-lg border border-charcoal/10 bg-white p-3">
      <div className="flex -space-x-2">
        {colors.map((color, index) => (
          <span
            key={index}
            className={`h-7 w-7 rounded-full border-2 border-white ${color}`}
          />
        ))}
        <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-charcoal/10 text-[10px] font-bold text-charcoal/60">
          +2
        </span>
      </div>
      <p className="text-[11px] font-semibold text-charcoal/50">
        5 位工作人員同時上線
      </p>
    </div>
  );
}

export function MiniWebpagePreview() {
  return (
    <div className="flex min-h-32 w-full flex-col justify-center rounded-lg border border-charcoal/10 bg-white p-3">
      <div className="h-2 w-2/3 rounded-full bg-charcoal/20" />
      <div className="mt-2.5 space-y-1.5">
        <div className="h-1.5 w-full rounded-full bg-charcoal/10" />
        <div className="h-1.5 w-4/5 rounded-full bg-charcoal/10" />
      </div>
      <div className="mt-3 inline-flex h-5 items-center rounded-full bg-orange px-2.5 text-[10px] font-bold text-white">
        立即報名
      </div>
    </div>
  );
}

export function MiniEmailPreview() {
  return (
    <div className="flex min-h-32 w-full items-center gap-3 rounded-lg border border-charcoal/10 bg-white p-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange/15">
        <Mail className="text-orange" size={18} />
      </span>
      <div className="flex-1 space-y-1.5">
        <div className="h-1.5 w-4/5 rounded-full bg-charcoal/10" />
        <div className="h-1.5 w-3/5 rounded-full bg-charcoal/10" />
      </div>
    </div>
  );
}

export function MiniCompanionPreview() {
  return (
    <div className="flex min-h-32 w-full items-center justify-between rounded-lg border border-charcoal/10 bg-white p-3">
      <div className="flex -space-x-1.5">
        <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-mint text-[9px] font-bold text-white">
          ✓
        </span>
        <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-charcoal/10 text-[9px] font-bold text-charcoal/40">
          2
        </span>
      </div>
      <span className="text-[11px] font-bold text-charcoal/60">1 / 2 已報到</span>
    </div>
  );
}

export function MiniChartPreview() {
  const bars = [30, 55, 80, 60, 40];
  return (
    <div className="flex min-h-32 w-full flex-col justify-center rounded-lg border border-charcoal/10 bg-white p-3">
      <div className="flex h-10 items-end gap-1">
        {bars.map((height, index) => (
          <div
            key={index}
            className="flex-1 rounded-t-sm bg-gradient-to-t from-orange to-mint"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
      <p className="mt-2 text-[10px] font-bold text-charcoal/50">報到率 82%</p>
    </div>
  );
}

export function MiniExportPreview() {
  return (
    <div className="flex min-h-32 w-full items-center gap-3 rounded-lg border border-charcoal/10 bg-white p-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-mint/20">
        <Download className="text-mint" size={18} />
      </span>
      <p className="text-[11px] font-semibold text-charcoal/50">
        報到紀錄.xlsx
      </p>
    </div>
  );
}

export function MiniSurveyPreview() {
  return (
    <div className="flex min-h-32 w-full flex-col justify-center rounded-lg border border-charcoal/10 bg-white p-3">
      <p className="text-[10px] font-semibold text-charcoal/50">整體滿意度</p>
      <div className="mt-1.5 flex gap-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            size={14}
            className={index < 4 ? "fill-orange text-orange" : "text-charcoal/15"}
          />
        ))}
      </div>
    </div>
  );
}

export function MiniDevicePreview() {
  return (
    <div className="flex min-h-32 w-full items-center gap-3 rounded-lg border border-charcoal/10 bg-white p-3">
      <div className="flex items-center gap-1.5">
        <Smartphone size={20} className="text-mint" />
        <Smartphone size={20} className="text-orange" />
      </div>
      <p className="text-[11px] font-semibold text-charcoal/50">
        2 台裝置同時掃碼
      </p>
    </div>
  );
}

export function MiniLoginPreview() {
  return (
    <div className="flex min-h-32 w-full items-center gap-3 rounded-lg border border-charcoal/10 bg-white p-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-charcoal/5">
        <LogIn className="text-charcoal/60" size={16} />
      </span>
      <div className="flex h-7 flex-1 items-center rounded-md border border-charcoal/15 px-2 text-[10px] font-semibold text-charcoal/50">
        一鍵登入後台
      </div>
    </div>
  );
}
