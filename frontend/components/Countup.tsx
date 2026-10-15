"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
    value: number;
    format: (n: number) => string;
    duration?: number;
}

export default function CountUp({ value, format, duration = 900 }: Props) {
    const [shown, setShown] = useState(0);
    const from = useRef(0);

    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            from.current = value;
            setShown(value);
            return;
        }
        const start = from.current;
        let frame = 0;
        let startedAt = 0;
        const tick = (now: number) => {
            if (!startedAt) startedAt = now;
            const progress = Math.min((now - startedAt) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            const current = Math.round(start + (value - start) * eased);
            from.current = current;
            setShown(current);
            if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [value, duration]);

    return <span className="num">{format(shown)}</span>;
}
