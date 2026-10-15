"use client";

import type { MouseEvent } from "react";

type TransitionDocument = Document & {
    startViewTransition?: (update: () => void) => { ready: Promise<void> };
};

export default function ThemeToggle({
    className = "",
}: {
    className?: string;
}) {
    const toggle = async (event: MouseEvent<HTMLButtonElement>) => {
        const root = document.documentElement;
        const doc = document as TransitionDocument;

        const apply = () => {
            const dark = root.classList.toggle("dark");
            try {
                localStorage.setItem("fd_theme", dark ? "dark" : "light");
            } catch {}
        };

        const reduced = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;
        if (!doc.startViewTransition || reduced) {
            root.classList.add("theme-anim");
            apply();
            window.setTimeout(() => root.classList.remove("theme-anim"), 400);
            return;
        }

        const rect = event.currentTarget.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        const radius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y),
        );

        const transition = doc.startViewTransition(apply);
        try {
            await transition.ready;
        } catch {
            return;
        }
        root.animate(
            {
                clipPath: [
                    `circle(0px at ${x}px ${y}px)`,
                    `circle(${radius}px at ${x}px ${y}px)`,
                ],
            },
            {
                duration: 750,
                easing: "cubic-bezier(0.22, 1, 0.36, 1)",
                pseudoElement: "::view-transition-new(root)",
            },
        );
    };

    return (
        <button
            type="button"
            onClick={toggle}
            aria-label="تغییر بین تم روشن و تیره"
            className={`relative grid h-9 w-9 shrink-0 place-items-center rounded-full border border-slate-300 text-slate-900 transition duration-200 hover:bg-slate-100 active:scale-90 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800 ${className}`}
        >
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="absolute h-[18px] w-[18px] rotate-90 scale-0 opacity-0 transition-all duration-500 dark:rotate-0 dark:scale-100 dark:opacity-100"
                aria-hidden="true"
            >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute h-[18px] w-[18px] rotate-0 scale-100 opacity-100 transition-all duration-500 dark:-rotate-90 dark:scale-0 dark:opacity-0"
                aria-hidden="true"
            >
                <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
            </svg>
        </button>
    );
}
