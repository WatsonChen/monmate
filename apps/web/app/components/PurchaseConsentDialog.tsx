"use client";

import { CreditCard, X } from "lucide-react";
import { useEffect, useState } from "react";
import { DotsLoading } from "./DotsLoading";
import { RefundConsent } from "./RefundConsent";

// 按下「立即購買」後的確認彈窗：必須勾選同意退款條款，才能前往金流付款
export function PurchaseConsentDialog({
  open,
  planLabel,
  priceText,
  busy,
  onCancel,
  onConfirm
}: {
  open: boolean;
  planLabel: string;
  priceText: string;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    if (open) setChecked(false);
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-charcoal/40 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="確認購買">
      <div className="max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:max-w-md sm:rounded-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">確認購買</h2>
            <p className="mt-1 text-sm text-charcoal/60">
              {planLabel}，{priceText}
            </p>
          </div>
          <button type="button" onClick={onCancel} aria-label="關閉" className="rounded-lg p-1.5 text-charcoal/50 hover:bg-paper">
            <X size={18} />
          </button>
        </div>

        <div className="mt-4">
          <RefundConsent checked={checked} onChange={setChecked} />
        </div>

        <div className="mt-5 flex gap-2">
          <button type="button" onClick={onCancel} className="h-11 flex-1 rounded-lg border border-charcoal/15 text-sm font-semibold hover:bg-paper">
            取消
          </button>
          <button
            type="button"
            disabled={!checked || busy}
            onClick={onConfirm}
            className="flex h-11 flex-[2] items-center justify-center gap-2 rounded-lg bg-orange text-sm font-bold text-white disabled:opacity-40"
          >
            <CreditCard size={16} />
            {busy ? <>前往付款<DotsLoading /></> : "同意並前往付款"}
          </button>
        </div>
      </div>
    </div>
  );
}
