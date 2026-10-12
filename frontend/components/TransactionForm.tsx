"use client";

import { FormEvent, useState } from "react";
import JalaliDateInput from "@/components/JalaliDateInput";
import { ApiError } from "@/lib/api";
import { money, parseAmount } from "@/lib/format";
import { todayIso } from "@/lib/jalali";
import type { Category, Transaction, TxPayload, TxType } from "@/lib/types";

interface Props {
  categories: Category[];
  initial?: Transaction | null;
  onSubmit: (payload: TxPayload) => Promise<void>;
  onCancel: () => void;
}

export default function TransactionForm({ categories, initial, onSubmit, onCancel }: Props) {
  const [type, setType] = useState<TxType>(initial?.type ?? "expense");
  const [amount, setAmount] = useState<number>(initial?.amount ?? 0);
  const [categoryId, setCategoryId] = useState<number | "">(initial?.category_id ?? "");
  const [date, setDate] = useState(initial?.date ?? todayIso());
  const [note, setNote] = useState(initial?.note ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const options = categories.filter((c) => c.type === type);
  const effectiveCategory = options.some((c) => c.id === categoryId) ? categoryId : (options[0]?.id ?? "");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!amount) return setError("مبلغ را وارد کنید");
    if (effectiveCategory === "") return setError("یک دسته‌بندی انتخاب کنید");
    setSaving(true);
    try {
      await onSubmit({ type, amount, category_id: effectiveCategory, date, note });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "ذخیره انجام نشد");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
        {(["expense", "income"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`rounded-lg py-2 text-sm font-medium transition ${
              type === t
                ? t === "expense"
                  ? "bg-red-600 text-white"
                  : "bg-emerald-600 text-white"
                : "text-slate-600 dark:text-slate-300"
            }`}
          >
            {t === "expense" ? "هزینه" : "درآمد"}
          </button>
        ))}
      </div>

      <div>
        <label className="label">مبلغ (تومان)</label>
        <input
          className="input text-left"
          dir="ltr"
          inputMode="numeric"
          placeholder="۰"
          value={amount ? money(amount) : ""}
          onChange={(e) => setAmount(parseAmount(e.target.value))}
        />
      </div>

      <div>
        <label className="label">دسته‌بندی</label>
        <select
          className="input"
          value={effectiveCategory}
          onChange={(e) => setCategoryId(Number(e.target.value))}
        >
          {options.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">تاریخ</label>
        <JalaliDateInput value={date} onChange={setDate} />
      </div>

      <div>
        <label className="label">توضیحات</label>
        <input className="input" maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2">
        <button type="button" className="btn-ghost" onClick={onCancel}>
          انصراف
        </button>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "در حال ذخیره..." : "ذخیره"}
        </button>
      </div>
    </form>
  );
}
