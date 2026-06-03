"use client";

import { useRef, useState } from "react";
import { Image as ImageIcon, Link as LinkIcon } from "lucide-react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichEditor({ value, onChange, placeholder }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  function exec(cmd: string, val?: string) {
    ref.current?.focus();
    document.execCommand(cmd, false, val);
    onChange(ref.current?.innerHTML ?? "");
  }

  function insertImage(src: string) {
    ref.current?.focus();
    document.execCommand("insertHTML", false, `<img src="${src}" style="max-width:100%;border-radius:8px;margin:8px 0;" alt="" />`);
    onChange(ref.current?.innerHTML ?? "");
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === "string") {
        insertImage(ev.target.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function confirmLink() {
    if (linkUrl) exec("createLink", linkUrl);
    setShowLinkInput(false);
    setLinkUrl("");
  }

  const tools = [
    { cmd: "bold", label: "B", style: "font-bold" },
    { cmd: "italic", label: "I", style: "italic" },
    { cmd: "underline", label: "U", style: "underline" }
  ];

  return (
    <div className="rich-editor rounded-lg border border-charcoal/15 bg-paper">
      <div className="flex flex-wrap items-center gap-1 rounded-t-lg border-b border-charcoal/10 bg-paper p-2">
        {tools.map(({ cmd, label, style }) => (
          <button
            key={cmd}
            type="button"
            onMouseDown={(e) => { e.preventDefault(); exec(cmd); }}
            className={`h-7 w-7 rounded text-sm hover:bg-charcoal/10 ${style}`}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); exec("insertUnorderedList"); }}
          className="h-7 px-2 rounded text-sm hover:bg-charcoal/10"
        >
          ≡
        </button>
        <div className="mx-1 h-5 w-px bg-charcoal/15" />
        <button
          type="button"
          title="插入圖片"
          onMouseDown={(e) => { e.preventDefault(); fileRef.current?.click(); }}
          className="flex h-7 w-7 items-center justify-center rounded text-sm hover:bg-charcoal/10"
        >
          <ImageIcon size={14} />
        </button>
        <button
          type="button"
          title="插入連結"
          onMouseDown={(e) => { e.preventDefault(); setShowLinkInput((v) => !v); }}
          className="flex h-7 w-7 items-center justify-center rounded text-sm hover:bg-charcoal/10"
        >
          <LinkIcon size={14} />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {showLinkInput && (
        <div className="flex items-center gap-2 border-b border-charcoal/10 bg-paper px-3 py-2">
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); confirmLink(); } }}
            placeholder="https://..."
            className="h-8 flex-1 rounded-lg border border-charcoal/15 bg-white px-2 text-xs outline-none focus:border-mint"
          />
          <button type="button" onClick={confirmLink}
            className="h-8 rounded-lg bg-mint/30 px-3 text-xs font-semibold">插入</button>
          <button type="button" onClick={() => setShowLinkInput(false)}
            className="h-8 rounded-lg border border-charcoal/15 px-3 text-xs">取消</button>
        </div>
      )}

      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        dangerouslySetInnerHTML={{ __html: value }}
        onInput={() => onChange(ref.current?.innerHTML ?? "")}
        data-placeholder={placeholder ?? "活動內容說明…"}
        className="min-h-[160px] p-3 text-sm outline-none [&:empty]:before:text-charcoal/30 [&:empty]:before:content-[attr(data-placeholder)]"
      />
    </div>
  );
}
