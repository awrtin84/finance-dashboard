"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LedgerPreview from "@/components/LedgerPreview";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { ApiError, api, setToken } from "@/lib/api";
import { DEMO_MODE, enterDemo } from "@/lib/demo";

type Mode = "login" | "register";
type Status = "idle" | "loading" | "success";

const COPY = {
    login: {
        title: "ورود به دفتر",
        subtitle: "ایمیل و رمز عبورت رو وارد کن تا ماه جاری رو ببینی.",
        submit: "ورود",
        switchText: "حساب نداری؟",
        switchLink: "ساخت حساب",
        switchHref: "/register",
        panelTitle: "دفترت همون‌جا منتظره",
        panelText:
            "تراکنش‌ها و بودجه‌ی این ماه همون‌طور که گذاشتی‌شون باز می‌شن.",
    },
    register: {
        title: "ساخت حساب",
        subtitle:
            "با ایمیل ثبت‌نام کن. دوازده دسته‌بندی آماده از همون اول داری.",
        submit: "ساخت حساب",
        switchText: "قبلاً ثبت‌نام کردی؟",
        switchLink: "ورود",
        switchHref: "/login",
        panelTitle: "ردیف اول رو همین امروز بنویس",
        panelText:
            "ثبت درآمد و هزینه، بودجه‌ی ماهانه و تراکنش‌های تکرارشونده، همه با تقویم شمسی.",
    },
} as const;

const STRENGTH_LABELS = ["", "ضعیف", "متوسط", "خوب", "قوی"];

function passwordScore(password: string): number {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Za-z]/.test(password) && /\d/.test(password)) score++;
    if (
        /[^\w\s]/.test(password) ||
        (/[a-z]/.test(password) && /[A-Z]/.test(password))
    )
        score++;
    return Math.max(score, 1);
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function stagger(step: number) {
    return { animationDelay: `${120 + step * 80}ms` };
}

export default function AuthScreen({ mode }: { mode: Mode }) {
    const router = useRouter();
    const copy = COPY[mode];
    const isRegister = mode === "register";

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState<Status>("idle");
    const [error, setError] = useState("");
    const [errorKey, setErrorKey] = useState(0);

    const score = isRegister ? passwordScore(password) : 0;
    const emailValid = EMAIL_PATTERN.test(email);

    const openDemo = () => {
        enterDemo();
        router.replace("/dashboard");
    };

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        if (status !== "idle") return;
        setError("");
        setStatus("loading");
        try {
            const body = isRegister
                ? { name, email, password }
                : { email, password };
            const data = await api<{ access_token: string }>(`/auth/${mode}`, {
                method: "POST",
                body,
            });
            setToken(data.access_token);
            setStatus("success");
            window.setTimeout(() => router.replace("/dashboard"), 750);
        } catch (e) {
            setError(e instanceof ApiError ? e.message : "خطایی رخ داد");
            setErrorKey((k) => k + 1);
            setStatus("idle");
        }
    };

    return (
        <div
            dir="rtl"
            className="grid min-h-screen bg-white dark:bg-slate-950 lg:grid-cols-2"
        >
            <div className="flex flex-col px-6 py-6 sm:px-12">
                <div className="flex items-center justify-between">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-sm text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M9 6l6 6-6 6" />
                        </svg>
                        صفحه اصلی
                    </Link>
                    <ThemeToggle />
                </div>

                <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
                    <div className="animate-rise" style={stagger(0)}>
                        <Logo className="mb-8 lg:hidden" />
                        <h1 className="text-4xl font-black leading-snug">
                            {copy.title}
                        </h1>
                        <p className="mt-2 leading-7 text-slate-600 dark:text-slate-400">
                            {copy.subtitle}
                        </p>
                    </div>

                    <form onSubmit={submit} className="mt-8 space-y-5">
                        {isRegister && (
                            <div className="animate-rise" style={stagger(1)}>
                                <label className="label" htmlFor="name">
                                    نام
                                </label>
                                <input
                                    id="name"
                                    className="input h-11"
                                    autoComplete="name"
                                    required
                                    maxLength={100}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        )}

                        <div
                            className="animate-rise"
                            style={stagger(isRegister ? 2 : 1)}
                        >
                            <label className="label" htmlFor="email">
                                ایمیل
                            </label>
                            <div className="relative">
                                <input
                                    id="email"
                                    className="input h-11 pl-10"
                                    dir="ltr"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                {emailValid && (
                                    <svg
                                        viewBox="0 0 24 24"
                                        className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-600 dark:text-emerald-400"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M5 12.5l4.5 4.5L19 7.5"
                                            pathLength={1}
                                            strokeDasharray={1}
                                            className="animate-draw"
                                        />
                                    </svg>
                                )}
                            </div>
                        </div>

                        <div
                            className="animate-rise"
                            style={stagger(isRegister ? 3 : 2)}
                        >
                            <label className="label" htmlFor="password">
                                رمز عبور
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    className="input h-11 pl-11"
                                    dir="ltr"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete={
                                        isRegister
                                            ? "new-password"
                                            : "current-password"
                                    }
                                    required
                                    minLength={isRegister ? 6 : undefined}
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    aria-label={
                                        showPassword
                                            ? "پنهان کردن رمز عبور"
                                            : "نمایش رمز عبور"
                                    }
                                    aria-pressed={showPassword}
                                    className="absolute left-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        className="h-[18px] w-[18px]"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                                        <circle cx="12" cy="12" r="3" />
                                        {!showPassword && (
                                            <path
                                                d="M4 4l16 16"
                                                pathLength={1}
                                                strokeDasharray={1}
                                                className="animate-draw"
                                            />
                                        )}
                                    </svg>
                                </button>
                            </div>

                            {isRegister && (
                                <div
                                    className={`mt-3 transition-all duration-300 ${password ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"}`}
                                    aria-live="polite"
                                >
                                    <div className="flex gap-1.5">
                                        {[1, 2, 3, 4].map((step) => (
                                            <div
                                                key={step}
                                                className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
                                            >
                                                <div
                                                    className={`h-full origin-right rounded-full bg-slate-900 transition-transform duration-500 dark:bg-white ${
                                                        score >= step
                                                            ? "scale-x-100"
                                                            : "scale-x-0"
                                                    }`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                                        قدرت رمز عبور: {STRENGTH_LABELS[score]}
                                    </p>
                                </div>
                            )}
                        </div>

                        {error && (
                            <p
                                key={errorKey}
                                role="alert"
                                className="animate-shake rounded-xl border border-red-300 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300"
                            >
                                {error}
                            </p>
                        )}

                        <div
                            className="animate-rise"
                            style={stagger(isRegister ? 4 : 3)}
                        >
                            <button
                                type="submit"
                                disabled={status !== "idle"}
                                className="btn-primary relative h-12 w-full overflow-hidden text-base"
                            >
                                <span
                                    className={`transition-all duration-300 ${
                                        status === "idle"
                                            ? "translate-y-0 opacity-100"
                                            : "-translate-y-4 opacity-0"
                                    }`}
                                >
                                    {copy.submit}
                                </span>
                                {status === "loading" && (
                                    <svg
                                        className="absolute h-5 w-5 animate-spin"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        aria-label="در حال بررسی"
                                    >
                                        <circle
                                            cx="12"
                                            cy="12"
                                            r="9"
                                            stroke="currentColor"
                                            strokeOpacity="0.25"
                                            strokeWidth="3"
                                        />
                                        <path
                                            d="M21 12a9 9 0 0 0-9-9"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                )}
                                {status === "success" && (
                                    <svg
                                        viewBox="0 0 24 24"
                                        className="absolute h-6 w-6"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-label="انجام شد"
                                    >
                                        <path
                                            d="M5 12.5l4.5 4.5L19 7.5"
                                            pathLength={1}
                                            strokeDasharray={1}
                                            className="animate-draw"
                                        />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </form>

                    {DEMO_MODE && (
                        <div
                            className="mt-6 animate-rise rounded-xl border border-dashed border-slate-300 p-4 dark:border-slate-700"
                            style={stagger(isRegister ? 5 : 4)}
                        >
                            <p className="text-sm leading-7 text-slate-600 dark:text-slate-400">
                                این نسخه‌ی نمایشی است و به سرور وصل نیست. هر
                                ایمیل و رمزی کار می‌کند و داده‌ها فقط در مرورگر
                                خودت می‌مانند.
                            </p>
                            <button
                                type="button"
                                onClick={openDemo}
                                className="btn-ghost mt-3 w-full"
                            >
                                ورود با حساب آزمایشی
                            </button>
                        </div>
                    )}

                    <p
                        className="mt-6 animate-rise text-sm text-slate-600 dark:text-slate-400"
                        style={stagger(isRegister ? 5 : 4)}
                    >
                        {copy.switchText}{" "}
                        <Link
                            href={copy.switchHref}
                            className="font-bold text-slate-900 underline underline-offset-4 dark:text-white"
                        >
                            {copy.switchLink}
                        </Link>
                    </p>
                </div>
            </div>

            <aside className="relative hidden flex-col justify-between overflow-hidden bg-slate-950 p-12 text-slate-100 dark:bg-black lg:flex">
                <div
                    className="grid-paper-dark absolute inset-0"
                    aria-hidden="true"
                />
                <Logo className="relative text-white" />
                <div className="relative mx-auto w-full max-w-md -rotate-1">
                    <LedgerPreview compact />
                </div>
                <div className="relative max-w-md">
                    <h2 className="text-2xl font-black leading-snug text-white">
                        {copy.panelTitle}
                    </h2>
                    <p className="mt-2 leading-7 text-slate-400">
                        {copy.panelText}
                    </p>
                </div>
            </aside>
        </div>
    );
}
