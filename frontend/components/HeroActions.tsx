"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getToken } from "@/lib/api";

export default function HeroActions({ inverted = false }: { inverted?: boolean }) {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(Boolean(getToken()));
  }, []);

  const primary = inverted
    ? "btn h-12 bg-white px-7 text-base text-black hover:bg-slate-200 dark:bg-black dark:text-white dark:hover:bg-slate-800"
    : "btn-primary h-12 px-7 text-base";
  const secondary = inverted
    ? "btn h-12 border border-white/30 px-7 text-base text-white hover:bg-white/10 dark:border-black/30 dark:text-black dark:hover:bg-black/10"
    : "btn-ghost h-12 px-7 text-base";

  return (
    <div className="flex flex-wrap items-center gap-3">
      {loggedIn ? (
        <Link href="/dashboard" className={primary}>
          ورود به داشبورد
        </Link>
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
