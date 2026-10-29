import { ScenarioPage, scenarioMetadata, type ScenarioContent } from "../../components/ScenarioPage";

const content: ScenarioContent = {
  path: "/scenarios/community",
  metaTitle: "社群聚會、小型活動報到系統",
  description:
    "社群聚會與小型活動的報到怎麼做？MonMate 讓來賓只填姓名與電話就能報名，現場掃 QR Code 或查電話報到，活動後匯出名單，附小型活動費用範例。",
  eyebrow: "適用場景・社群聚會",
  h1: "社群聚會、小型活動的報到怎麼做？",
  intro:
    "社群聚會不一定需要完整的報名流程。MonMate 讓來賓只填姓名與電話就能報名，或由主揪直接匯入名單，現場用手機簡單報到，活動後還能留下出席紀錄。",
  crumbName: "社群聚會",
  image: "/brand/scenario-community.png",
  pains: [
    {
      title: "名單散落各處",
      text: "報名表單、群組訊息各自一份，活動前得手動整理。",
    },
    {
      title: "臨時變動多",
      text: "臨時加人、有人沒到，現場人數很難掌握。",
    },
    {
      title: "活動後沒有紀錄",
      text: "沒有出席資料可以參考，下一場活動只能憑印象準備。",
    },
  ],
  before: [
    "建立活動（免費），設定名稱、時間、地點",
    "開放公開報名，來賓只需填姓名與電話，把連結分享到社群群組",
    "或由主揪匯入名單（至少包含姓名、電話），再寄送報到連結",
  ],
  during: [
    "來賓掃現場 QR Code 自助報到",
    "主揪也可用手機掃來賓的 QR Code、輸入序號或查電話完成報到",
    "臨時加人：主辦方可在後台手動新增單筆報名者，新增後即可報到",
  ],
  after: [
    "查看報到率與出席名單",
    "匯出 CSV／Excel，留存這場聚會的出席紀錄",
    "需要時可在活動後發送問卷，蒐集大家的意見",
  ],
  staffing: [
    "小型聚會通常一位主揪用自己的手機就能完成報到。",
    "需要幫手時，可以邀請朋友成為工作人員，他們只看得到被指派的活動。",
    "找不到 QR Code 的來賓，可以改用序號或電話查詢。",
  ],
  exampleIntro: "社群聚會常見的人數規模與對應費用如下（依現有計價規則自動計算）：",
  exampleHeadcounts: [20, 50, 100, 200],
  faq: [
    [
      "20 人的小聚會也要買 199 點嗎？",
      "目前最小的點數方案是 199 點。用不完的點數會保留在帳號中，可以跨活動使用，下一場聚會繼續扣。",
    ],
    [
      "來賓一定要先報名嗎？",
      "不一定。可以開放公開報名讓來賓填姓名與電話，也可以由主揪直接匯入名單。",
    ],
    [
      "臨時多一位朋友怎麼辦？",
      "主辦方可以在後台手動新增單筆報名者，新增後即可報到，每位同樣扣 1 點。",
    ],
    [
      "來賓需要登入或下載 App 嗎？",
      "不需要，開啟報到連結或掃現場 QR Code 即可操作。",
    ],
  ],
};

export const metadata = scenarioMetadata(content);

export default function Page() {
  return <ScenarioPage c={content} />;
}
