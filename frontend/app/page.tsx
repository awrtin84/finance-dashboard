import type { Metadata } from "next";
import Link from "next/link";
import HeroActions from "@/components/HeroActions";
import InView from "@/components/InView";
import LandingNav from "@/components/LandingNav";
import LedgerPreview from "@/components/LedgerPreview";
import Logo from "@/components/Logo";
import { toFa } from "@/lib/format";

export const metadata: Metadata = {
  title: "حساب‌وکتاب شخصی با تقویم شمسی",
  description:
    "دفتر درآمد و هزینه‌هات رو با تقویم شمسی ردیف می‌کنه، سقف هر دسته رو زیر نظر داره و آخر ماه نشونت می‌ده پول کجا خرج شده.",
};

const demoPill =
  "rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium tabular-nums dark:border-slate-700";

const features = [
  {
    title: "ثبت سریع",
    text: "مبلغ، دسته و تاریخ. همین سه تا. مبلغ موقع تایپ با ارقام فارسی و جداکننده‌ی هزارگان نشون داده می‌شه.",
    demo: <span className={demoPill}>{toFa("480٬000")} تومان</span>,
  },
  {
    title: "تقویم شمسی",
    text: "از انتخاب تاریخ تا گزارش ماهانه، همه‌چیز شمسیه. ماه‌ها از اول تا آخر درست جدا می‌شن و سال کبیسه هم حساب می‌شه.",
    demo: <span className={demoPill}>{toFa(18)} مهر {toFa(1405)}</span>,
  },
  {
    title: "بودجه‌ی هر دسته",
    text: "برای هر دسته یک سقف ماهانه بذار. از ۸۰٪ نوار نارنجی می‌شه و داشبورد هشدار می‌ده، بالای ۱۰۰٪ قرمز.",
    demo: (
      <span className="block h-2 w-40 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <span className="block h-full w-[82%] rounded-full bg-slate-900 dark:bg-white" />
      </span>
    ),
  },
  {
    title: "تراکنش تکرارشونده",
    text: "اجاره و قسط رو یک بار تعریف کن. هر ماه خودشون ثبت می‌شن، حتی اگه چند ماه سر نزده باشی.",
    demo: <span className={demoPill}>هر ماه، روز {toFa(5)}</span>,
  },
  {
    title: "نمودار و گزارش",
    text: "سهم هر دسته از هزینه‌ها، روند شش ماه اخیر و هزینه‌ی روزانه، همه توی یک صفحه.",
    demo: (
      <span className="flex h-9 items-end gap-1" aria-hidden="true">
        {[40, 60, 45, 75, 55, 90].map((h, i) => (
          <span key={i} className="w-2 rounded-sm bg-slate-900 dark:bg-white" style={{ height: `${h}%`, opacity: 0.25 + i * 0.15 }} />
        ))}
      </span>
    ),
  },
  {
    title: "خروجی و چاپ",
    text: "تراکنش‌های فیلترشده رو برای Excel دانلود کن یا مستقیم چاپ بگیر و به‌صورت PDF ذخیره کن.",
    demo: <span className={demoPill}>CSV</span>,
  },
];

const steps = [
  {
    title: "ساخت حساب",
    text: "با ایمیل ثبت‌نام می‌کنی و دوازده دسته‌بندی آماده برات ساخته می‌شه.",
  },
  {
    title: "نوشتن ردیف‌ها",
    text: "هر درآمد و هزینه رو همون موقع ثبت کن و موارد ثابت ماهانه رو تکرارشونده تعریف کن.",
  },
  {
    title: "دیدن ماه",
    text: "داشبورد نشون می‌ده چقدر مونده، پول کجا رفته و کدوم بودجه داره تموم می‌شه.",
  },
];

const faqs = [
  {
    q: "اطلاعاتم برای دیگران قابل دیدنه؟",
    a: "نه. هر حساب فقط تراکنش‌های خودش رو می‌بینه. رمز عبور به‌صورت هش‌شده (bcrypt) ذخیره می‌شه و ورود با توکن امضاشده انجام می‌شه.",
  },
  {
    q: "به حساب بانکی من وصل می‌شه؟",
    a: "نه. دفتر فقط چیزی رو که خودت ثبت می‌کنی نگه می‌داره و تحلیل می‌کنه. هیچ پولی جابه‌جا نمی‌شه.",
  },
  {
    q: "مبلغ‌ها به چه واحدی هستن؟",
    a: "تومان، به‌صورت عدد صحیح، تا هیچ خطای اعشاری توی جمع‌ها نیفته.",
  },
  {
    q: "دسته‌بندی‌ها رو می‌شه عوض کرد؟",
    a: "بله. هر دسته رو با اسم و رنگ دلخواه اضافه کن. دسته‌ای که تراکنش یا تراکنش تکرارشونده داره حذف نمی‌شه تا گزارش‌های قبلی به‌هم نریزه.",
  },
  {
    q: "می‌تونم از داده‌هام خروجی بگیرم؟",
    a: "بله. تراکنش‌ها رو با فیلتر دلخواه به‌صورت CSV برای Excel دانلود کن یا از صفحه چاپ بگیر.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <LandingNav />

      <main>
        <section className="relative isolate overflow-hidden">
          <div className="grid-paper absolute inset-0 -z-10" aria-hidden="true" />
          <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-24 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:pt-24">
            <div>
              <h1 className="text-balance text-[clamp(2.6rem,6vw,4.75rem)] font-black leading-[1.35]">
                پولت کجا رفت؟
                <span className="block font-light text-slate-500 dark:text-slate-400">دفتر جواب می‌ده.</span>
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-9 text-slate-600 dark:text-slate-300">
                دفتر درآمد و هزینه‌هات رو با تقویم شمسی ردیف می‌کنه، سقف هر دسته رو زیر نظر داره و آخر ماه نشونت می‌ده پول
                کجا خرج شده.
              </p>
              <div className="mt-9">
                <HeroActions />
              </div>
              <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
                بدون نصب. یک ایمیل و یک رمز عبور کافیه.
              </p>
            </div>

            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <LedgerPreview className="lg:rotate-1" />
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24">
          <h2 className="max-w-2xl text-3xl font-black leading-snug md:text-5xl md:leading-snug">
            هر چیزی که یک دفتر حساب خوب لازم داره
          </h2>
          <ul className="mt-14">
            {features.map((feature) => (
              <li
                key={feature.title}
                className="grid items-center gap-4 border-t border-slate-200 py-8 last:border-b dark:border-slate-800 md:grid-cols-[13rem_1fr_13rem] md:gap-10"
              >
                <h3 className="text-xl font-extrabold">{feature.title}</h3>
                <p className="max-w-xl leading-8 text-slate-600 dark:text-slate-400">{feature.text}</p>
                <div className="flex md:justify-end">{feature.demo}</div>
              </li>
            ))}
          </ul>
        </section>

        <section id="how" className="scroll-mt-24 border-y border-slate-200 bg-slate-50 py-24 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="mx-auto max-w-6xl px-5">
            <h2 className="max-w-2xl text-3xl font-black leading-snug md:text-5xl md:leading-snug">
              سه قدم تا یک ماه مرتب
            </h2>
            <InView className="mt-16">
              <ol className="grid gap-12 md:grid-cols-3 md:gap-8">
                {steps.map((step, i) => (
                  <li key={step.title} className="relative">
                    {i < steps.length - 1 && (
                      <span
                        className="absolute -left-8 right-[3.25rem] top-[1.375rem] hidden h-px origin-right scale-x-0 bg-slate-400 transition-transform duration-1000 ease-out group-data-[seen=true]/seen:scale-x-100 dark:bg-slate-600 md:block"
                        style={{ transitionDelay: `${i * 700 + 500}ms` }}
                        aria-hidden="true"
                      />
                    )}
                    <span
                      className="relative z-10 grid h-11 w-11 place-items-center rounded-full border border-slate-300 bg-slate-50 text-lg font-black transition-colors duration-500 group-data-[seen=true]/seen:border-slate-900 group-data-[seen=true]/seen:bg-slate-900 group-data-[seen=true]/seen:text-white dark:border-slate-700 dark:bg-slate-900 dark:group-data-[seen=true]/seen:border-white dark:group-data-[seen=true]/seen:bg-white dark:group-data-[seen=true]/seen:text-black"
                      style={{ transitionDelay: `${i * 700 + 200}ms` }}
                    >
                      {toFa(i + 1)}
                    </span>
                    <h3 className="mt-6 text-xl font-extrabold">{step.title}</h3>
                    <p className="mt-2 max-w-xs leading-8 text-slate-600 dark:text-slate-400">{step.text}</p>
                  </li>
                ))}
              </ol>
            </InView>
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-5 py-24">
          <h2 className="text-3xl font-black leading-snug md:text-5xl md:leading-snug">پرسش‌های رایج</h2>
          <div className="mt-12">
            {faqs.map((item) => (
              <details key={item.q} className="group border-t border-slate-200 py-5 last:border-b dark:border-slate-800">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-bold [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5 shrink-0 transition-transform duration-300 group-open:rotate-45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </summary>
                <p className="mt-3 max-w-prose animate-rise leading-8 text-slate-600 dark:text-slate-400">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-24">
          <div className="rounded-3xl bg-slate-900 px-8 py-16 text-center text-white dark:bg-white dark:text-black md:py-20">
            <h2 className="text-3xl font-black leading-snug md:text-5xl md:leading-snug">ردیف اول رو همین الان بنویس</h2>
            <p className="mx-auto mt-4 max-w-md leading-8 text-slate-300 dark:text-slate-600">
              ساخت حساب یک دقیقه هم طول نمی‌کشه و دسته‌بندی‌ها از همون اول آماده‌ان.
            </p>
            <div className="mt-8 flex justify-center">
              <HeroActions inverted />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-slate-500 dark:text-slate-400">
          <Logo className="text-slate-900 dark:text-white" />
          <p>ساخته‌شده با Next.js و FastAPI</p>
          <nav className="flex gap-5">
            <Link href="/login" className="hover:text-slate-900 dark:hover:text-white">
              ورود
            </Link>
            <Link href="/register" className="hover:text-slate-900 dark:hover:text-white">
              ساخت حساب
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
