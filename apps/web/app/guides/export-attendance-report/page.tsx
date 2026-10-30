import { GuidePage, guideMetadata, type GuideContent } from "../../components/GuidePage";

const content: GuideContent = {
  path: "/guides/export-attendance-report",
  metaTitle: "活動出席報表匯出｜報到資料整理與 Excel 下載｜MonMate",
  description:
    "活動結束後，如何整理出席名單與報到資料？說明 MonMate 的報到紀錄、CSV 與 Excel 匯出，適合研討會、課程與學校活動主辦方。",
  eyebrow: "使用指南・活動後整理",
  h1: "活動結束後，怎麼匯出出席報表？",
  crumbName: "活動出席報表匯出",
  intro: [
    "活動結束後，主辦方通常需要出席名單、未到場名單、報到時間與後續聯繫資料。人工整理容易遺漏，也很難重複使用。",
    "這一頁說明 MonMate 的報到紀錄、怎麼匯出，以及報表可以怎麼用。",
  ],
  sections: [
    {
      id: "needs",
      title: "活動結束後，主辦方通常需要什麼？",
      items: [
        "出席名單：誰有來、來了幾位",
        "未到場名單：誰報名了卻沒有出席",
        "報到時間：用來看人流與時段分布",
        "後續聯繫資料：用於通知、問卷或下一場活動",
      ],
    },
    {
      id: "what",
      title: "MonMate 可以做什麼？",
      items: [
        "在後台即時查看報名人數與實際報到人數",
        "匯出 CSV 或 Excel 報表",
        "查看報到率與時段熱圖",
        "報到後自動發送問卷，蒐集回饋",
      ],
    },
    {
      id: "steps",
      title: "匯出流程",
      steps: [
        "登入後台，進入要整理的那一場活動",
        "在報名名單上方點「匯出」",
        "選擇「匯出 XLSX」（Excel）或「匯出 CSV」",
        "下載檔案，用 Excel 或其他試算表開啟",
      ],
      note: "也可以從後台左側的「匯出報表」選單，選擇活動後匯出。",
    },
    {
      id: "columns",
      title: "報表包含哪些欄位？",
      items: [
        "姓名、電話、Email",
        "年齡、性別（有蒐集時才有資料）",
        "報到碼",
        "報名人數、實際報到人數",
        "報到狀態、報到時間、報到方式",
        "備註，以及活動自訂的報名欄位",
      ],
    },
    {
      id: "use",
      title: "報表可以怎麼用？",
      items: [
        "出席統計：比較報名人數與實際報到人數",
        "未到場名單：在試算表用「報到狀態」欄位篩選出尚未報到的人",
        "後續聯絡或問卷：用電話與 Email 欄位整理聯絡對象",
        "活動檢討與下一次名單準備：保留這次的出席紀錄作為參考",
      ],
    },
  ],
  faq: [
    [
      "可以匯出哪些欄位？",
      "姓名、電話、Email、年齡、性別、報到碼、報名人數、實際報到人數、報到狀態、報到時間、報到方式、備註，以及活動自訂的報名欄位。年齡、性別等欄位是否有資料，取決於報名時有沒有蒐集。",
    ],
    [
      "可以匯出未到場名單嗎？",
      "匯出的報表包含所有報名者與他們的報到狀態，可以在試算表用「報到狀態」欄位篩選出尚未報到的人。目前沒有「只匯出未到場」的單獨選項。",
    ],
    [
      "可以匯出 CSV 或 Excel 嗎？",
      "可以，兩種都有：在活動頁的「匯出」選單選擇 XLSX 或 CSV。",
    ],
    [
      "報到時間會包含在報表裡嗎？",
      "會，報表有「報到時間」與「報到方式」欄位。",
    ],
  ],
  related: [
    { label: "講座、課程、研討會報到", href: "/scenarios/seminar", desc: "多場次活動的報到與出席報表。" },
    { label: "已有 Excel 名單", href: "/scenarios/excel-list", desc: "匯入名單、現場報到、活動後對帳。" },
    { label: "費用說明", href: "/pricing", desc: "點數怎麼算，各人數規模要多少。" },
  ],
};

export const metadata = guideMetadata(content);

export default function Page() {
  return <GuidePage c={content} />;
}
