import type { RegistrationField } from "@monmate/types";

const PRESET_KEYS = ["email", "age", "gender", "capacity"] as const;

const genderOptions = [
  { value: "M", label: "男" },
  { value: "F", label: "女" },
  { value: "OTHER", label: "其他" }
];

export type RegistrationFieldValues = {
  email: string;
  age: string;
  gender: string;
  capacity: string;
  custom: Record<string, string>;
};

export function emptyRegistrationFieldValues(): RegistrationFieldValues {
  return { email: "", age: "", gender: "", capacity: "1", custom: {} };
}

function splitFields(fields: RegistrationField[]) {
  const presetMap = Object.fromEntries(
    PRESET_KEYS.map((k) => [k, fields.find((f) => f.key === k) ?? null])
  ) as Record<(typeof PRESET_KEYS)[number], RegistrationField | null>;
  const customFields = fields.filter((f) => !PRESET_KEYS.includes(f.key as (typeof PRESET_KEYS)[number]));
  return { presetMap, customFields };
}

export function validateRegistrationFields(fields: RegistrationField[], values: RegistrationFieldValues) {
  const { presetMap, customFields } = splitFields(fields);
  if (presetMap.email?.required && !values.email.trim()) return "請填寫電子郵件";
  if (presetMap.age?.required && !values.age) return "請填寫年齡";
  if (presetMap.gender?.required && !values.gender) return "請選擇性別";
  if (presetMap.capacity?.required && !values.capacity) return "請填寫報名人數";
  if (presetMap.capacity && values.capacity && Number(values.capacity) < 1) return "報名人數至少為 1 人";
  for (const f of customFields) {
    if (f.required && !values.custom[f.key]?.trim()) return `請填寫「${f.label ?? f.key}」`;
  }
  return null;
}

export function buildRegistrationFieldsPayload(fields: RegistrationField[], values: RegistrationFieldValues) {
  const { presetMap, customFields } = splitFields(fields);
  const customPayload: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(values.custom)) {
    const field = customFields.find((f) => f.key === k);
    if (!field || !v.trim()) continue;
    customPayload[k] = field.type === "number" ? Number(v) : v.trim();
  }
  return {
    email: values.email.trim() || undefined,
    age: values.age ? Number(values.age) : undefined,
    gender: values.gender || undefined,
    capacity: presetMap.capacity && values.capacity ? Number(values.capacity) : undefined,
    customFields: Object.keys(customPayload).length > 0 ? customPayload : undefined
  };
}

export function RegistrationFieldsFieldset({
  fields,
  values,
  onChange
}: {
  fields: RegistrationField[];
  values: RegistrationFieldValues;
  onChange: (values: RegistrationFieldValues) => void;
}) {
  const { presetMap, customFields } = splitFields(fields);

  return (
    <>
      {presetMap.email && (
        <label className="block text-sm font-semibold">
          電子郵件 {presetMap.email.required && <span className="text-orange">*</span>}
          <input
            type="email"
            value={values.email}
            onChange={(e) => onChange({ ...values, email: e.target.value })}
            className="mt-2 h-11 w-full rounded-lg border border-charcoal/15 bg-paper px-3 outline-none focus:border-mint"
            placeholder="example@email.com"
          />
        </label>
      )}

      {presetMap.age && (
        <label className="block text-sm font-semibold">
          年齡 {presetMap.age.required && <span className="text-orange">*</span>}
          <input
            type="number"
            min={1}
            max={120}
            value={values.age}
            onChange={(e) => onChange({ ...values, age: e.target.value })}
            className="mt-2 h-11 w-full rounded-lg border border-charcoal/15 bg-paper px-3 outline-none focus:border-mint"
            placeholder="請輸入年齡"
          />
        </label>
      )}

      {presetMap.gender && (
        <div className="text-sm font-semibold">
          性別 {presetMap.gender.required && <span className="text-orange">*</span>}
          <div className="mt-2 flex gap-3">
            {genderOptions.map((opt) => (
              <label
                key={opt.value}
                className={`flex flex-1 cursor-pointer items-center justify-center rounded-lg border py-2.5 text-sm font-semibold transition-colors ${
                  values.gender === opt.value ? "border-orange bg-orange/10 text-orange" : "border-charcoal/15 bg-paper"
                }`}
              >
                <input
                  type="radio"
                  name="gender"
                  value={opt.value}
                  checked={values.gender === opt.value}
                  onChange={() => onChange({ ...values, gender: opt.value })}
                  className="sr-only"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
      )}

      {presetMap.capacity && (
        <label className="block text-sm font-semibold">
          報名人數 {presetMap.capacity.required && <span className="text-orange">*</span>}
          <input
            type="number"
            min={1}
            max={999}
            value={values.capacity}
            onChange={(e) => onChange({ ...values, capacity: e.target.value })}
            className="mt-2 h-11 w-full rounded-lg border border-charcoal/15 bg-paper px-3 outline-none focus:border-mint"
            placeholder="請輸入報名人數"
          />
        </label>
      )}

      {customFields.map((f) => {
        const label = f.label ?? f.key;
        const val = values.custom[f.key] ?? "";
        const setVal = (v: string) => onChange({ ...values, custom: { ...values.custom, [f.key]: v } });

        if (f.type === "select" && f.options && f.options.length > 0) {
          return (
            <div key={f.key} className="text-sm font-semibold">
              {label} {f.required && <span className="text-orange">*</span>}
              <div className="mt-2 flex flex-wrap gap-2">
                {f.options.map((opt) => (
                  <label
                    key={opt}
                    className={`flex cursor-pointer items-center rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                      val === opt ? "border-orange bg-orange/10 text-orange" : "border-charcoal/15 bg-paper"
                    }`}
                  >
                    <input type="radio" name={f.key} value={opt} checked={val === opt} onChange={() => setVal(opt)} className="sr-only" />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          );
        }

        return (
          <label key={f.key} className="block text-sm font-semibold">
            {label} {f.required && <span className="text-orange">*</span>}
            <input
              type={f.type === "number" ? "number" : "text"}
              value={val}
              onChange={(e) => setVal(e.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-charcoal/15 bg-paper px-3 outline-none focus:border-mint"
              placeholder={`請輸入${label}`}
            />
          </label>
        );
      })}
    </>
  );
}
