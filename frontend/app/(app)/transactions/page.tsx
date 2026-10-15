"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import MonthPicker from "@/components/MonthPicker";
import Skeleton from "@/components/Skeleton";
import TransactionForm from "@/components/TransactionForm";
import { api, downloadFile } from "@/lib/api";
import { money, toFa } from "@/lib/format";
import { formatJalali, monthRangeIso, todayJalali } from "@/lib/jalali";
import type {
    Category,
    Transaction,
    TransactionList,
    TxPayload,
    TxType,
} from "@/lib/types";

export default function TransactionsPage() {
    const [month, setMonth] = useState(() => {
        const [jy, jm] = todayJalali();
        return { jy, jm };
    });
    const [type, setType] = useState<"" | TxType>("");
    const [categoryId, setCategoryId] = useState("");
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [data, setData] = useState<TransactionList | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [error, setError] = useState("");
    const [editing, setEditing] = useState<Transaction | null>(null);
    const [creating, setCreating] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    const { start, end } = monthRangeIso(month.jy, month.jm);

    useEffect(() => {
        api<Category[]>("/categories")
            .then(setCategories)
            .catch((e) => setError(e.message));
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        let cancelled = false;
        api<TransactionList>("/transactions", {
            query: {
                start,
                end,
                type,
                category_id: categoryId,
                q: debouncedSearch,
            },
        })
            .then((result) => {
                if (cancelled) return;
                setData(result);
                setError("");
            })
            .catch((e) => !cancelled && setError(e.message));
        return () => {
            cancelled = true;
        };
    }, [start, end, type, categoryId, debouncedSearch, reloadKey]);

    const save = async (payload: TxPayload) => {
        if (editing) {
            await api(`/transactions/${editing.id}`, {
                method: "PUT",
                body: payload,
            });
        } else {
            await api("/transactions", { method: "POST", body: payload });
        }
        setEditing(null);
        setCreating(false);
        setReloadKey((k) => k + 1);
    };

    const remove = async (transaction: Transaction) => {
        if (!confirm("این تراکنش حذف شود؟")) return;
        try {
            await api(`/transactions/${transaction.id}`, { method: "DELETE" });
            setReloadKey((k) => k + 1);
        } catch (e) {
            setError(e instanceof Error ? e.message : "حذف انجام نشد");
        }
    };

    const exportCsv = () =>
        downloadFile(
            "/transactions/export",
            { start, end, type, category_id: categoryId, q: debouncedSearch },
            "transactions.csv",
        ).catch((e) => setError(e.message));

    const filterCategories = categories.filter((c) => !type || c.type === type);
    const modalOpen = creating || editing !== null;

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-xl font-bold">تراکنش‌ها</h1>
                <div className="flex flex-wrap items-center gap-2 print:hidden">
                    <MonthPicker
                        jy={month.jy}
                        jm={month.jm}
                        onChange={(jy, jm) => setMonth({ jy, jm })}
                    />
                    <button className="btn-ghost" onClick={exportCsv}>
                        خروجی Excel
                    </button>
                    <button
                        className="btn-ghost"
                        onClick={() => window.print()}
                    >
                        چاپ / PDF
                    </button>
                    <button
                        className="btn-primary"
                        onClick={() => setCreating(true)}
                    >
                        + تراکنش جدید
                    </button>
                </div>
            </div>

            <div className="card grid gap-3 p-4 sm:grid-cols-3 print:hidden">
                <input
                    className="input"
                    placeholder="جستجو در توضیحات..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select
                    className="input"
                    value={type}
                    onChange={(e) => {
                        setType(e.target.value as "" | TxType);
                        setCategoryId("");
                    }}
                >
                    <option value="">همه انواع</option>
                    <option value="expense">هزینه</option>
                    <option value="income">درآمد</option>
                </select>
                <select
                    className="input"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                >
                    <option value="">همه دسته‌بندی‌ها</option>
                    {filterCategories.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            {data && (
                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="card p-4">
                        <p className="text-sm text-slate-500">درآمد</p>
                        <p className="mt-1 font-bold text-emerald-600">
                            {money(data.income)} تومان
                        </p>
                    </div>
                    <div className="card p-4">
                        <p className="text-sm text-slate-500">هزینه</p>
                        <p className="mt-1 font-bold text-red-600">
                            {money(data.expense)} تومان
                        </p>
                    </div>
                    <div className="card p-4">
                        <p className="text-sm text-slate-500">تعداد تراکنش</p>
                        <p className="mt-1 font-bold">{toFa(data.total)}</p>
                    </div>
                </div>
            )}

            <div className="card overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-200 text-right text-slate-500 dark:border-slate-800">
                            <th className="p-3 font-medium">تاریخ</th>
                            <th className="p-3 font-medium">دسته‌بندی</th>
                            <th className="p-3 font-medium">توضیحات</th>
                            <th className="p-3 font-medium">مبلغ</th>
                            <th className="p-3 print:hidden" />
                        </tr>
                    </thead>
                    <tbody>
                        {!data &&
                            [0, 1, 2, 3, 4, 5].map((i) => (
                                <tr key={i}>
                                    <td colSpan={5} className="p-3">
                                        <Skeleton className="h-7" />
                                    </td>
                                </tr>
                            ))}
                        {data && data.items.length === 0 && (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="p-8 text-center text-slate-500"
                                >
                                    تراکنشی پیدا نشد
                                </td>
                            </tr>
                        )}
                        {data?.items.map((t) => (
                            <tr
                                key={t.id}
                                className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
                            >
                                <td className="whitespace-nowrap p-3">
                                    {formatJalali(t.date)}
                                </td>
                                <td className="p-3">
                                    <span className="inline-flex items-center gap-2">
                                        <span
                                            className="h-2.5 w-2.5 rounded-full"
                                            style={{
                                                background: t.category_color,
                                            }}
                                        />
                                        {t.category_name}
                                    </span>
                                </td>
                                <td className="p-3 text-slate-600 dark:text-slate-300">
                                    {t.note || "—"}
                                </td>
                                <td
                                    className={`whitespace-nowrap p-3 font-medium ${
                                        t.type === "income"
                                            ? "text-emerald-600"
                                            : "text-red-600"
                                    }`}
                                >
                                    <span className="num">
                                        {t.type === "income" ? "+" : "−"}
                                        {money(t.amount)}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap p-3 text-left print:hidden">
                                    <button
                                        className="px-2 text-indigo-600 hover:underline"
                                        onClick={() => setEditing(t)}
                                    >
                                        ویرایش
                                    </button>
                                    <button
                                        className="px-2 text-red-600 hover:underline"
                                        onClick={() => remove(t)}
                                    >
                                        حذف
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                open={modalOpen}
                title={editing ? "ویرایش تراکنش" : "تراکنش جدید"}
                onClose={() => {
                    setEditing(null);
                    setCreating(false);
                }}
            >
                <TransactionForm
                    key={editing?.id ?? "new"}
                    categories={categories}
                    initial={editing}
                    onSubmit={save}
                    onCancel={() => {
                        setEditing(null);
                        setCreating(false);
                    }}
                />
            </Modal>
        </div>
    );
}
