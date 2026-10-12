"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import MonthPicker from "@/components/MonthPicker";
import StatCard from "@/components/StatCard";
import { api } from "@/lib/api";
import { compact, money, toFa } from "@/lib/format";
import { MONTHS, todayJalali } from "@/lib/jalali";
import type { BudgetRow, Summary } from "@/lib/types";

const tooltipFormatter = (value: unknown) => `${money(Number(value))} تومان`;

export default function DashboardPage() {
  const [month, setMonth] = useState(() => {
    const [jy, jm] = todayJalali();
    return { jy, jm };
  });
  const [summary, setSummary] = useState<Summary | null>(null);
  const [budgets, setBudgets] = useState<BudgetRow[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setError("");
    Promise.all([
      api<Summary>("/reports/summary", { query: { jy: month.jy, jm: month.jm } }),
      api<BudgetRow[]>("/budgets", { query: { jy: month.jy, jm: month.jm } }),
    ])
      .then(([s, b]) => {
        if (cancelled) return;
        setSummary(s);
        setBudgets(b);
      })
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [month]);

  const alerts = budgets
    .filter((b) => b.amount && b.spent / b.amount >= 0.8)
    .sort((a, b) => b.spent / (b.amount ?? 1) - a.spent / (a.amount ?? 1));

  const trend = summary?.trend.map((t) => ({ ...t, label: MONTHS[t.jm - 1] })) ?? [];
  const daily = summary?.daily.map((d) => ({ ...d, label: toFa(d.day) })) ?? [];
  const expenseTotal = summary?.expense ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">داشبورد</h1>
        <MonthPicker jy={month.jy} jm={month.jm} onChange={(jy, jm) => setMonth({ jy, jm })} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {!summary && !error && <p className="text-slate-500">در حال بارگذاری...</p>}

      {summary && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard title="درآمد ماه" value={`${money(summary.income)} تومان`} tone="green" />
            <StatCard title="هزینه ماه" value={`${money(summary.expense)} تومان`} tone="red" />
            <StatCard
              title="مانده"
              value={`${money(summary.balance)} تومان`}
              tone="indigo"
              hint={summary.balance < 0 ? "هزینه‌ها از درآمد بیشتر شده است" : undefined}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="card p-5">
              <h2 className="mb-4 font-bold">سهم هر دسته از هزینه‌ها</h2>
              {summary.by_category.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-500">در این ماه هزینه‌ای ثبت نشده است</p>
              ) : (
                <div className="flex flex-col items-center gap-4 sm:flex-row">
                  <div className="h-48 w-48 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={summary.by_category}
                          dataKey="total"
                          nameKey="name"
                          innerRadius={50}
                          outerRadius={85}
                          paddingAngle={2}
                          stroke="none"
                        >
                          {summary.by_category.map((c) => (
                            <Cell key={c.category_id} fill={c.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={tooltipFormatter} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <ul className="w-full space-y-2 text-sm">
                    {summary.by_category.map((c) => (
                      <li key={c.category_id} className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full" style={{ background: c.color }} />
                        <span className="flex-1">{c.name}</span>
                        <span className="text-slate-500">{toFa(Math.round((c.total / expenseTotal) * 100))}٪</span>
                        <span className="font-medium">{money(c.total)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="card p-5">
              <h2 className="mb-4 font-bold">وضعیت بودجه</h2>
              {budgets.every((b) => !b.amount) ? (
                <p className="py-10 text-center text-sm text-slate-500">برای این ماه بودجه‌ای تعریف نشده است</p>
              ) : alerts.length === 0 ? (
                <p className="py-10 text-center text-sm text-emerald-600">همه بودجه‌ها در محدوده امن هستند</p>
              ) : (
                <ul className="space-y-3">
                  {alerts.map((b) => {
                    const ratio = b.spent / (b.amount ?? 1);
                    return (
                      <li key={b.category_id}>
                        <div className="mb-1 flex justify-between text-sm">
                          <span>{b.category_name}</span>
                          <span className={ratio >= 1 ? "font-bold text-red-600" : "text-amber-600"}>
                            {toFa(Math.round(ratio * 100))}٪
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                          <div
                            className={`h-full ${ratio >= 1 ? "bg-red-500" : "bg-amber-500"}`}
                            style={{ width: `${Math.min(ratio, 1) * 100}%` }}
                          />
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {money(b.spent)} از {money(b.amount ?? 0)} تومان
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="mb-4 font-bold">روند ۶ ماه اخیر</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.3} />
                  <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 12, textAnchor: "end" }} tickFormatter={compact} width={80} orientation="right" />
                  <Tooltip formatter={tooltipFormatter} />
                  <Legend />
                  <Bar dataKey="income" name="درآمد" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="هزینه" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="mb-4 font-bold">هزینه روزانه</h2>
            <div className="h-60 text-slate-800 dark:text-slate-200">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={daily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.3} />
                  <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 11 }} interval={1} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 12, textAnchor: "end" }} tickFormatter={compact} width={80} orientation="right" />
                  <Tooltip formatter={tooltipFormatter} labelFormatter={(l) => `روز ${l}`} />
                  <Bar dataKey="expense" name="هزینه" fill="currentColor" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
