"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { getToken } from "@/lib/api";

const anchors = [
    { href: "#features", label: "امکانات" },
    { href: "#how", label: "نحوه کار" },
    { href: "#faq", label: "پرسش‌ها" },
];

export default function LandingNav() {
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        setLoggedIn(Boolean(getToken()));
    }, []);

    return (
        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/80">
            <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-5">
                <Link href="/" aria-label="دفتر، صفحه اصلی">
                    <Logo />
                </Link>
                <nav className="hidden flex-1 items-center gap-7 text-sm text-slate-600 dark:text-slate-300 md:flex">
                    {anchors.map((a) => (
                        <a
                            key={a.href}
                            href={a.href}
                            className="transition hover:text-slate-900 dark:hover:text-white"
                        >
                            {a.label}
                        </a>
                    ))}
                </nav>
                <div className="ms-auto flex items-center gap-2 md:ms-0">
                    <ThemeToggle />
                    {loggedIn ? (
                        <Link href="/dashboard" className="btn-primary">
                            داشبورد
                        </Link>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="btn-ghost hidden sm:inline-flex"
                            >
                                ورود
                            </Link>
                            <Link href="/register" className="btn-primary">
                                ساخت حساب
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
