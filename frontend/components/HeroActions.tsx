"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/api";
import { DEMO_MODE, enterDemo } from "@/lib/demo";

export default function HeroActions({
    inverted = false,
}: {
    inverted?: boolean;
}) {
    const router = useRouter();
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        setLoggedIn(Boolean(getToken()));
    }, []);

    const primary = inverted
        ? "btn h-12 grow bg-white px-7 text-base sm:grow-0 text-black hover:bg-slate-200 dark:bg-black dark:text-white dark:hover:bg-slate-800"
        : "btn-primary h-12 grow px-7 text-base sm:grow-0";
    const secondary = inverted
        ? "btn h-12 grow border border-white/30 px-7 text-base sm:grow-0 text-white hover:bg-white/10 dark:border-black/30 dark:text-black dark:hover:bg-black/10"
        : "btn-ghost h-12 grow px-7 text-base sm:grow-0";

    return (
        <div className="flex flex-wrap items-center gap-3">
            {loggedIn ? (
                <Link href="/dashboard" className={primary}>
                    ورود به داشبورد
                </Link>
            ) : DEMO_MODE ? (
                <>
                    <button
                        type="button"
                        className={primary}
                        onClick={() => {
                            enterDemo();
                            router.push("/dashboard");
                        }}
                    >
                        ورود به نسخه‌ی نمایشی
                    </button>
                    <Link href="/register" className={secondary}>
                        ساخت حساب
                    </Link>
                </>
            ) : (
                <>
                    <Link href="/register" className={primary}>
                        ساخت حساب
                    </Link>
                    <Link href="/login" className={secondary}>
                        ورود
                    </Link>
                </>
            )}
        </div>
    );
}
