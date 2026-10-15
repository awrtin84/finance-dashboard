"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { api, clearToken, getToken } from "@/lib/api";
import { DEMO_MODE, resetDemo } from "@/lib/demo";
import type { User } from "@/lib/types";

const icons: Record<string, ReactNode> = {
    "/dashboard": (
        <>
            <rect x="3" y="3" width="7" height="9" rx="1.5" />
            <rect x="14" y="3" width="7" height="5" rx="1.5" />
            <rect x="14" y="12" width="7" height="9" rx="1.5" />
            <rect x="3" y="16" width="7" height="5" rx="1.5" />
        </>
    ),
    "/transactions": (
        <>
            <path d="M8 6h13M8 12h13M8 18h13" />
            <path d="M3 6h.01M3 12h.01M3 18h.01" />
        </>
    ),
    "/budgets": (
        <>
            <path d="M21 12a9 9 0 1 1-9-9" />
            <path d="M12 3v9h9" />
        </>
    ),
    "/recurring": (
        <>
            <path d="M17 2l4 4-4 4" />
            <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
            <path d="M7 22l-4-4 4-4" />
            <path d="M21 13v1a4 4 0 0 1-4 4H3" />
        </>
    ),
    "/categories": (
        <>
            <path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" />
            <circle cx="7.5" cy="7.5" r="1" />
        </>
    ),
};

const links = [
    { href: "/dashboard", label: "داشبورد", short: "داشبورد" },
    { href: "/transactions", label: "تراکنش‌ها", short: "تراکنش‌ها" },
    { href: "/budgets", label: "بودجه", short: "بودجه" },
    { href: "/recurring", label: "تکرارشونده‌ها", short: "تکرارها" },
    { href: "/categories", label: "دسته‌بندی‌ها", short: "دسته‌ها" },
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
            <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80 print:hidden">
                <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
                    <Link href="/dashboard" aria-label="دفتر، داشبورد">
                        <Logo />
                    </Link>
                    <span className="flex-1 md:hidden" />
                    <nav className="hidden flex-1 gap-1 md:flex">
                        {links.map((link) => {
                            const active = pathname.startsWith(link.href);
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm transition duration-200 ${
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
            <main className="mx-auto max-w-6xl p-4 pb-28 md:pb-8">
                {children}
            </main>

            <nav
                aria-label="ناوبری اصلی"
                className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/85 md:hidden print:hidden"
            >
                <div className="mx-auto grid max-w-md grid-cols-5">
                    {links.map((link) => {
                        const active = pathname.startsWith(link.href);
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                aria-current={active ? "page" : undefined}
                                className={`relative flex flex-col items-center gap-1 pb-2 pt-3 text-[11px] transition duration-200 active:scale-90 ${
                                    active
                                        ? "font-bold text-slate-900 dark:text-white"
                                        : "text-slate-500 dark:text-slate-400"
                                }`}
                            >
                                <span
                                    className={`absolute inset-x-5 top-0 h-0.5 origin-center rounded-full bg-slate-900 transition-transform duration-300 dark:bg-white ${
                                        active ? "scale-x-100" : "scale-x-0"
                                    }`}
                                    aria-hidden="true"
                                />
                                <svg
                                    viewBox="0 0 24 24"
                                    className={`h-[22px] w-[22px] transition-transform duration-300 ${active ? "-translate-y-0.5" : ""}`}
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={active ? 2.2 : 1.8}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    {icons[link.href]}
                                </svg>
                                {link.short}
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
