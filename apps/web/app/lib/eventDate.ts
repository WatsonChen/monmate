// Hand-rolled instead of Date#toLocaleString: the "zh-TW" weekday+date
// combo is formatted with different spacing by the server's ICU (Node) vs.
// the browser's, which fails hydration on any page that SSRs this. Reading
// via getUTC* after shifting by a fixed +8h also sidesteps whatever local
// timezone the server process happens to run in (commonly UTC on Vercel),
// so events always render true Taiwan wall-clock time on both sides.
const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];
const TAIPEI_OFFSET_MS = 8 * 60 * 60 * 1000;

function toTaipei(date: Date) {
  return new Date(date.getTime() + TAIPEI_OFFSET_MS);
}

export function formatEventDate(date: Date) {
  const d = toTaipei(date);
  const weekday = WEEKDAYS[d.getUTCDay()];
  return `${d.getUTCFullYear()}年${d.getUTCMonth() + 1}月${d.getUTCDate()}日週${weekday} ${formatEventTime(date)}`;
}

export function formatEventTime(date: Date) {
  const d = toTaipei(date);
  const hours24 = d.getUTCHours();
  const period = hours24 < 12 ? "上午" : "下午";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const minutes = String(d.getUTCMinutes()).padStart(2, "0");
  return `${period}${hours12}:${minutes}`;
}
