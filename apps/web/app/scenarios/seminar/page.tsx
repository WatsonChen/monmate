import { ScenarioPage, scenarioMetadata, type ScenarioContent } from "../../components/ScenarioPage";

const content: ScenarioContent = {
  path: "/scenarios/seminar",
  metaTitle: "研討會、講座、課程報到系統｜QR Code 簽到與出席報表｜MonMate",
  description:
    "MonMate 適合研討會、講座、課程與教育訓練。參加者可用 QR Code、序號或電話報到，主辦方即時掌握出席狀況並匯出報表。",
  eyebrow: "適用場景・研討會、講座、課程、教育訓練",
  h1: "研討會、講座與課程的 QR Code 報到系統",
  intro:
    "研討會、講座、課程與內部訓練的簽到，重點是現場快、事後好對帳。MonMate 讓參加者用 QR Code、序號或電話完成報到，報到資料即時整理成可匯出的名單。",
  image: "/brand/scenario-seminar.png",
  crumbName: "講座、課程、教育訓練",
  pains: [
    {
      title: "報到排隊影響開場",
      text: "學員集中抵達時，紙本簽到或逐一核對姓名會拖慢進場。",
    },
    {
      title: "多場次出席資料分散",
      text: "每場課程各自一份簽到表，事後要手動合併整理。",
    },
    {
      title: "事後對帳與回饋蒐集",
      text: "出席名單要另外輸入，問卷又得另找工具發送。",
    },
  ],
  before: [
    "每一場講座或課程建立一個活動，設定名稱、時間、地點",
    "開放線上報名，或匯入 Excel 名單（至少包含姓名、電話）",
    "用 Email 寄送含 QR Code 的報到通知，或複製報到連結、列印 QR Code",
    "邀請同事成為工作人員，指派要負責的活動",
  ],
  during: [
    "工作人員用手機掃學員的 QR Code，或輸入序號、查電話完成報到",
    "報到桌可以同時有多支手機上線，掃碼不衝突",
    "可設定報名人數上限，也能允許超額報名，現場不卡關",
  ],
  after: [
    "查看報到率與時段熱圖",
    "匯出 CSV／Excel 報表，方便與人資或單位對帳",
    "報到後自動發送問卷，蒐集課程回饋",
  ],
  staffing: [
    "報到桌可依人數配置多位工作人員，各自用自己的手機報到。",
    "多場次課程時，可以指派不同工作人員負責不同活動，只看得到被指派的活動。",
    "工作人員主要處理例外狀況（例如學員忘記帶 QR Code）並引導動線。",
  ],
  exampleIntro: "講座與課程常見的人數規模與對應費用如下（依現有計價規則自動計算）：",
  exampleHeadcounts: [50, 100, 300, 500],
  suitable: {
    title: "適合哪些活動？",
    items: [
      "學術研討會、論壇、產業交流",
      "企業內訓、教育訓練、工作坊",
      "講座、課程、讀書會",
      "社群聚會、會員活動",
    ],
  },
  compare: {
    title: "為什麼不用紙本簽到？",
    leftLabel: "紙本簽到",
    left: [
      "需要人工逐一核對姓名，人潮集中時容易排隊",
      "事後要謄打與統計，多場次的出席資料分散在不同簽到表",
      "不容易在活動進行中掌握目前的出席狀況",
    ],
    right: [
      "參加者用 QR Code、序號或電話自助報到",
      "主辦方在後台即時查看報名與報到人數",
      "匯出 CSV／Excel 報表，報到後可自動發送問卷",
    ],
  },
  related: [
    { label: "已有 Excel 名單的研討會", href: "/scenarios/excel-list", desc: "名單已確定，匯入後直接現場報到。" },
    { label: "費用說明", href: "/pricing", desc: "點數怎麼算，50／100／300／500 人各要多少。" },
    { label: "匯出出席報表", href: "/guides/export-attendance-report", desc: "活動結束後怎麼整理出席名單與報到時間。" },
    { label: "完整功能介紹", href: "/", desc: "從建立活動、報名到報到與問卷的完整流程。" },
  ],
  faq: [
    [
      "多場次課程怎麼算費用？",
      "建立活動免費，每場依實際新增或匯入的報名人數扣點（1 位含攜伴扣 1 點），點數可跨活動使用，不用每場重新購買。",
    ],
    [
      "學員忘記帶 QR Code 怎麼辦？",
      "工作人員可以改用輸入序號或查電話幫學員完成報到。",
    ],
    [
      "學員需要登入或下載 App 嗎？",
      "不需要，開啟報到連結即可操作。",
    ],
    [
      "課程結束後能發問卷嗎？",
      "可以，在後台建立題目後，報到完成的學員會自動收到問卷。",
    ],
    [
      "研討會一定要開放線上報名嗎？",
      "不一定。可以開放線上報名讓參加者自己填，也可以由主辦方直接匯入 Excel 或 CSV 名單，現場只做報到。",
    ],
    [
      "活動結束後可以匯出報到資料嗎？",
      "可以，後台提供 CSV 與 Excel 匯出，報表包含報到狀態與報到時間。",
    ],
  ],
};

export const metadata = scenarioMetadata(content);

export default function Page() {
  return <ScenarioPage c={content} />;
}
