import "@fontsource-variable/vazirmatn";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
    title: { default: "دفتر", template: "%s | دفتر" },
    description:
        "دفتر حساب شخصی با تقویم شمسی: ثبت درآمد و هزینه، بودجه ماهانه و گزارش",
};

export const viewport: Viewport = {
    themeColor: "#0a0a0a",
};

const themeScript = `try{if(localStorage.getItem("fd_theme")!=="light"){document.documentElement.classList.add("dark")}}catch(e){document.documentElement.classList.add("dark")}`;

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="fa" dir="rtl" suppressHydrationWarning>
            <head>
                <script dangerouslySetInnerHTML={{ __html: themeScript }} />
            </head>
            <body dir="rtl">{children}</body>
        </html>
    );
}
