// 站內共用的內容清單：資源總覽頁、頁尾與各頁的「延伸閱讀」都用這份，避免標題與連結各處不一致
export const GUIDES = [
  {
    href: "/guides/offline-check-in",
    label: "活動現場網路不穩時，報到怎麼備援？",
    desc: "整理紙本名單、序號報到、電話查詢等備援做法，並說明 MonMate 的報到方式與網路需求。"
  },
  {
    href: "/guides/export-attendance-report",
    label: "活動結束後，怎麼匯出出席報表？",
    desc: "說明報到紀錄、CSV 與 Excel 匯出，適合研討會、課程與學校活動主辦方。"
  }
] as const;
