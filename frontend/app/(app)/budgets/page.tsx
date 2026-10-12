"use client";

import { useCallback, useEffect, useState } from "react";
import MonthPicker from "@/components/MonthPicker";
import { api } from "@/lib/api";
import { money, parseAmount, toFa } from "@/lib/format";
import { todayJalali } from "@/lib/jalali";
import type { BudgetRow } from "@/lib/types";

export default function BudgetsPage() {
  const [month, setMonth] = useState(() => {
    const [jy, jm] = todayJalali();
    return { jy, jm };
  });
  const [rows, setRows] = useState<BudgetRow[] | null>(null);
  const [inputs, setInputs] = useState<Record<number, number>>({});
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api<BudgetRow[]>("/budgets", { query: { jy: month.jy, jm: month.jm } });
      setRows(data);
      setInputs(Object.fromEntries(data.map((r) => [r.category_id, r.amount ?? 0])));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "بارگذاری انجام نشد");
    }
  }, [month]);

  useEffect(() => {
    setRows(null);
    load();
  }, [load]);

  const save = async (row: BudgetRow) => {
    const amount = inputs[row.category_id] ?? 0;
    if (amount === (row.amount ?? 0)) return;
    setSavingId(row.category_id);
    try {
      await api("/budgets", {
        method: "PUT",
        body: { category_id: row.category_id, jy: month.jy, jm: month.jm, amount },
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "ذخیره انجام نشد");
    } finally {
      setSavingId(null);
    }
  };

  const totalBudget = rows?.reduce((sum, r) => sum + (r.amount ?? 0), 0) ?? 0;
  const totalSpent = rows?.reduce((sum, r) => sum + (r.amount ? r.spent : 0), 0) ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">بودجه ماهانه</h1>
        <MonthPicker jy={month.jy} jm={month.jm} onChange={(jy, jm) => setMonth({ jy, jm })} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {!rows && !error && <p className="text-slate-500">در حال بارگذاری...</p>}

      {rows && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card p-4">
              <p className="text-sm text-slate-500">مجموع بودجه تعریف‌شده</p>
              <p className="mt-1 font-bold">{money(totalBudget)} تومان</p>
            </div>
            <div className="card p-4">
              <p className="text-sm text-slate-500">هزینه در دسته‌های دارای بودجه</p>
              <p className="mt-1 font-bold">{money(totalSpent)} تومان</p>
            </div>
          </div>

          <div className="space-y-3">
            {rows.map((row) => {
              const ratio = row.amount ? row.spent / row.amount : 0;
              const barColor = ratio >= 1 ? "bg-red-500" : ratio >= 0.8 ? "bg-amber-500" : "bg-emerald-500";
              const remaining = (row.amount ?? 0) - row.spent;
              return (
                <div key={row.category_id} className="card p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 font-medium">
                      <span className="h-3 w-3 rounded-full" style={{ background: row.category_color }} />
                      {row.category_name}
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        className="input w-40 text-left"
                        dir="ltr"
                        inputMode="numeric"
                        placeholder="بودجه (تومان)"
                        value={inputs[row.category_id] ? money(inputs[row.category_id]) : ""}
                        onChange={(e) => setInputs({ ...inputs, [row.category_id]: parseAmount(e.target.value) })}
                        onBlur={() => save(row)}
                        onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                        disabled={savingId === row.category_id}
                      />
                    </div>
                  </div>

                  {row.amount ? (
                    <div className="mt-3">
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                        <div className={`h-full ${barColor}`} style={{ width: `${Math.min(ratio, 1) * 100}%` }} />
                      </div>
                      <div className="mt-2 flex justify-between text-xs text-slate-500">
                        <span>
                          {money(row.spent)} از {money(row.amount)} ({toFa(Math.round(ratio * 100))}٪)
                        </span>
                        <span className={remaining < 0 ? "font-medium text-red-600" : ""}>
                          {remaining < 0 ? `${money(-remaining)} بیشتر از بودجه` : `${money(remaining)} باقی‌مانده`}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-slate-500">
                      بودجه‌ای تعریف نشده{row.spent ? ` — هزینه این ماه: ${money(row.spent)} تومان` : ""}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-slate-500">
            برای حذف بودجه یک دسته، مقدار را خالی کنید. تغییرات با خروج از فیلد ذخیره می‌شوند.
          </p>
        </>
      )}
    </div>
  );
}
