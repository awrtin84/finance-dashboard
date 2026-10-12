"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { money, parseAmount, toFa } from "@/lib/format";
import type { Category, RecurringRule, TxType } from "@/lib/types";

export default function RecurringPage() {
  const [rules, setRules] = useState<RecurringRule[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [type, setType] = useState<TxType>("expense");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [amount, setAmount] = useState(0);
  const [day, setDay] = useState(1);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [r, c] = await Promise.all([api<RecurringRule[]>("/recurring"), api<Category[]>("/categories")]);
      setRules(r);
      setCategories(c);
    } catch (e) {
      setError(e instanceof Error ? e.message : "بارگذاری انجام نشد");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const options = categories.filter((c) => c.type === type);
  const effectiveCategory = options.some((c) => c.id === categoryId) ? categoryId : (options[0]?.id ?? "");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!amount) return setError("مبلغ را وارد کنید");
    if (effectiveCategory === "") return setError("یک دسته‌بندی انتخاب کنید");
    setSaving(true);
    try {
      await api("/recurring", {
        method: "POST",
        body: { type, amount, category_id: effectiveCategory, day_of_month: day, note },
      });
      setAmount(0);
      setNote("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "ذخیره انجام نشد");
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (rule: RecurringRule) => {
    try {
      await api(`/recurring/${rule.id}`, { method: "PATCH", body: { active: !rule.active } });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "تغییر انجام نشد");
    }
  };

  const remove = async (rule: RecurringRule) => {
    if (!confirm("این مورد حذف شود؟ تراکنش‌های ثبت‌شده قبلی باقی می‌مانند.")) return;
    try {
      await api(`/recurring/${rule.id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "حذف انجام نشد");
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">تراکنش‌های تکرارشونده</h1>
      <p className="text-sm text-slate-500">
        مواردی مثل اجاره یا قسط که هر ماه در روز مشخصی به‌صورت خودکار ثبت می‌شوند.
      </p>

      <form onSubmit={submit} className="card grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <label className="label">نوع</label>
          <select className="input" value={type} onChange={(e) => setType(e.target.value as TxType)}>
            <option value="expense">هزینه</option>
            <option value="income">درآمد</option>
          </select>
        </div>
        <div>
          <label className="label">دسته‌بندی</label>
          <select className="input" value={effectiveCategory} onChange={(e) => setCategoryId(Number(e.target.value))}>
            {options.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">مبلغ (تومان)</label>
          <input
            className="input text-left"
            dir="ltr"
            inputMode="numeric"
            value={amount ? money(amount) : ""}
            onChange={(e) => setAmount(parseAmount(e.target.value))}
          />
        </div>
        <div>
          <label className="label">روز ماه</label>
          <select className="input" value={day} onChange={(e) => setDay(Number(e.target.value))}>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>
                {toFa(d)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">توضیحات</label>
          <input className="input" maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <div className="sm:col-span-2 lg:col-span-5">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "در حال ذخیره..." : "افزودن"}
          </button>
        </div>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-right text-slate-500 dark:border-slate-800">
              <th className="p-3 font-medium">روز</th>
              <th className="p-3 font-medium">دسته‌بندی</th>
              <th className="p-3 font-medium">توضیحات</th>
              <th className="p-3 font-medium">مبلغ</th>
              <th className="p-3 font-medium">وضعیت</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {!rules && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  در حال بارگذاری...
                </td>
              </tr>
            )}
            {rules && rules.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  هنوز موردی تعریف نشده است
                </td>
              </tr>
            )}
            {rules?.map((rule) => (
              <tr
                key={rule.id}
                className={`border-b border-slate-100 last:border-0 dark:border-slate-800/60 ${
                  rule.active ? "" : "opacity-50"
                }`}
              >
                <td className="p-3">{toFa(rule.day_of_month)} هر ماه</td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: rule.category_color }} />
                    {rule.category_name}
                  </span>
                </td>
                <td className="p-3">{rule.note || "—"}</td>
                <td className={`p-3 font-medium ${rule.type === "income" ? "text-emerald-600" : "text-red-600"}`}>
                  {money(rule.amount)}
                </td>
                <td className="p-3">
                  <button className="text-indigo-600 hover:underline" onClick={() => toggle(rule)}>
                    {rule.active ? "فعال" : "غیرفعال"}
                  </button>
                </td>
                <td className="p-3 text-left">
                  <button className="text-red-600 hover:underline" onClick={() => remove(rule)}>
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
