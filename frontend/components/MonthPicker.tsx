"use client";

import { toFa } from "@/lib/format";
import { MONTHS, shiftMonth } from "@/lib/jalali";

interface Props {
  jy: number;
  jm: number;
  onChange: (jy: number, jm: number) => void;
}

export default function MonthPicker({ jy, jm, onChange }: Props) {
  const go = (delta: number) => {
    const [y, m] = shiftMonth(jy, jm, delta);
    onChange(y, m);
  };

  return (
    <div className="card inline-flex items-center gap-1 p-1 print:hidden">
      <button className="btn rounded-lg px-3 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => go(-1)} aria-label="ماه قبل">
        →
      </button>
      <span className="min-w-32 text-center text-sm font-bold">
        {MONTHS[jm - 1]} {toFa(jy)}
      </span>
      <button className="btn rounded-lg px-3 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => go(1)} aria-label="ماه بعد">
        ←
      </button>
    </div>
  );
}
