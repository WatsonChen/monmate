"use client";

import { useRef } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichEditor({ value, onChange, placeholder }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className="rich-editor rounded-lg border border-charcoal/15 bg-paper">
      <div className="flex flex-wrap gap-1 rounded-t-lg border-b border-charcoal/10 bg-paper p-2">
        {[
          { cmd: "bold", label: "B", style: "font-bold" },
          { cmd: "italic", label: "I", style: "italic" },
          { cmd: "underline", label: "U", style: "underline" }
        ].map(({ cmd, label, style }) => (
          <button
            key={cmd}
            type="button"
            onMouseDown={(e) => { e.preventDefault(); document.execCommand(cmd); }}
            className={`h-7 w-7 rounded text-sm hover:bg-charcoal/10 ${style}`}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); document.execCommand("insertUnorderedList"); }}
          className="h-7 px-2 rounded text-sm hover:bg-charcoal/10"
        >
          ≡
        </button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        dangerouslySetInnerHTML={{ __html: value }}
        onInput={() => onChange(ref.current?.innerHTML ?? "")}
        data-placeholder={placeholder ?? "活動內容說明…"}
        className="min-h-[120px] p-3 text-sm outline-none [&:empty]:before:text-charcoal/30 [&:empty]:before:content-[attr(data-placeholder)]"
      />
    </div>
  );
}
