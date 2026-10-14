"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

interface Props {
    children: ReactNode;
    className?: string;
    threshold?: number;
}

export default function InView({
    children,
    className = "",
    threshold = 0.35,
}: Props) {
    const ref = useRef<HTMLDivElement>(null);
    const [seen, setSeen] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (typeof IntersectionObserver === "undefined") {
            setSeen(true);
            return;
        }
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setSeen(true);
                    observer.disconnect();
                }
            },
            { threshold },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [threshold]);

    return (
        <div ref={ref} data-seen={seen} className={`group/seen ${className}`}>
            {children}
        </div>
    );
}
