import { BRANDING_CREDITS } from "../../lib/pricing";
import { ScenarioPage, scenarioMetadata, type ScenarioContent } from "../../components/ScenarioPage";

const content: ScenarioContent = {
  path: "/scenarios/brand-event",
  metaTitle: "品牌活動、展會報到系統",
  description:
    "品牌活動、展會與發表活動的報到怎麼做？MonMate 提供來賓 QR Code 自助報到，可選用品牌客製化（Logo、頂部大圖、隱藏 MonMate 標示），並附含品牌客製化的費用範例。",
  eyebrow: "適用場景・品牌活動、展會",
  h1: "品牌活動、展會的報到怎麼做？",
  intro:
    "品牌活動與展會的來賓多、時間集中，報到體驗也是品牌形象的一部分。MonMate 讓來賓掃現場 QR Code 自助報到，並可選用品牌客製化，讓報到頁面與通知貼近你的活動識別。",
  crumbName: "品牌活動、展會",
  image: "/brand/scenario-expo.png",
  pains: [
    {
      title: "人潮集中、排隊拖慢進場",
      text: "開場前來賓同時抵達，單一簽到桌容易大排長龍。",
    },
    {
      title: "來賓資料難以即時核對",
      text: "臨時加人、重複進場不易察覺，事後還得重新整理名單。",
    },
    {
      title: "報到體驗與品牌不一致",
      text: "報到頁面和通知看起來像第三方工具，和活動整體識別對不上。",
    },
  ],
  before: [
    "建立活動，設定名稱、時間、地點",
    "匯入邀請名單（至少包含姓名、電話），或開放線上報名",
    `選用品牌客製化：上傳專屬 Logo、置換頂部大圖、隱藏 MonMate 標示（每場 ${BRANDING_CREDITS} 點）`,
    "用 Email 寄送含 QR Code 的報到通知，或列印 QR Code 張貼在現場",
  ],
  during: [
    "來賓掃現場 QR Code 自助報到，也可出示個人 QR Code 由工作人員掃描",
    "找不到 QR Code 時，工作人員可改用序號或電話查詢",
    "多支手機可同時報到，掃碼不衝突",
    "可設定報名人數上限，也能允許超額報名，現場不卡關",
  ],
  after: [
    "查看報到率與時段熱圖，掌握人流高峰",
    "匯出 CSV／Excel 報表，方便與主辦或贊助單位對帳",
    "報到後自動發送問卷，蒐集來賓回饋",
  ],
  staffing: [
    "依人流配置多位工作人員，各自用自己的手機報到。",
    "可以指派工作人員負責不同活動，他們只看得到被指派的活動。",
    "有自助報到時，工作人員主要處理例外狀況並引導動線。",
  ],
  exampleIntro: "品牌活動與展會常見的人數規模，以及加購品牌客製化後的費用如下（依現有計價規則自動計算）：",
  exampleHeadcounts: [100, 300, 500, 1000],
  showBranding: true,
  faq: [
    [
      "品牌客製化可以改什麼？",
      "可上傳專屬 Logo、置換頂部大圖，並隱藏頁尾與 QR Code 上的 MonMate 標示。",
    ],
    [
      "品牌客製化怎麼收費？",
      `以單場活動為單位解鎖，每場 ${BRANDING_CREDITS} 點，從帳號點數中扣除。不解鎖也能正常使用所有報到功能。`,
    ],
    [
      "來賓需要登入或下載 App 嗎？",
      "不需要，開啟報到連結或掃現場 QR Code 即可操作。",
    ],
    [
      "名單已經確定，可以不開放線上報名嗎？",
      "可以。直接匯入 Excel 或 CSV 名單，現場只做報到即可。",
    ],
  ],
};

export const metadata = scenarioMetadata(content);

export default function Page() {
  return <ScenarioPage c={content} />;
}
