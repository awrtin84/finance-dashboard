"use client";

import { ReactNode, useEffect, useRef } from "react";

interface Props {
    children: ReactNode;
    className?: string;
    max?: number;
    rest?: number;
}

export default function Tilt({
    children,
    className = "",
    max = 4,
    rest = 1,
}: Props) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const fine = window.matchMedia(
            "(hover: hover) and (pointer: fine)",
        ).matches;
        const reduced = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;
        if (!fine || reduced) return;

        let frame = 0;
        let rx = 0;
        let ry = 0;

        const paint = () => {
            frame = 0;
            el.style.transform = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg) rotate(${rest}deg)`;
        };
        const schedule = () => {
            if (!frame) frame = requestAnimationFrame(paint);
        };
        const move = (event: PointerEvent) => {
            ry = (event.clientX / window.innerWidth - 0.5) * max * 2;
            rx = -(event.clientY / window.innerHeight - 0.5) * max * 2;
            schedule();
        };
        const leave = () => {
            rx = 0;
            ry = 0;
            schedule();
        };

        window.addEventListener("pointermove", move, { passive: true });
        document.documentElement.addEventListener("pointerleave", leave);
        return () => {
            window.removeEventListener("pointermove", move);
            document.documentElement.removeEventListener("pointerleave", leave);
            if (frame) cancelAnimationFrame(frame);
        };
    }, [max, rest]);

    return (
        <div
            ref={ref}
            className={`transition-transform duration-500 ease-out will-change-transform ${className}`}
            style={{ transform: `rotate(${rest}deg)` }}
        >
            {children}
        </div>
    );
}
