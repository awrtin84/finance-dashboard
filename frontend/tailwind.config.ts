import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";

const ease = "cubic-bezier(0.22, 1, 0.36, 1)";

const config: Config = {
    darkMode: "class",
    content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
    theme: {
        extend: {
            colors: {
                slate: colors.neutral,
                indigo: {
                    ...colors.neutral,
                    400: "#d4d4d4",
                    600: "rgb(var(--accent) / <alpha-value>)",
                },
            },
            fontFamily: {
                sans: ["Vazirmatn Variable", "Tahoma", "sans-serif"],
            },
            keyframes: {
                "write-in": {
                    from: { clipPath: "inset(0 0 0 100%)", opacity: "0" },
                    to: { clipPath: "inset(0 0 0 0)", opacity: "1" },
                },
                rise: {
                    from: { opacity: "0", transform: "translateY(12px)" },
                    to: { opacity: "1", transform: "translateY(0)" },
                },
                grow: {
                    from: { transform: "scaleY(0)" },
                    to: { transform: "scaleY(1)" },
                },
                fill: {
                    from: { transform: "scaleX(0)" },
                    to: { transform: "scaleX(1)" },
                },
                draw: {
                    from: { strokeDashoffset: "1" },
                    to: { strokeDashoffset: "0" },
                },
                "fade-in": {
                    from: { opacity: "0" },
                    to: { opacity: "1" },
                },
                "fade-out": {
                    from: { opacity: "1" },
                    to: { opacity: "0" },
                },
                pop: {
                    from: {
                        opacity: "0",
                        transform: "translateY(10px) scale(0.97)",
                    },
                    to: { opacity: "1", transform: "translateY(0) scale(1)" },
                },
                "pop-out": {
                    from: { opacity: "1", transform: "translateY(0) scale(1)" },
                    to: {
                        opacity: "0",
                        transform: "translateY(10px) scale(0.97)",
                    },
                },
                sheet: {
                    from: { transform: "translateY(100%)" },
                    to: { transform: "translateY(0)" },
                },
                "sheet-out": {
                    from: { transform: "translateY(0)" },
                    to: { transform: "translateY(100%)" },
                },
                page: {
                    from: { opacity: "0", transform: "translateY(6px)" },
                    to: { opacity: "1", transform: "translateY(0)" },
                },
                shimmer: {
                    from: { transform: "translateX(-100%)" },
                    to: { transform: "translateX(100%)" },
                },
                shake: {
                    "0%, 100%": { transform: "translateX(0)" },
                    "20%": { transform: "translateX(-8px)" },
                    "40%": { transform: "translateX(7px)" },
                    "60%": { transform: "translateX(-5px)" },
                    "80%": { transform: "translateX(3px)" },
                },
            },
            animation: {
                "write-in": `write-in 0.8s ${ease} both`,
                rise: `rise 0.6s ${ease} both`,
                grow: `grow 0.9s ${ease} both`,
                fill: `fill 1s ${ease} both`,
                draw: "draw 0.45s ease-out both",
                shake: "shake 0.45s ease-in-out",
                "fade-in": "fade-in 0.2s ease-out both",
                "fade-out": "fade-out 0.2s ease-in both",
                pop: `pop 0.35s ${ease} both`,
                "pop-out": "pop-out 0.2s ease-in both",
                sheet: `sheet 0.45s ${ease} both`,
                "sheet-out": "sheet-out 0.25s ease-in both",
                page: `page 0.45s ${ease} backwards`,
                shimmer: "shimmer 1.6s ease-in-out infinite",
            },
        },
    },
    plugins: [],
};

export default config;
