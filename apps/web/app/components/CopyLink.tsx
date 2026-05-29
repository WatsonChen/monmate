"use client";

import { Check, Clipboard } from "lucide-react";
import { useState } from "react";

type CopyLinkProps = {
  value: string;
};

export function CopyLink({ value }: CopyLinkProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-charcoal/10 bg-paper p-3 sm:flex-row sm:items-center">
      <code className="min-w-0 flex-1 truncate rounded-md bg-white px-3 py-2 text-xs font-semibold text-charcoal">
        {value}
      </code>
      <button
        type="button"
        onClick={copy}
        className="flex h-10 items-center justify-center gap-2 rounded-lg bg-mint px-4 text-sm font-bold text-charcoal"
      >
        {copied ? <Check size={16} /> : <Clipboard size={16} />}
        {copied ? "已複製" : "複製"}
      </button>
    </div>
  );
}
