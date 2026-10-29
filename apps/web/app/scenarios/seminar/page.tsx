import { ScenarioPage, scenarioMetadata, type ScenarioContent } from "../../components/ScenarioPage";

const content: ScenarioContent = {
  path: "/scenarios/seminar",
  metaTitle: "講座、課程、教育訓練簽到系統",
  description:
    "講座、課程與教育訓練的簽到怎麼做？MonMate 提供 QR Code、序號、電話三種報到方式，事後查看報到率、匯出報表並發送問卷，附費用範例。",
  eyebrow: "適用場景・講座、課程、教育訓練",
  h1: "講座、課程、教育訓練的簽到怎麼做？",
  intro:
    "講座、課程與內部訓練的簽到，重點是現場快、事後好對帳。MonMate 讓學員用 QR Code、序號或電話完成報到，報到資料即時整理成可匯出的名單。",
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
  ],
};

export const metadata = scenarioMetadata(content);

export default function Page() {
  return <ScenarioPage c={content} />;
}
