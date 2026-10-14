import { toFa } from "./format";

export const MONTHS = [
    "فروردین",
    "اردیبهشت",
    "خرداد",
    "تیر",
    "مرداد",
    "شهریور",
    "مهر",
    "آبان",
    "آذر",
    "دی",
    "بهمن",
    "اسفند",
];

export function toJalali(
    gy: number,
    gm: number,
    gd: number,
): [number, number, number] {
    const gdm = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    const gy2 = gm > 2 ? gy + 1 : gy;
    let days =
        355666 +
        365 * gy +
        Math.floor((gy2 + 3) / 4) -
        Math.floor((gy2 + 99) / 100) +
        Math.floor((gy2 + 399) / 400) +
        gd +
        gdm[gm - 1];
    let jy = -1595 + 33 * Math.floor(days / 12053);
    days %= 12053;
    jy += 4 * Math.floor(days / 1461);
    days %= 1461;
    if (days > 365) {
        jy += Math.floor((days - 1) / 365);
        days = (days - 1) % 365;
    }
    const jm =
        days < 186
            ? 1 + Math.floor(days / 31)
            : 7 + Math.floor((days - 186) / 30);
    const jd = days < 186 ? 1 + (days % 31) : 1 + ((days - 186) % 30);
    return [jy, jm, jd];
}

export function toGregorian(
    jy: number,
    jm: number,
    jd: number,
): [number, number, number] {
    const y = jy + 1595;
    let days =
        -355668 +
        365 * y +
        Math.floor(y / 33) * 8 +
        Math.floor(((y % 33) + 3) / 4) +
        jd;
    days += jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186;
    let gy = 400 * Math.floor(days / 146097);
    days %= 146097;
    if (days > 36524) {
        days -= 1;
        gy += 100 * Math.floor(days / 36524);
        days %= 36524;
        if (days >= 365) days += 1;
    }
    gy += 4 * Math.floor(days / 1461);
    days %= 1461;
    if (days > 365) {
        gy += Math.floor((days - 1) / 365);
        days = (days - 1) % 365;
    }
    let gd = days + 1;
    const leap = (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0;
    const sal = [0, 31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let gm = 0;
    while (gm < 13 && gd > sal[gm]) {
        gd -= sal[gm];
        gm += 1;
    }
    return [gy, gm, gd];
}

const pad = (n: number) => String(n).padStart(2, "0");

export function isoToJalali(iso: string): [number, number, number] {
    const [y, m, d] = iso.split("-").map(Number);
    return toJalali(y, m, d);
}

export function jalaliToIso(jy: number, jm: number, jd: number): string {
    const [y, m, d] = toGregorian(jy, jm, jd);
    return `${y}-${pad(m)}-${pad(d)}`;
}

export function jalaliMonthLength(jy: number, jm: number): number {
    const [ny, nm] = jm === 12 ? [jy + 1, 1] : [jy, jm + 1];
    const [a, b, c] = toGregorian(jy, jm, 1);
    const [d, e, f] = toGregorian(ny, nm, 1);
    return Math.round(
        (Date.UTC(d, e - 1, f) - Date.UTC(a, b - 1, c)) / 86400000,
    );
}

export function todayJalali(): [number, number, number] {
    const now = new Date();
    return toJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export function todayIso(): string {
    const now = new Date();
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function monthRangeIso(
    jy: number,
    jm: number,
): { start: string; end: string } {
    return {
        start: jalaliToIso(jy, jm, 1),
        end: jalaliToIso(jy, jm, jalaliMonthLength(jy, jm)),
    };
}

export function formatJalali(iso: string): string {
    const [jy, jm, jd] = isoToJalali(iso);
    return `${toFa(jd)} ${MONTHS[jm - 1]} ${toFa(jy)}`;
}

export function shiftMonth(
    jy: number,
    jm: number,
    delta: number,
): [number, number] {
    const idx = jy * 12 + (jm - 1) + delta;
    return [Math.floor(idx / 12), (idx % 12) + 1];
}
