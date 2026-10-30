import { GuidePage, guideMetadata, type GuideContent } from "../../components/GuidePage";

const content: GuideContent = {
  path: "/guides/offline-check-in",
  metaTitle: "活動報到沒網路怎麼辦？現場報到備援做法｜MonMate",
  description:
    "活動現場網路不穩時，報到流程如何備援？整理紙本名單、序號報到、電話查詢等備援做法，並說明 MonMate 的報到方式與網路需求。",
  eyebrow: "使用指南・現場報到",
  h1: "活動現場網路不穩時，報到怎麼備援？",
  crumbName: "活動現場網路不穩時的報到備援",
  intro: [
    "大型活動、地下室、校園與展場常常遇到網路不穩。報到流程不能假設現場網路永遠順暢，事前準備好備援，比臨時處理更安心。",
    "這一頁整理常見的備援做法，並直接說明 MonMate 的報到方式與網路需求。",
  ],
  sections: [
    {
      id: "causes",
      title: "現場網路不穩，通常卡在哪裡？",
      items: [
        "人潮集中時，同時連線的裝置太多",
        "場地訊號弱，例如地下室、展場、校園深處",
        "場地 Wi-Fi 需要認證，或有頻寬限制",
        "手機的行動網路在室內收訊不佳",
      ],
    },
    {
      id: "backup",
      title: "常見的備援方式",
      items: [
        "事先準備紙本名單與簽到表",
        "準備多台手機或平板，分散連線",
        "準備行動網路備援，例如分享行動熱點",
        "事先讓參加者拿到報到序號",
        "保留人工用姓名或電話查詢的流程",
      ],
    },
    {
      id: "monmate",
      title: "MonMate 的報到方式",
      paragraphs: [
        "MonMate 提供三種報到方式，工作人員用手機就能操作，參加者免登入：",
      ],
      items: [
        "QR Code：參加者出示個人 QR Code，或掃現場張貼的 QR Code 自助報到",
        "序號：輸入報名時取得的報到序號",
        "電話：用報名時留的電話查詢",
      ],
      note: "掃不到 QR Code 時，可以改用序號或電話，這能解決「掃不到」，但不能解決「沒有網路」。",
    },
    {
      id: "offline",
      title: "MonMate 支援離線報到嗎？",
      paragraphs: [
        "目前不支援。MonMate 的報到操作需要網路連線，每一次報到都是連上網路時即時記錄，沒有離線報到模式，也沒有離線名單下載。",
        "因此建議把上面的備援方式當成事前準備的一部分：事先匯出名單印成紙本、準備行動網路，現場網路中斷時還有退路。",
      ],
      items: [
        "活動前：在後台匯出名單（CSV 或 Excel），列印成紙本簽到表備用",
        "現場：以手機行動網路作為備援，不一定需要場地 Wi-Fi",
        "網路恢復後：在後台編輯報名者的「實際報到人數」，補登改用紙本簽到的人",
      ],
    },
  ],
  faq: [
    [
      "現場沒有 Wi-Fi 可以報到嗎？",
      "可以，只要手機有行動網路就能報到，不一定需要場地 Wi-Fi。但現場完全沒有任何網路時，無法用 MonMate 報到，建議準備紙本名單備援。",
    ],
    [
      "需要事先下載名單嗎？",
      "MonMate 目前沒有離線名單下載功能。建議活動前先在後台匯出名單（CSV 或 Excel），列印成紙本作為備援。",
    ],
    [
      "恢復網路後，報到資料會同步嗎？",
      "MonMate 沒有離線報到模式，所以不會有「離線報到後再同步」的情況，每次報到都是連網時即時記錄。網路中斷期間若改用紙本簽到，可在恢復網路後到後台編輯報名者的實際報到人數補登。",
    ],
    [
      "可以同時使用多台裝置報到嗎？",
      "可以，報到桌可以有多支手機同時報到，名單會即時更新。",
    ],
  ],
  related: [
    { label: "講座、課程、研討會報到", href: "/scenarios/seminar", desc: "多場次、人數多的活動怎麼報到。" },
    { label: "已有 Excel 名單", href: "/scenarios/excel-list", desc: "名單先備好，匯入後直接現場報到。" },
    { label: "費用說明", href: "/pricing", desc: "點數怎麼算，各人數規模要多少。" },
  ],
};

export const metadata = guideMetadata(content);

export default function Page() {
  return <GuidePage c={content} />;
}
