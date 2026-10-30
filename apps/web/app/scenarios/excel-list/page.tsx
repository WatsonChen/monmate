import { ScenarioPage, scenarioMetadata, type ScenarioContent } from "../../components/ScenarioPage";

const content: ScenarioContent = {
  path: "/scenarios/excel-list",
  metaTitle: "Excel 名單匯入活動報到系統｜免開放報名、QR Code 簽到｜MonMate",
  description:
    "已有 Excel 名單的邀請制活動、內部訓練或家長會，可將名單匯入 MonMate，現場使用 QR Code、序號或電話完成報到，並匯出出席資料。",
  eyebrow: "適用場景・已有 Excel 名單",
  h1: "已有 Excel 名單？匯入後直接 QR Code 報到",
  intro:
    "邀請制活動、內部活動或名單早已確定的場合，不需要開放線上報名。把 Excel 名單匯入 MonMate，現場直接用手機核對與報到。",
  image: "/brand/scenario-excel.png",
  crumbName: "已有 Excel 名單",
  pains: [
    {
      title: "Excel 在現場不好用",
      text: "手機上搜尋、標記已到都不方便，多人共用同一份檔案還容易互相覆蓋。",
    },
    {
      title: "重複報到、漏報到難察覺",
      text: "手動打勾無法即時看到整體報到狀況，也不易發現同一人重複進場。",
    },
    {
      title: "事後還要重整一次",
      text: "現場紀錄跟原始名單分開，活動後得再合併對帳。",
    },
  ],
  before: [
    "建立活動，選擇之後匯入名單、不開放公開報名",
    "上傳 Excel 或 CSV 名單（.xlsx／.xls／.csv，至少包含姓名、電話），支援攜伴人數",
    "用 Email 寄送含 QR Code 的報到通知，或複製報到連結",
  ],
  during: [
    "工作人員用手機掃 QR Code、輸入序號或查電話即可報到",
    "名單即時更新，多支手機同時報到不衝突",
    "名單以外的臨時來賓，主辦方可在後台手動新增單筆報名者",
  ],
  after: [
    "即時查看報到率與時段分布",
    "匯出 CSV／Excel 報表，與原本的名單對帳",
    "可選擇發送問卷，蒐集回饋",
  ],
  staffing: [
    "報到桌只需要少數工作人員拿手機核對，不必有人專職守著一份 Excel。",
    "工作人員主要處理例外狀況（查無名單、忘記電話）並引導動線。",
    "可邀請多位同事各自登入、多支手機同時報到。",
  ],
  exampleIntro: "名單匯入時依匯入人數（含攜伴）扣點，常見規模與對應費用如下（依現有計價規則自動計算）：",
  exampleHeadcounts: [50, 100, 300, 500, 1000],
  suitable: {
    title: "適合哪些情況？",
    items: [
      "邀請制活動，名單已經確定",
      "內部訓練、員工活動、供應商說明會",
      "家長會或學校活動，已有 Excel 名單",
      "不想讓參加者自行填寫報名表",
    ],
  },
  compare: {
    title: "為什麼不用 Excel 現場報到？",
    leftLabel: "用 Excel 或本機檔案現場核對",
    left: [
      "適合事前整理名單，這個用途不需要換掉",
      "現場需要即時更新、多人協作時，本機檔案不易管理",
      "報到紀錄與原始名單分開，活動後還要再合併對帳",
    ],
    right: [
      "名單匯入後，現場用手機以 QR Code、序號或電話報到",
      "報到狀況集中在同一份名單，多支手機同時報到不衝突",
      "活動後匯出 CSV／Excel，與原本的名單對帳",
    ],
  },
  related: [
    { label: "費用說明", href: "/pricing", desc: "匯入名單時怎麼扣點，50 到 1,000 人各要多少。" },
    { label: "學校家長會報到", href: "/scenarios/school", desc: "已有名單的學校活動，家長掃碼自助報到。" },
    { label: "活動現場網路不穩怎麼辦", href: "/guides/offline-check-in", desc: "備援做法，以及 MonMate 的網路需求。" },
  ],
  faq: [
    [
      "可以匯入什麼格式的名單？",
      "支援 Excel（.xlsx、.xls）與 CSV，另外也接受 Numbers、ODS 檔案，檔案需含「姓名」與「電話」欄位。",
    ],
    [
      "匯入時遇到重複資料怎麼辦？",
      "已經存在的報名者不會被重複新增，也不會重複扣點；只有人數（含攜伴）調高的部分才會補扣差額。",
    ],
    [
      "Excel 名單需要哪些欄位？",
      "至少要包含姓名與電話；有攜伴人數時可一併匯入。",
    ],
    [
      "匯入名單會扣點嗎？",
      "會。匯入時依名單人數（含攜伴）扣點，1 位扣 1 點。重新匯入既有名單時，只有人數調高的部分會補扣差額。",
    ],
    [
      "沒有開放線上報名，與會者還需要填表嗎？",
      "不需要。名單由主辦方匯入，與會者只要在現場報到即可。",
    ],
    [
      "臨時加人怎麼辦？",
      "主辦方可以在後台手動新增單筆報名者，新增後即可報到，每位同樣扣 1 點。",
    ],
    [
      "匯入後可以事後修改名單嗎？",
      "可以。主辦方可以在後台編輯報名者的資料，也可以再匯入更新後的名單。",
    ],
    [
      "活動結束後可以匯出報到資料嗎？",
      "可以，後台提供 CSV 與 Excel 匯出，報表包含報到狀態與報到時間，方便與原本的名單對帳。",
    ],
  ],
};

export const metadata = scenarioMetadata(content);

export default function Page() {
  return <ScenarioPage c={content} />;
}
