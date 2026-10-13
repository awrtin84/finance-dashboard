# دفتر — داشبورد مالی شخصی

[English](README.md)

دفتر حساب شخصی مخصوص کاربران فارسی‌زبان: ثبت درآمد، هزینه و بودجه ماهانه با تقویم شمسی، اعداد فارسی، راست‌چین و حالت تیره و روشن.

**استک:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Recharts · FastAPI · SQLAlchemy 2 · JWT · SQLite / PostgreSQL

## قابلیت‌ها

- صفحه معرفی عمومی با پیش‌نمایش متحرک دفتر، امکانات، مراحل کار و پرسش‌های رایج
- صفحه‌های ورود و ثبت‌نام متحرک، با نمایشگر قدرت رمز عبور و نمایش/پنهان کردن رمز
- احراز هویت با JWT و ساخت دسته‌بندی‌های پیش‌فرض برای هر کاربر جدید
- ثبت، ویرایش و حذف تراکنش با فیلتر نوع، دسته و جستجو در توضیحات
- بودجه ماهانه برای هر دسته هزینه، با نوار پیشرفت و هشدار از ۸۰٪
- تراکنش تکرارشونده (اجاره، قسط و ...) که هر ماه در روز مشخص خودکار ثبت می‌شود
- نمودار سهم دسته‌ها، روند ۶ ماه اخیر و هزینه روزانه
- پشتیبانی کامل از تقویم شمسی (انتخاب تاریخ، گروه‌بندی ماهانه، سال کبیسه)
- خروجی CSV برای Excel و چاپ / PDF
- طراحی تک‌رنگ سیاه و سفید با تم تیره و روشن، راست‌چین، فونت وزیرمتن

## مسیرها

| مسیر                   | صفحه                     |
| ---------------------- | ------------------------ |
| `/`                    | صفحه معرفی               |
| `/login` و `/register` | ورود و ثبت‌نام           |
| `/dashboard`           | نمای کلی ماه و نمودارها  |
| `/transactions`        | فهرست و ویرایش تراکنش‌ها |
| `/budgets`             | بودجه‌های ماهانه         |
| `/recurring`           | تراکنش‌های تکرارشونده    |
| `/categories`          | دسته‌بندی‌ها             |

## راه‌اندازی

### بک‌اند

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

در PowerShell ویندوز محیط مجازی را با `.venv\Scripts\Activate.ps1` فعال کنید.

مستندات API: http://localhost:8000/docs

بک‌اند فایل `.env` را خودکار نمی‌خواند. متغیرها را در شل تنظیم کنید یا uvicorn را با `--env-file .env` اجرا کنید.

برای PostgreSQL مقدار `DATABASE_URL` را مثل `postgresql://user:pass@localhost:5432/finance` بگذارید.

### فرانت‌اند

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

آدرس برنامه: http://localhost:3000

اگر بعد از تغییر فایل‌ها ظاهر صفحه قدیمی ماند، کش را پاک کنید و دوباره اجرا کنید:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run dev
```

## متغیرهای محیطی

| متغیر                  | کجا       | توضیح                                        |
| ---------------------- | --------- | -------------------------------------------- |
| `SECRET_KEY`           | بک‌اند    | کلید امضای JWT. در محیط واقعی حتماً عوض شود  |
| `DATABASE_URL`         | بک‌اند    | پیش‌فرض یک فایل SQLite محلی                  |
| `FRONTEND_ORIGIN`      | بک‌اند    | آدرس(های) مجاز برای CORS، با ویرگول جدا شود  |
| `TOKEN_EXPIRE_MINUTES` | بک‌اند    | پیش‌فرض ۷ روز                                |
| `NEXT_PUBLIC_API_URL`  | فرانت‌اند | آدرس بک‌اند، پیش‌فرض `http://localhost:8000` |

## ساختار پروژه

```
backend/app
  main.py  models.py  schemas.py  auth.py  services.py  jalali.py  database.py
  routers/  auth  categories  transactions  budgets  recurring  reports
frontend
  app/page.tsx          صفحه معرفی
  app/login, register   صفحه‌های ورود و ثبت‌نام
  app/(app)/            داشبورد، تراکنش‌ها، بودجه، تکرارشونده‌ها، دسته‌ها
  components/           AuthScreen, LedgerPreview, LandingNav, Modal, ...
  lib/                  کلاینت API، توابع تقویم شمسی، قالب‌بندی، تایپ‌ها
```

## نکات طراحی

- مبلغ‌ها به‌صورت عدد صحیح (تومان) ذخیره می‌شوند تا جمع‌ها خطای اعشاری نداشته باشند.
- تبدیل تاریخ شمسی به‌طور مستقل در پایتون (`jalali.py`) و TypeScript (`lib/jalali.ts`) پیاده شده تا مرز ماه‌ها در هر دو سمت یکی باشد.
- جهت صفحه‌ها با `dir="rtl"` روی ریشه‌ی هر صفحه مشخص شده، فیلد ایمیل و رمز عبور چپ‌به‌راست می‌مانند و اعداد علامت‌دار با کلاس `.num` ساخته می‌شوند تا مثبت و منفی جابه‌جا نشود.
- فضای اسکرول‌بار همیشه رزرو است (`overflow-y: scroll` روی `html`) تا هدر بین صفحه‌های کوتاه و بلند جابه‌جا نشود.
- انیمیشن‌ها به تنظیم `prefers-reduced-motion` احترام می‌گذارند.
