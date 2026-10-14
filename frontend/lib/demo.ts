import {
    isoToJalali,
    jalaliMonthLength,
    jalaliToIso,
    shiftMonth,
    todayIso,
    todayJalali,
} from "@/lib/jalali";
import type { TxType } from "@/lib/types";

export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO === "1";
export const DEMO_TOKEN = "demo-token";

const STORAGE_KEY = "fd_demo_db_v2";

interface DemoCategory {
    id: number;
    name: string;
    type: TxType;
    color: string;
}

interface DemoTransaction {
    id: number;
    type: TxType;
    amount: number;
    note: string;
    date: string;
    category_id: number;
}

interface DemoBudget {
    category_id: number;
    jy: number;
    jm: number;
    amount: number;
}

interface DemoRule {
    id: number;
    type: TxType;
    amount: number;
    note: string;
    day_of_month: number;
    category_id: number;
    active: boolean;
}

interface DemoDb {
    nextId: number;
    user: { id: number; name: string; email: string };
    categories: DemoCategory[];
    transactions: DemoTransaction[];
    budgets: DemoBudget[];
    rules: DemoRule[];
}

interface DemoResult {
    status: number;
    data?: unknown;
    csv?: string;
}

const CATEGORIES: [string, TxType, string][] = [
    ["خوراک", "expense", "#f97316"],
    ["مسکن", "expense", "#6366f1"],
    ["حمل‌ونقل", "expense", "#0ea5e9"],
    ["قبوض", "expense", "#eab308"],
    ["سلامت", "expense", "#ef4444"],
    ["آموزش", "expense", "#8b5cf6"],
    ["تفریح", "expense", "#ec4899"],
    ["خرید", "expense", "#14b8a6"],
    ["سایر", "expense", "#64748b"],
    ["حقوق", "income", "#22c55e"],
    ["فریلنس", "income", "#10b981"],
    ["سایر درآمدها", "income", "#84cc16"],
];

const MONTHLY: [string, TxType, number, number, string][] = [
    ["حقوق", "income", 1, 28000000, "حقوق ماهانه"],
    ["فریلنس", "income", 12, 6500000, "پروژه‌ی طراحی سایت"],
    ["مسکن", "expense", 2, 9000000, "اجاره‌ی ماهانه"],
    ["قبوض", "expense", 5, 1150000, "برق، آب و گاز"],
    ["قبوض", "expense", 6, 490000, "اینترنت و موبایل"],
    ["خوراک", "expense", 4, 1800000, "خرید هفتگی سوپرمارکت"],
    ["خوراک", "expense", 11, 1650000, "خرید هفتگی سوپرمارکت"],
    ["خوراک", "expense", 18, 2100000, "خرید هفتگی سوپرمارکت"],
    ["خوراک", "expense", 25, 1400000, "رستوران و کافه"],
    ["حمل‌ونقل", "expense", 8, 650000, "اسنپ و تاکسی"],
    ["حمل‌ونقل", "expense", 21, 900000, "بنزین"],
    ["سلامت", "expense", 14, 1300000, "ویزیت و دارو"],
    ["آموزش", "expense", 9, 2400000, "دوره‌ی آنلاین"],
    ["تفریح", "expense", 20, 1750000, "سینما و گردش"],
    ["خرید", "expense", 16, 3200000, "لباس"],
    ["سایر", "expense", 23, 420000, "هدیه"],
];

const BUDGETS: Record<string, number> = {
    خوراک: 7000000,
    حمل‌ونقل: 2000000,
    تفریح: 2500000,
    خرید: 3000000,
    قبوض: 1800000,
};

const RULES: [string, TxType, number, number, string][] = [
    ["مسکن", "expense", 2, 9000000, "اجاره‌ی ماهانه"],
    ["قبوض", "expense", 6, 490000, "اینترنت و موبایل"],
    ["حقوق", "income", 1, 28000000, "حقوق ماهانه"],
];

class DemoError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

function seed(): DemoDb {
    let id = 1;
    const categories: DemoCategory[] = CATEGORIES.map(
        ([name, type, color]) => ({ id: id++, name, type, color }),
    );
    const find = (name: string, type: TxType) =>
        categories.find((c) => c.name === name && c.type === type)!.id;
    const [cy, cm] = todayJalali();
    const today = todayIso();
    const transactions: DemoTransaction[] = [];
    const budgets: DemoBudget[] = [];

    const spread = [0.82, 0.95, 0.88, 1.06, 0.97, 1];
    [-5, -4, -3, -2, -1, 0].forEach((offset, index) => {
        const [y, m] = shiftMonth(cy, cm, offset);
        for (const [name, type, day, base, note] of MONTHLY) {
            const date = jalaliToIso(
                y,
                m,
                Math.min(day, jalaliMonthLength(y, m)),
            );
            if (date > today) continue;
            const amount =
                type === "expense"
                    ? Math.round((base * spread[index]) / 10000) * 10000
                    : base;
            transactions.push({
                id: id++,
                type,
                amount,
                note,
                date,
                category_id: find(name, type),
            });
        }
    });

    for (const [name, amount] of Object.entries(BUDGETS)) {
        for (const offset of [-1, 0]) {
            const [y, m] = shiftMonth(cy, cm, offset);
            budgets.push({
                category_id: find(name, "expense"),
                jy: y,
                jm: m,
                amount,
            });
        }
    }

    const rules: DemoRule[] = RULES.map(([name, type, day, amount, note]) => ({
        id: id++,
        type,
        amount,
        note,
        day_of_month: day,
        category_id: find(name, type),
        active: true,
    }));

    return {
        nextId: id,
        user: { id: 1, name: "کاربر آزمایشی", email: "demo@example.com" },
        categories,
        transactions,
        budgets,
        rules,
    };
}

let cache: DemoDb | null = null;

function load(): DemoDb {
    if (cache) return cache;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            cache = JSON.parse(raw) as DemoDb;
            return cache;
        }
    } catch {}
    cache = seed();
    persist();
    return cache;
}

function persist() {
    try {
        if (cache) localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
    } catch {}
}

export function enterDemo() {
    try {
        localStorage.setItem("fd_token", DEMO_TOKEN);
    } catch {}
}

export function resetDemo() {
    cache = seed();
    persist();
}

function categoryOf(db: DemoDb, id: number): DemoCategory {
    const category = db.categories.find((c) => c.id === id);
    if (!category) throw new DemoError(404, "دسته‌بندی پیدا نشد");
    return category;
}

function monthBounds(jy: number, jm: number): [string, string] {
    const [ny, nm] = shiftMonth(jy, jm, 1);
    return [jalaliToIso(jy, jm, 1), jalaliToIso(ny, nm, 1)];
}

function txOut(db: DemoDb, t: DemoTransaction) {
    const category = categoryOf(db, t.category_id);
    return {
        ...t,
        category_name: category.name,
        category_color: category.color,
    };
}

function ruleOut(db: DemoDb, rule: DemoRule) {
    const category = categoryOf(db, rule.category_id);
    return {
        ...rule,
        category_name: category.name,
        category_color: category.color,
    };
}

type Query = Record<string, string | number | undefined | null>;

function filtered(db: DemoDb, query: Query): DemoTransaction[] {
    const q = String(query.q ?? "").toLowerCase();
    return db.transactions
        .filter(
            (t) =>
                (!query.start || t.date >= String(query.start)) &&
                (!query.end || t.date <= String(query.end)),
        )
        .filter((t) => !query.type || t.type === query.type)
        .filter(
            (t) =>
                !query.category_id ||
                t.category_id === Number(query.category_id),
        )
        .filter((t) => !q || t.note.toLowerCase().includes(q))
        .sort((a, b) =>
            a.date === b.date ? b.id - a.id : a.date < b.date ? 1 : -1,
        );
}

function validateTx(db: DemoDb, body: Record<string, unknown>) {
    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount <= 0)
        throw new DemoError(422, "اطلاعات واردشده معتبر نیست");
    const category = categoryOf(db, Number(body.category_id));
    if (category.type !== body.type)
        throw new DemoError(400, "نوع تراکنش با نوع دسته‌بندی هماهنگ نیست");
    const date = String(body.date ?? "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
        throw new DemoError(422, "اطلاعات واردشده معتبر نیست");
    return {
        type: body.type as TxType,
        amount: Math.round(amount),
        category_id: category.id,
        date,
        note: String(body.note ?? "")
            .trim()
            .slice(0, 300),
    };
}

function totalsFor(db: DemoDb, start: string, end: string) {
    const totals = { income: 0, expense: 0 };
    for (const t of db.transactions) {
        if (t.date >= start && t.date < end) totals[t.type] += t.amount;
    }
    return totals;
}

function summary(db: DemoDb, jy: number, jm: number) {
    const [start, end] = monthBounds(jy, jm);
    const totals = totalsFor(db, start, end);
    const byCategory = new Map<number, number>();
    const daily = Array.from({ length: jalaliMonthLength(jy, jm) }, (_, i) => ({
        day: i + 1,
        income: 0,
        expense: 0,
    }));

    for (const t of db.transactions) {
        if (t.date < start || t.date >= end) continue;
        if (t.type === "expense")
            byCategory.set(
                t.category_id,
                (byCategory.get(t.category_id) ?? 0) + t.amount,
            );
        daily[isoToJalali(t.date)[2] - 1][t.type] += t.amount;
    }

    const trend = [-5, -4, -3, -2, -1, 0].map((offset) => {
        const [y, m] = shiftMonth(jy, jm, offset);
        const [s, e] = monthBounds(y, m);
        return { jy: y, jm: m, ...totalsFor(db, s, e) };
    });

    return {
        income: totals.income,
        expense: totals.expense,
        balance: totals.income - totals.expense,
        by_category: [...byCategory.entries()]
            .map(([id, total]) => {
                const category = categoryOf(db, id);
                return {
                    category_id: id,
                    name: category.name,
                    color: category.color,
                    total,
                };
            })
            .sort((a, b) => b.total - a.total),
        daily,
        trend,
    };
}

function budgets(db: DemoDb, jy: number, jm: number) {
    const [start, end] = monthBounds(jy, jm);
    return db.categories
        .filter((c) => c.type === "expense")
        .map((c) => {
            const spent = db.transactions
                .filter(
                    (t) =>
                        t.category_id === c.id &&
                        t.type === "expense" &&
                        t.date >= start &&
                        t.date < end,
                )
                .reduce((sum, t) => sum + t.amount, 0);
            const budget = db.budgets.find(
                (b) => b.category_id === c.id && b.jy === jy && b.jm === jm,
            );
            return {
                category_id: c.id,
                category_name: c.name,
                category_color: c.color,
                amount: budget ? budget.amount : null,
                spent,
            };
        });
}

function csv(db: DemoDb, query: Query): string {
    const rows = [["تاریخ", "نوع", "دسته‌بندی", "مبلغ (تومان)", "توضیحات"]];
    for (const t of filtered(db, query)) {
        const [jy, jm, jd] = isoToJalali(t.date);
        rows.push([
            `${jy}/${String(jm).padStart(2, "0")}/${String(jd).padStart(2, "0")}`,
            t.type === "income" ? "درآمد" : "هزینه",
            categoryOf(db, t.category_id).name,
            String(t.amount),
            t.note,
        ]);
    }
    const escape = (cell: string) => `"${cell.replace(/"/g, '""')}"`;
    return "﻿" + rows.map((row) => row.map(escape).join(",")).join("\n");
}

function route(
    db: DemoDb,
    path: string,
    method: string,
    body: Record<string, unknown>,
    query: Query,
): DemoResult {
    const parts = path.split("/").filter(Boolean);
    const [resource, rawId] = parts;
    const id =
        rawId && rawId !== "export" && rawId !== "summary"
            ? Number(rawId)
            : null;

    if (resource === "auth") {
        if (rawId === "me") return { status: 200, data: db.user };
        return {
            status: method === "POST" && rawId === "register" ? 201 : 200,
            data: { access_token: DEMO_TOKEN, token_type: "bearer" },
        };
    }

    if (resource === "categories") {
        if (method === "GET")
            return {
                status: 200,
                data: [...db.categories].sort((a, b) =>
                    a.type === b.type ? a.id - b.id : a.type < b.type ? -1 : 1,
                ),
            };
        if (method === "POST") {
            const name = String(body.name ?? "").trim();
            const type = body.type as TxType;
            if (!name || (type !== "income" && type !== "expense"))
                throw new DemoError(422, "اطلاعات واردشده معتبر نیست");
            if (db.categories.some((c) => c.name === name && c.type === type))
                throw new DemoError(409, "این دسته‌بندی قبلاً وجود دارد");
            const category = {
                id: db.nextId++,
                name,
                type,
                color: String(body.color ?? "#6366f1"),
            };
            db.categories.push(category);
            return { status: 201, data: category };
        }
        if (method === "PUT" && id) {
            const category = categoryOf(db, id);
            const name = String(body.name ?? "").trim();
            if (
                db.categories.some(
                    (c) =>
                        c.id !== id &&
                        c.name === name &&
                        c.type === category.type,
                )
            )
                throw new DemoError(409, "این دسته‌بندی قبلاً وجود دارد");
            category.name = name || category.name;
            category.color = String(body.color ?? category.color);
            return { status: 200, data: category };
        }
        if (method === "DELETE" && id) {
            const category = categoryOf(db, id);
            if (
                db.transactions.some((t) => t.category_id === id) ||
                db.rules.some((r) => r.category_id === id)
            )
                throw new DemoError(
                    409,
                    "این دسته‌بندی در تراکنش‌ها یا تراکنش‌های تکرارشونده استفاده شده و قابل حذف نیست",
                );
            db.budgets = db.budgets.filter((b) => b.category_id !== id);
            db.categories = db.categories.filter((c) => c.id !== category.id);
            return { status: 204 };
        }
    }

    if (resource === "transactions") {
        if (rawId === "export") return { status: 200, csv: csv(db, query) };
        if (method === "GET") {
            const items = filtered(db, query);
            return {
                status: 200,
                data: {
                    items: items.slice(0, 500).map((t) => txOut(db, t)),
                    total: items.length,
                    income: items
                        .filter((t) => t.type === "income")
                        .reduce((s, t) => s + t.amount, 0),
                    expense: items
                        .filter((t) => t.type === "expense")
                        .reduce((s, t) => s + t.amount, 0),
                },
            };
        }
        if (method === "POST") {
            const transaction = { id: db.nextId++, ...validateTx(db, body) };
            db.transactions.push(transaction);
            return { status: 201, data: txOut(db, transaction) };
        }
        if (method === "PUT" && id) {
            const transaction = db.transactions.find((t) => t.id === id);
            if (!transaction) throw new DemoError(404, "تراکنش پیدا نشد");
            Object.assign(transaction, validateTx(db, body));
            return { status: 200, data: txOut(db, transaction) };
        }
        if (method === "DELETE" && id) {
            if (!db.transactions.some((t) => t.id === id))
                throw new DemoError(404, "تراکنش پیدا نشد");
            db.transactions = db.transactions.filter((t) => t.id !== id);
            return { status: 204 };
        }
    }

    if (resource === "budgets") {
        if (method === "GET")
            return {
                status: 200,
                data: budgets(db, Number(query.jy), Number(query.jm)),
            };
        if (method === "PUT") {
            const category = categoryOf(db, Number(body.category_id));
            const jy = Number(body.jy);
            const jm = Number(body.jm);
            const amount = Math.max(0, Math.round(Number(body.amount) || 0));
            db.budgets = db.budgets.filter(
                (b) =>
                    !(
                        b.category_id === category.id &&
                        b.jy === jy &&
                        b.jm === jm
                    ),
            );
            if (amount > 0)
                db.budgets.push({ category_id: category.id, jy, jm, amount });
            return { status: 204 };
        }
    }

    if (resource === "recurring") {
        if (method === "GET")
            return {
                status: 200,
                data: [...db.rules]
                    .sort(
                        (a, b) =>
                            a.day_of_month - b.day_of_month || a.id - b.id,
                    )
                    .map((r) => ruleOut(db, r)),
            };
        if (method === "POST") {
            const category = categoryOf(db, Number(body.category_id));
            const amount = Math.round(Number(body.amount));
            const day = Number(body.day_of_month);
            if (
                !Number.isFinite(amount) ||
                amount <= 0 ||
                !(day >= 1 && day <= 31)
            )
                throw new DemoError(422, "اطلاعات واردشده معتبر نیست");
            if (category.type !== body.type)
                throw new DemoError(
                    400,
                    "نوع تراکنش با نوع دسته‌بندی هماهنگ نیست",
                );
            const rule: DemoRule = {
                id: db.nextId++,
                type: category.type,
                amount,
                note: String(body.note ?? "")
                    .trim()
                    .slice(0, 300),
                day_of_month: day,
                category_id: category.id,
                active: true,
            };
            db.rules.push(rule);
            const [jy, jm, today] = todayJalali();
            const when = Math.min(day, jalaliMonthLength(jy, jm));
            if (when <= today) {
                db.transactions.push({
                    id: db.nextId++,
                    type: rule.type,
                    amount,
                    note: rule.note,
                    date: jalaliToIso(jy, jm, when),
                    category_id: category.id,
                });
            }
            return { status: 201, data: ruleOut(db, rule) };
        }
        if (method === "PATCH" && id) {
            const rule = db.rules.find((r) => r.id === id);
            if (!rule) throw new DemoError(404, "مورد پیدا نشد");
            rule.active = Boolean(body.active);
            return { status: 200, data: ruleOut(db, rule) };
        }
        if (method === "DELETE" && id) {
            if (!db.rules.some((r) => r.id === id))
                throw new DemoError(404, "مورد پیدا نشد");
            db.rules = db.rules.filter((r) => r.id !== id);
            return { status: 204 };
        }
    }

    if (resource === "reports" && rawId === "summary") {
        return {
            status: 200,
            data: summary(db, Number(query.jy), Number(query.jm)),
        };
    }

    throw new DemoError(404, "پیدا نشد");
}

export function demoRequest(
    path: string,
    method: string,
    body: unknown,
    query: Query | undefined,
): Response {
    try {
        const db = load();
        const result = route(
            db,
            path,
            method,
            (body ?? {}) as Record<string, unknown>,
            query ?? {},
        );
        persist();
        if (result.status === 204) return new Response(null, { status: 204 });
        if (result.csv !== undefined) {
            return new Response(result.csv, {
                status: 200,
                headers: { "Content-Type": "text/csv; charset=utf-8" },
            });
        }
        return new Response(JSON.stringify(result.data), {
            status: result.status,
            headers: { "Content-Type": "application/json" },
        });
    } catch (e) {
        const status = e instanceof DemoError ? e.status : 500;
        const detail = e instanceof DemoError ? e.message : "خطایی رخ داد";
        return new Response(JSON.stringify({ detail }), {
            status,
            headers: { "Content-Type": "application/json" },
        });
    }
}
