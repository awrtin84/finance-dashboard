"use client";

import { useEffect, useState } from "react";
import { money, toFa } from "@/lib/format";

interface Row {
  day: number;
  title: string;
  amount: number;
  type: "income" | "expense";
}

const ROWS: Row[] = [
  { day: 18, title: "حقوق", amount: 18000000, type: "income" },
  { day: 17, title: "اجاره‌ی ماهانه", amount: 6500000, type: "expense" },
  { day: 15, title: "سوپرمارکت", amount: 840000, type: "expense" },
  { day: 12, title: "اینترنت و موبایل", amount: 490000, type: "expense" },
  { day: 9, title: "کرایه‌ی تاکسی", amount: 210000, type: "expense" },
];

const BARS = [38, 52, 44, 70, 58, 82];

function useCountUp(target: number, delay: number, duration: number) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }
    let frame = 0;
    let startedAt = 0;
    const timer = window.setTimeout(() => {
      const tick = (now: number) => {
        if (!startedAt) startedAt = now;
        const progress = Math.min((now - startedAt) / duration, 1);
        setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, delay);
    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [target, delay, duration]);

  return value;
}

export default function LedgerPreview({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  const rows = compact ? ROWS.slice(0, 4) : ROWS;
  const balance = rows.reduce((sum, r) => sum + (r.type === "income" ? r.amount : -r.amount), 0);
  const shown = useCountUp(balance, 500, 2200);

  return (
    <div
      className={`overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-900 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.55)] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 ${className}`}
    >
      <div className="flex items-end justify-between gap-4 border-b border-slate-200 px-5 pb-4 pt-5 dark:border-slate-800">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">مانده‌ی مهر {toFa(1405)}</p>
          <p className="mt-1 text-3xl font-black tabular-nums">
            {money(shown)} <span className="text-sm font-medium text-slate-500 dark:text-slate-400">تومان</span>
          </p>
        </div>
        <div className="flex h-12 items-end gap-1.5" aria-hidden="true">
          {BARS.map((height, i) => (
            <span
              key={i}
              className={`w-2.5 origin-bottom animate-grow rounded-sm ${
                i === BARS.length - 1 ? "bg-slate-900 dark:bg-white" : "bg-slate-300 dark:bg-slate-700"
              }`}
              style={{ height: `${height}%`, animationDelay: `${300 + i * 90}ms` }}
            />
          ))}
        </div>
      </div>

      <ul className="relative">
        <span
          className="pointer-events-none absolute inset-y-0 right-[5.125rem] w-px bg-slate-200 dark:bg-slate-800"
          aria-hidden="true"
        />
        {rows.map((row, i) => (
          <li
            key={row.title}
            className="grid animate-write-in grid-cols-[3.5rem_1fr_auto] items-center gap-3 border-b border-slate-100 px-5 py-3 text-sm last:border-b-0 dark:border-slate-800/70"
            style={{ animationDelay: `${700 + i * 320}ms` }}
          >
            <span className="text-slate-500 dark:text-slate-400">{toFa(row.day)} مهر</span>
            <span className="font-medium">{row.title}</span>
            <span
              className={`font-bold tabular-nums ${
                row.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
              }`}
            >
              {row.type === "income" ? "+" : "−"} {money(row.amount)}
            </span>
          </li>
        ))}
      </ul>

      {!compact && (
        <div className="border-t border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-bold">خوراک</span>
            <span className="text-slate-500 dark:text-slate-400">{toFa(82)}٪ از بودجه، نزدیک سقف</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full w-[82%] origin-right animate-fill rounded-full bg-slate-900 dark:bg-white"
              style={{ animationDelay: "2300ms" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
