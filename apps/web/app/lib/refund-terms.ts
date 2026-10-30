// 退款條款的版本（＝最後更新日期）。購買時會把「使用者同意了哪一版」送給後端留存，
// 之後修改條款內容時，請同步更新這個日期、/refund 頁面上的日期，以及 lib/content-dates.ts 的 legalPageDates。
export const REFUND_TERMS_VERSION = "2026-10-30";
export const REFUND_TERMS_DATE_ZH = "2026 年 10 月 30 日";

// 購買前會在彈窗或對話框中顯示的重點，內容必須與 /refund 頁面一致
export const REFUND_SUMMARY = [
  "付款成功後 7 日內，且帳戶沒有任何扣點紀錄，可申請全額退款。",
  "點數一經用於報名、匯入名單或解鎖功能，即視為服務已提供，不予退回，也不適用 7 日解除權。",
  "報名者未到場、取消報名、減少攜伴人數，或刪除名單、活動，都不會退回已扣的點數。"
];
