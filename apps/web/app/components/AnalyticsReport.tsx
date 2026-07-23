export type Analytics = {
  eventId: string;
  eventName: string;
  total: number;
  checkedIn: number;
  notCheckedIn: number;
  totalRegistered: number;
  totalCheckedInCount: number;
  checkInRate: number;
  ageGroups: Record<string, number>;
  genderCounts: Record<string, number>;
  checkInByHour: Record<number, number>;
  checkInMethods: Record<string, number>;
  customFieldBreakdown: Record<string, { label: string; counts: Record<string, number> }>;
};

const GENDER_LABELS: Record<string, string> = { M: "男", F: "女", OTHER: "其他" };
const GENDER_COLORS: Record<string, string> = { M: "#8EE6C1", F: "#FF7231", OTHER: "#9CA39E" };

const CHECK_IN_METHOD_LABELS: Record<string, string> = {
  QR_CODE: "QR Code",
  MANUAL_CODE: "序號",
  PHONE: "電話"
};
const CHECK_IN_METHOD_COLORS: Record<string, string> = {
  QR_CODE: "#8EE6C1",
  MANUAL_CODE: "#FF7231",
  PHONE: "#1A2421"
};

// Cycled through for custom-field option charts, since option values are
// user-defined and can't be mapped to a fixed color ahead of time.
const CHART_PALETTE = ["#8EE6C1", "#FF7231", "#1A2421", "#C2F2DC", "#FFB68F", "#7A8C85"];

// Matches the fixed buckets computed in event.service.ts. A plain string
// sort happens to land in the right order for these five today, but that's
// coincidental (single-digit leading characters) — pin the order explicitly
// so it can't silently break if the buckets ever change.
const AGE_GROUP_ORDER = ["18歲以下", "20-29", "30-39", "40-49", "50歲以上"];

function sortAgeGroupEntries(entries: [string, number][]) {
  return [...entries].sort(([a], [b]) => {
    const ai = AGE_GROUP_ORDER.indexOf(a);
    const bi = AGE_GROUP_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

function DonutChart({
  data
}: {
  data: { label: string; value: number; color: string }[];
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return null;

  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  let cumulative = 0;

  return (
    <svg viewBox="0 0 100 100" className="h-28 w-28 shrink-0">
      <g transform="rotate(-90 50 50)">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#1A2421" strokeOpacity="0.08" strokeWidth="14" />
        {data.map((d) => {
          if (d.value === 0) return null;
          const fraction = d.value / total;
          const dash = fraction * circumference;
          const offset = -cumulative * circumference;
          cumulative += fraction;
          return (
            <circle
              key={d.label}
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={d.color}
              strokeWidth="14"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={offset}
            />
          );
        })}
      </g>
      <text x="50" y="50" textAnchor="middle" dominantBaseline="central" className="fill-charcoal text-[20px] font-bold">
        {total}
      </text>
    </svg>
  );
}

export function AnalyticsReport({ analytics }: { analytics: Analytics }) {
  return (
    <div className="space-y-5">
      <div className="mb-2 hidden print:block">
        <h2 className="text-xl font-bold">{analytics.eventName}</h2>
        <p className="text-xs text-charcoal/60">
          活動數據摘要報告 · 產生於 {new Date().toLocaleString("zh-TW")}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "報名（組）", value: analytics.total },
          { label: "報名總人數", value: analytics.totalRegistered },
          { label: "實際報到人數", value: analytics.totalCheckedInCount },
          { label: "報到率", value: `${analytics.checkInRate}%` }
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-charcoal/10 bg-white p-4 text-center print:break-inside-avoid">
            <p className="text-2xl font-bold">{item.value}</p>
            <p className="text-xs text-charcoal/60">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {Object.keys(analytics.genderCounts).length > 0 && (() => {
          const genderEntries = Object.entries(analytics.genderCounts);
          const genderTotal = genderEntries.reduce((sum, [, c]) => sum + c, 0);
          return (
            <div className="rounded-lg border border-charcoal/10 bg-white p-5 print:break-inside-avoid">
              <h2 className="mb-3 text-sm font-bold">性別分佈</h2>
              <div className="mx-auto flex max-w-xs items-center gap-6">
                <DonutChart
                  data={genderEntries.map(([g, count]) => ({
                    label: g,
                    value: count,
                    color: GENDER_COLORS[g] ?? "#9CA39E"
                  }))}
                />
                <div className="flex-1 space-y-2">
                  {genderEntries.map(([g, count]) => (
                    <div key={g} className="flex items-center gap-2 text-sm">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: GENDER_COLORS[g] ?? "#9CA39E" }}
                      />
                      <span className="flex-1 font-semibold">{GENDER_LABELS[g] ?? g}</span>
                      <span className="text-charcoal/60">{count}</span>
                      <span className="w-10 text-right text-xs text-charcoal/40">
                        {genderTotal > 0 ? Math.round((count / genderTotal) * 100) : 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        {Object.keys(analytics.checkInMethods).length > 0 && (() => {
          const methodEntries = Object.entries(analytics.checkInMethods);
          const methodTotal = methodEntries.reduce((sum, [, c]) => sum + c, 0);
          return (
            <div className="rounded-lg border border-charcoal/10 bg-white p-5 print:break-inside-avoid">
              <h2 className="mb-3 text-sm font-bold">報到方式分佈</h2>
              <div className="mx-auto flex max-w-xs items-center gap-6">
                <DonutChart
                  data={methodEntries.map(([m, count]) => ({
                    label: m,
                    value: count,
                    color: CHECK_IN_METHOD_COLORS[m] ?? "#9CA39E"
                  }))}
                />
                <div className="flex-1 space-y-2">
                  {methodEntries.map(([m, count]) => (
                    <div key={m} className="flex items-center gap-2 text-sm">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: CHECK_IN_METHOD_COLORS[m] ?? "#9CA39E" }}
                      />
                      <span className="flex-1 font-semibold">{CHECK_IN_METHOD_LABELS[m] ?? m}</span>
                      <span className="text-charcoal/60">{count}</span>
                      <span className="w-10 text-right text-xs text-charcoal/40">
                        {methodTotal > 0 ? Math.round((count / methodTotal) * 100) : 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {Object.keys(analytics.ageGroups).length > 0 && (
        <div className="rounded-lg border border-charcoal/10 bg-white p-5 print:break-inside-avoid">
          <h2 className="mb-3 text-sm font-bold">年齡分佈</h2>
          <div className="space-y-2">
            {sortAgeGroupEntries(Object.entries(analytics.ageGroups)).map(([group, count]) => (
              <div key={group} className="flex items-center gap-3">
                <span className="w-20 text-xs text-charcoal/60">{group}</span>
                <div className="flex-1 rounded-full bg-charcoal/10 h-5">
                  <div
                    className="h-5 rounded-full bg-orange"
                    style={{ width: `${analytics.total > 0 ? (count / analytics.total) * 100 : 0}%` }}
                  />
                </div>
                <span className="w-6 text-right text-xs font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {Object.keys(analytics.customFieldBreakdown).length > 0 && (
        <div className="grid gap-5 md:grid-cols-2">
          {Object.entries(analytics.customFieldBreakdown).map(([key, field]) => {
            const entries = Object.entries(field.counts);
            const fieldTotal = entries.reduce((sum, [, c]) => sum + c, 0);
            return (
              <div key={key} className="rounded-lg border border-charcoal/10 bg-white p-5 print:break-inside-avoid">
                <h2 className="mb-3 text-sm font-bold">{field.label}</h2>
                <div className="mx-auto flex max-w-xs items-center gap-6">
                  <DonutChart
                    data={entries.map(([option, count], i) => ({
                      label: option,
                      value: count,
                      color: CHART_PALETTE[i % CHART_PALETTE.length]
                    }))}
                  />
                  <div className="flex-1 space-y-2">
                    {entries.map(([option, count], i) => (
                      <div key={option} className="flex items-center gap-2 text-sm">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: CHART_PALETTE[i % CHART_PALETTE.length] }}
                        />
                        <span className="flex-1 font-semibold">{option}</span>
                        <span className="text-charcoal/60">{count}</span>
                        <span className="w-10 text-right text-xs text-charcoal/40">
                          {fieldTotal > 0 ? Math.round((count / fieldTotal) * 100) : 0}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {Object.keys(analytics.checkInByHour).length > 0 && (() => {
        const hoursWithData = Object.entries(analytics.checkInByHour)
          .filter(([, count]) => count > 0)
          .map(([h]) => Number(h));
        const minHour = Math.min(...hoursWithData);
        const maxHourOfDay = Math.max(...hoursWithData);
        let rangeStart = Math.max(0, minHour - 1);
        let rangeEnd = Math.min(23, maxHourOfDay + 1);
        // When check-ins cluster into just an hour or two, a couple of
        // wide bars reads as a meaningless blob rather than a
        // distribution — pad the window symmetrically so there's enough
        // context for the shape to actually be visible.
        const MIN_HOURS_SHOWN = 6;
        while (rangeEnd - rangeStart + 1 < MIN_HOURS_SHOWN && (rangeStart > 0 || rangeEnd < 23)) {
          if (rangeStart > 0) rangeStart -= 1;
          if (rangeEnd - rangeStart + 1 >= MIN_HOURS_SHOWN) break;
          if (rangeEnd < 23) rangeEnd += 1;
        }
        const hoursInRange = Array.from(
          { length: rangeEnd - rangeStart + 1 },
          (_, i) => rangeStart + i
        );
        const maxCount = Math.max(
          ...hoursInRange.map((h) => analytics.checkInByHour[h] ?? 0),
          1
        );

        return (
          <div className="rounded-lg border border-charcoal/10 bg-white p-5 print:break-inside-avoid">
            <h2 className="mb-3 text-sm font-bold">報到時間分佈</h2>
            <div className="space-y-2">
              {hoursInRange.map((h) => {
                const count = analytics.checkInByHour[h] ?? 0;
                return (
                  <div key={h} className="flex items-center gap-3">
                    <span className="w-14 text-xs text-charcoal/60">{h}:00</span>
                    <div className="flex-1 rounded-full bg-charcoal/10 h-5">
                      <div
                        className="h-5 rounded-full bg-mint"
                        style={{ width: `${maxCount > 0 ? (count / maxCount) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="w-6 text-right text-xs font-semibold">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
