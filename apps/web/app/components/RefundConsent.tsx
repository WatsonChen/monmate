"use client";

import Link from "next/link";
import { REFUND_SUMMARY } from "../lib/refund-terms";

// 購買前的退款條款重點與同意勾選。彈窗與儲值對話框共用，確保兩個購買入口說法一致。
export function RefundConsent({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="rounded-lg border border-charcoal/10 bg-paper p-4 text-sm">
      <p className="font-bold">購買前請確認以下重點</p>
      <ul className="mt-2 grid gap-1.5 pl-5 leading-6 text-charcoal/80">
        {REFUND_SUMMARY.map((t) => (
          <li key={t} className="list-disc">
            {t}
          </li>
        ))}
      </ul>
      <label className="mt-3 flex cursor-pointer items-start gap-2.5 leading-6">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-orange"
        />
        <span>
          我已閱讀並同意
          <Link href="/refund" target="_blank" rel="noopener" className="mx-0.5 font-bold text-orange underline">
            《退款條款》
          </Link>
          ，並了解以上說明。
        </span>
      </label>
    </div>
  );
}
