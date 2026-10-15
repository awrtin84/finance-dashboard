"use client";

import { ReactNode, useEffect, useState } from "react";

interface Props {
    open: boolean;
    title: string;
    onClose: () => void;
    children: ReactNode;
}

export default function Modal({ open, title, onClose, children }: Props) {
    const [mounted, setMounted] = useState(open);
    const [closing, setClosing] = useState(false);

    useEffect(() => {
        if (open) {
            setMounted(true);
            setClosing(false);
            return;
        }
        setClosing(true);
        const timer = window.setTimeout(() => {
            setMounted(false);
            setClosing(false);
        }, 240);
        return () => window.clearTimeout(timer);
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const handler = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [open, onClose]);

    if (!mounted) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4 print:hidden ${
                closing ? "animate-fade-out" : "animate-fade-in"
            }`}
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className={`card max-h-[90vh] w-full max-w-md overflow-y-auto overscroll-contain rounded-b-none p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:rounded-b-2xl sm:pb-5 ${
                    closing
                        ? "max-sm:animate-sheet-out sm:animate-pop-out"
                        : "max-sm:animate-sheet sm:animate-pop"
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-300 dark:bg-slate-700 sm:hidden"
                    aria-hidden="true"
                />
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold">{title}</h2>
                    <button
                        onClick={onClose}
                        className="grid h-8 w-8 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                        aria-label="بستن"
                    >
                        ✕
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}
