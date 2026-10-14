"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { api, clearToken, getToken } from "@/lib/api";
import { DEMO_MODE, resetDemo } from "@/lib/demo";
import type { User } from "@/lib/types";

const links = [
    { href: "/dashboard", label: "داشبورد" },
    { href: "/transactions", label: "تراکنش‌ها" },
    { href: "/budgets", label: "بودجه" },
    { href: "/recurring", label: "تکرارشونده‌ها" },
    { href: "/categories", label: "دسته‌بندی‌ها" },
];

export default function AppLayout({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        if (!getToken()) {
            router.replace("/login");
            return;
        }
        api<User>("/auth/me")
            .then(setUser)
            .catch(() => {
                clearToken();
                router.replace("/login");
            });
    }, [router]);

    const reset = () => {
        if (!confirm("داده‌های نمایشی به حالت اولیه برگردند؟")) return;
        resetDemo();
        window.location.reload();
    };

    const logout = () => {
        clearToken();
        router.replace("/");
    };

    if (!user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500 dark:bg-slate-950">
                در حال بارگذاری...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {DEMO_MODE && (
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 bg-slate-900 px-4 py-2 text-center text-xs text-white dark:bg-white dark:text-black print:hidden">
                    <span>
                        نسخه‌ی نمایشی: داده‌ها فقط در مرورگر تو ذخیره می‌شوند و
                        به سرور نمی‌روند.
                    </span>
                    <button
                        type="button"
                        onClick={reset}
                        className="underline underline-offset-4"
                    >
                        بازنشانی داده‌ها
                    </button>
                </div>
            )}
            <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 print:hidden">
                <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
                    <Link href="/dashboard" aria-label="دفتر، داشبورد">
                        <Logo />
                    </Link>
                    <nav className="flex flex-1 gap-1 overflow-x-auto">
                        {links.map((link) => {
                            const active = pathname.startsWith(link.href);
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm transition ${
                                        active
                                            ? "bg-slate-900 font-medium text-white dark:bg-white dark:text-black"
                                            : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>
                    <ThemeToggle />
                    <span className="hidden text-sm text-slate-500 sm:inline">
                        {user.name}
                    </span>
                    <button className="btn-ghost px-3 py-1.5" onClick={logout}>
                        خروج
                    </button>
                </div>
            </header>
            <main className="mx-auto max-w-6xl p-4">{children}</main>
        </div>
    );
}
