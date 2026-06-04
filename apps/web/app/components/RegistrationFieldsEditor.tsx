"use client";

import type { RegistrationField } from "@monmate/types";
import { GripVertical, Plus, Trash2 } from "lucide-react";

type Props = {
  fields: RegistrationField[];
  onChange: (fields: RegistrationField[]) => void;
};

const PRESET_FIELDS: { key: string; label: string }[] = [
  { key: "email", label: "電子郵件" },
  { key: "age", label: "年齡" },
  { key: "gender", label: "性別" }
];

function isPreset(key: string) {
  return PRESET_FIELDS.some((p) => p.key === key);
}

function labelForKey(key: string) {
  return PRESET_FIELDS.find((p) => p.key === key)?.label ?? key;
}

export function RegistrationFieldsEditor({ fields, onChange }: Props) {
  const presetState = Object.fromEntries(
    PRESET_FIELDS.map((p) => [p.key, fields.find((f) => f.key === p.key) ?? null])
  );
  const customFields = fields.filter((f) => !isPreset(f.key));

  function togglePreset(key: string, enabled: boolean) {
    if (enabled) {
      onChange([...fields, { key, required: false }]);
    } else {
      onChange(fields.filter((f) => f.key !== key));
    }
  }

  function setPresetRequired(key: string, required: boolean) {
    onChange(fields.map((f) => (f.key === key ? { ...f, required } : f)));
  }

  function addCustomField() {
    const newKey = `custom_${Date.now()}`;
    onChange([...fields, { key: newKey, label: "", type: "text", required: false }]);
  }

  function updateCustomField(key: string, patch: Partial<RegistrationField>) {
    onChange(fields.map((f) => (f.key === key ? { ...f, ...patch } : f)));
  }

  function removeCustomField(key: string) {
    onChange(fields.filter((f) => f.key !== key));
  }

  return (
    <div className="space-y-3">
      {/* Preset fields */}
      <div className="rounded-lg border border-charcoal/10 bg-paper p-3">
        <p className="mb-2 text-xs font-bold text-charcoal/50">預設欄位（姓名、手機永遠必填）</p>
        <div className="space-y-2">
          {PRESET_FIELDS.map(({ key, label }) => {
            const active = presetState[key] !== null;
            const required = presetState[key]?.required ?? false;
            return (
              <div key={key} className="flex items-center justify-between gap-3">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => togglePreset(key, e.target.checked)}
                    className="h-4 w-4 rounded accent-orange"
                  />
                  {label}
                </label>
                {active && (
                  <label className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-charcoal/60">
                    <input
                      type="checkbox"
                      checked={required}
                      onChange={(e) => setPresetRequired(key, e.target.checked)}
                      className="h-3.5 w-3.5 rounded accent-orange"
                    />
                    必填
                  </label>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom fields */}
      {customFields.length > 0 && (
        <div className="space-y-2">
          {customFields.map((f) => (
            <div key={f.key} className="flex items-center gap-2 rounded-lg border border-charcoal/10 bg-paper p-3">
              <GripVertical size={14} className="shrink-0 text-charcoal/30" />
              <input
                value={f.label ?? ""}
                onChange={(e) => updateCustomField(f.key, { label: e.target.value })}
                placeholder="欄位名稱（例：公司名稱）"
                className="h-9 flex-1 rounded-lg border border-charcoal/15 bg-white px-3 text-sm outline-none focus:border-mint"
              />
              <select
                value={f.type ?? "text"}
                onChange={(e) => updateCustomField(f.key, { type: e.target.value as "text" | "number" | "select" })}
                className="h-9 rounded-lg border border-charcoal/15 bg-white px-2 text-sm outline-none focus:border-mint"
              >
                <option value="text">文字</option>
                <option value="number">數字</option>
                <option value="select">單選</option>
              </select>
              {f.type === "select" && (
                <input
                  value={(f.options ?? []).join(",")}
                  onChange={(e) => updateCustomField(f.key, { options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                  placeholder="選項（用逗號分隔）"
                  className="h-9 w-36 rounded-lg border border-charcoal/15 bg-white px-3 text-sm outline-none focus:border-mint"
                />
              )}
              <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-xs font-semibold text-charcoal/60">
                <input
                  type="checkbox"
                  checked={f.required}
                  onChange={(e) => updateCustomField(f.key, { required: e.target.checked })}
                  className="h-3.5 w-3.5 rounded accent-orange"
                />
                必填
              </label>
              <button
                type="button"
                onClick={() => removeCustomField(f.key)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-charcoal/40 hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={addCustomField}
        className="flex h-9 items-center gap-2 rounded-lg border border-dashed border-charcoal/25 px-3 text-sm font-semibold text-charcoal/60 hover:border-orange/40 hover:text-orange"
      >
        <Plus size={15} />
        新增自訂欄位
      </button>
    </div>
  );
}
