"use client";

import { useEffect, useRef, useState } from "react";
import { Image as ImageIcon, Link as LinkIcon, Loader2 } from "lucide-react";
import { uploadImage } from "../lib/api";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  token: string;
}

export function RichEditor({ value, onChange, placeholder, token }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const isComposing = useRef(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value;
    }
  }, [value]);

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

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    // Upload to Blob storage and embed the URL, not a base64 data URI —
    // inlining images directly bloats the event's content field (a single
    // photo easily adds hundreds of KB), which then gets re-sent in full on
    // every page load, admin edit, and save of the event.
    setUploadError("");
    setIsUploadingImage(true);
    const res = await uploadImage(file, token);
    setIsUploadingImage(false);
    if (!res.success || !res.data) {
      setUploadError(res.error?.message ?? "圖片上傳失敗");
      return;
    }
    insertImage(res.data.url);
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
          disabled={isUploadingImage}
          onMouseDown={(e) => { e.preventDefault(); fileRef.current?.click(); }}
          className="flex h-7 w-7 items-center justify-center rounded text-sm hover:bg-charcoal/10 disabled:opacity-50"
        >
          {isUploadingImage ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
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
          onChange={(e) => void handleFileChange(e)}
        />
      </div>

      {uploadError && (
        <p className="border-b border-red-100 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600">
          {uploadError}
        </p>
      )}

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
        onCompositionStart={() => { isComposing.current = true; }}
        onCompositionEnd={() => {
          isComposing.current = false;
          onChange(ref.current?.innerHTML ?? "");
        }}
        onInput={() => {
          if (!isComposing.current) onChange(ref.current?.innerHTML ?? "");
        }}
        data-placeholder={placeholder ?? "活動內容說明…"}
        className="min-h-[160px] p-3 text-sm outline-none [&:empty]:before:text-charcoal/30 [&:empty]:before:content-[attr(data-placeholder)]"
      />
    </div>
  );
}
