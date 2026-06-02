"use client";

import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const MODULES = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "image"],
    ["clean"]
  ]
};

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichEditor({ value, onChange, placeholder }: Props) {
  return (
    <div className="rich-editor">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={MODULES}
        placeholder={placeholder ?? "活動內容說明…"}
      />
      <style>{`
        .rich-editor .ql-container { border-radius: 0 0 8px 8px; min-height: 120px; font-size: 14px; }
        .rich-editor .ql-toolbar { border-radius: 8px 8px 0 0; background: #f8f7f5; }
        .rich-editor .ql-editor { min-height: 120px; }
      `}</style>
    </div>
  );
}
