"use client";

import { toFa } from "@/lib/format";
import {
    MONTHS,
    isoToJalali,
    jalaliMonthLength,
    jalaliToIso,
    todayJalali,
} from "@/lib/jalali";

interface Props {
    value: string;
    onChange: (iso: string) => void;
}

export default function JalaliDateInput({ value, onChange }: Props) {
    const [jy, jm, jd] = isoToJalali(value);
    const [thisYear] = todayJalali();
    const years = Array.from({ length: 8 }, (_, i) => thisYear - 6 + i);
    if (!years.includes(jy)) years.unshift(jy);
    const days = Array.from(
        { length: jalaliMonthLength(jy, jm) },
        (_, i) => i + 1,
    );

    const update = (y: number, m: number, d: number) => {
        onChange(jalaliToIso(y, m, Math.min(d, jalaliMonthLength(y, m))));
    };

    return (
        <div className="grid grid-cols-3 gap-2">
            <select
                className="input"
                value={jd}
                onChange={(e) => update(jy, jm, Number(e.target.value))}
            >
                {days.map((d) => (
                    <option key={d} value={d}>
                        {toFa(d)}
                    </option>
                ))}
            </select>
            <select
                className="input"
                value={jm}
                onChange={(e) => update(jy, Number(e.target.value), jd)}
            >
                {MONTHS.map((name, i) => (
                    <option key={name} value={i + 1}>
                        {name}
                    </option>
                ))}
            </select>
            <select
                className="input"
                value={jy}
                onChange={(e) => update(Number(e.target.value), jm, jd)}
            >
                {years.map((y) => (
                    <option key={y} value={y}>
                        {toFa(y)}
                    </option>
                ))}
            </select>
        </div>
    );
}
