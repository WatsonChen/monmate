// 每個公開頁面「內容實質變更」的日期（YYYY-MM-DD）。
// 用途：sitemap.xml 的 lastmod、頁面結構化資料的 dateModified、頁面上的「最後更新」字樣，三者必須一致。
//
// 更新規則：改了頁面的實質內容（文案、價格、功能說明、FAQ）才更新該頁的日期；
// 只是重新部署或調整排版不算。搜尋引擎只會信任「持續準確」的 lastmod，
// 若每次部署都把全站標成剛修改，整個欄位會被忽略。
// 改動 /pricing、情境頁等被 AI 引用的頁面時，也請同步更新 public/llms.txt 的「最後更新」。
export const contentDates: Record<string, string> = {
  "/": "2026-10-30",
  "/pricing": "2026-10-30",
  "/scenarios/school": "2026-10-30",
  "/scenarios/seminar": "2026-10-30",
  "/scenarios/excel-list": "2026-10-30",
  "/scenarios/brand-event": "2026-10-30",
  "/scenarios/community": "2026-10-30",
  "/guides/offline-check-in": "2026-10-30",
  "/guides/export-attendance-report": "2026-10-30",
  "/cases/elementary-school": "2026-10-30"
};

// 法律條款頁已在頁面上自行標示「最後更新日期」，這裡必須與頁面文字完全一致，也不另外顯示第二個日期
export const legalPageDates: Record<string, string> = {
  "/privacy": "2026-10-29",
  "/refund": "2026-06-05"
};

export function contentDate(path: string): string | undefined {
  return contentDates[path] ?? legalPageDates[path];
}

export function formatContentDate(date: string) {
  return date.replaceAll("-", "/");
}
