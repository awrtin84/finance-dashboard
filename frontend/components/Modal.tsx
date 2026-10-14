"use client";

import { ReactNode, useEffect } from "react";

interface Props {
    open: boolean;
    title: string;
    onClose: () => void;
    children: ReactNode;
}

export default function Modal({ open, title, onClose, children }: Props) {
    useEffect(() => {
        if (!open) return;
        const handler = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:hidden"
            onClick={onClose}
        >
            <div
                className="card max-h-[90vh] w-full max-w-md overflow-y-auto p-5"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
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
