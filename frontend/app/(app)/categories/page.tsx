"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Skeleton from "@/components/Skeleton";
import { api } from "@/lib/api";
import type { Category, TxType } from "@/lib/types";

const sections: { type: TxType; title: string }[] = [
    { type: "expense", title: "دسته‌های هزینه" },
    { type: "income", title: "دسته‌های درآمد" },
];

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[] | null>(null);
    const [name, setName] = useState("");
    const [type, setType] = useState<TxType>("expense");
    const [color, setColor] = useState("#6366f1");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        try {
            setCategories(await api<Category[]>("/categories"));
        } catch (e) {
            setError(e instanceof Error ? e.message : "بارگذاری انجام نشد");
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        setError("");
        setSaving(true);
        try {
            await api("/categories", {
                method: "POST",
                body: { name, type, color },
            });
            setName("");
            await load();
        } catch (e) {
            setError(e instanceof Error ? e.message : "ذخیره انجام نشد");
        } finally {
            setSaving(false);
        }
    };

    const remove = async (category: Category) => {
        if (!confirm(`دسته «${category.name}» حذف شود؟`)) return;
        setError("");
        try {
            await api(`/categories/${category.id}`, { method: "DELETE" });
            await load();
        } catch (e) {
            setError(e instanceof Error ? e.message : "حذف انجام نشد");
        }
    };

    return (
        <div className="space-y-4">
            <h1 className="text-xl font-bold">دسته‌بندی‌ها</h1>

            <form
                onSubmit={submit}
                className="card flex flex-wrap items-end gap-3 p-4"
            >
                <div className="min-w-48 flex-1">
                    <label className="label">نام دسته</label>
                    <input
                        className="input"
                        required
                        maxLength={60}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div>
                    <label className="label">نوع</label>
                    <select
                        className="input"
                        value={type}
                        onChange={(e) => setType(e.target.value as TxType)}
                    >
                        <option value="expense">هزینه</option>
                        <option value="income">درآمد</option>
                    </select>
                </div>
                <div>
                    <label className="label">رنگ</label>
                    <input
                        type="color"
                        className="h-10 w-14 cursor-pointer rounded-xl border border-slate-300 bg-transparent p-1 dark:border-slate-700"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                    />
                </div>
                <button type="submit" className="btn-primary" disabled={saving}>
                    افزودن
                </button>
            </form>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {!categories && !error && (
                <div
                    className="grid gap-4 md:grid-cols-2"
                    role="status"
                    aria-label="در حال بارگذاری"
                >
                    <Skeleton className="h-64 rounded-2xl" />
                    <Skeleton className="h-64 rounded-2xl" />
                </div>
            )}

            {categories && (
                <div className="grid gap-4 md:grid-cols-2">
                    {sections.map((section) => (
                        <div key={section.type} className="card p-4">
                            <h2 className="mb-3 font-bold">{section.title}</h2>
                            <ul className="space-y-2">
                                {categories
                                    .filter((c) => c.type === section.type)
                                    .map((c) => (
                                        <li
                                            key={c.id}
                                            className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/60"
                                        >
                                            <span className="inline-flex items-center gap-2 text-sm">
                                                <span
                                                    className="h-3 w-3 rounded-full"
                                                    style={{
                                                        background: c.color,
                                                    }}
                                                />
                                                {c.name}
                                            </span>
                                            <button
                                                className="text-sm text-red-600 hover:underline"
                                                onClick={() => remove(c)}
                                            >
                                                حذف
                                            </button>
                                        </li>
                                    ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
