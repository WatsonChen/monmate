import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type Item = { href: string; label: string; note: string; image: string; tag?: string };

// 全站共用的「案例與情境」入口，與首頁情境卡片、各情境頁一致
const ITEMS: Item[] = [
  { href: "/cases/elementary-school", label: "小學家長會案例", note: "改用現場 QR Code 自助報到", image: "/brand/scenario-school.png", tag: "客戶案例" },
  { href: "/scenarios/school", label: "學校活動", note: "家長會、校內研習、研討會", image: "/brand/scenario-school.png" },
  { href: "/scenarios/seminar", label: "講座、課程、教育訓練", note: "多場次簽到、事後對帳", image: "/brand/scenario-seminar.png" },
  { href: "/scenarios/brand-event", label: "品牌活動、展會", note: "品牌客製化與自助報到", image: "/brand/scenario-expo.png" },
  { href: "/scenarios/community", label: "社群聚會", note: "來賓只填姓名與電話", image: "/brand/scenario-community.png" },
  { href: "/scenarios/excel-list", label: "已有 Excel 名單", note: "匯入名單，現場只做報到", image: "/brand/scenario-excel.png" },
];

export function ScenarioLinks({ exclude }: { exclude?: string }) {
  const items = ITEMS.filter((i) => i.href !== exclude);
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className="group flex h-full items-center gap-4 rounded-2xl border border-charcoal/10 bg-white p-4 transition-[border-color,box-shadow] duration-300 hover:border-orange/40 hover:shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange motion-reduce:transition-none"
          >
            <Image
              src={item.image}
              alt=""
              width={56}
              height={56}
              className="h-14 w-14 shrink-0 object-contain transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              unoptimized
            />
            <span className="min-w-0 flex-1">
              {item.tag ? <span className="block text-xs font-bold text-orange">{item.tag}</span> : null}
              <span className="block text-base font-bold leading-snug text-charcoal">{item.label}</span>
              <span className="mt-0.5 block text-sm leading-5 text-charcoal/60">{item.note}</span>
            </span>
            <ArrowRight
              size={18}
              aria-hidden="true"
              className="shrink-0 text-charcoal/30 transition-[transform,color] duration-300 group-hover:translate-x-1 group-hover:text-orange motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}
