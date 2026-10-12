# داشبورد مالی شخصی

مدیریت درآمد، هزینه و بودجه ماهانه با تقویم شمسی، اعداد فارسی و حالت تیره.

**استک:** Next.js 14 (App Router) · TypeScript · Tailwind · Recharts · FastAPI · SQLAlchemy · JWT · SQLite / PostgreSQL

## قابلیت‌ها

- ثبت‌نام و ورود با JWT، دسته‌بندی‌های پیش‌فرض برای هر کاربر جدید
- ثبت، ویرایش و حذف تراکنش با فیلتر نوع، دسته و جستجو در توضیحات
- بودجه ماهانه برای هر دسته هزینه، با نوار پیشرفت و هشدار از ۸۰٪
- تراکنش تکرارشونده (اجاره، قسط و ...) که هر ماه در روز مشخص خودکار ثبت می‌شود
- نمودار سهم دسته‌ها، روند ۶ ماه اخیر و هزینه روزانه
- تقویم شمسی کامل (انتخاب تاریخ، گروه‌بندی ماهانه، سال کبیسه)
- خروجی CSV برای Excel و چاپ / PDF
- حالت تیره، راست‌چین، فونت وزیرمتن

## اجرا

### بک‌اند

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

مستندات API: http://localhost:8000/docs

برای PostgreSQL در `DATABASE_URL` مقدار مثل `postgresql://user:pass@localhost:5432/finance` بگذارید.

### فرانت‌اند

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

آدرس: http://localhost:3000

## متغیرهای محیطی

| متغیر | کجا | توضیح |
| --- | --- | --- |
| `SECRET_KEY` | بک‌اند | کلید امضای JWT، حتماً در محیط واقعی عوض شود |
| `DATABASE_URL` | بک‌اند | پیش‌فرض SQLite محلی |
| `FRONTEND_ORIGIN` | بک‌اند | آدرس مجاز برای CORS، چند آدرس با ویرگول |
| `TOKEN_EXPIRE_MINUTES` | بک‌اند | پیش‌فرض ۷ روز |
| `NEXT_PUBLIC_API_URL` | فرانت‌اند | آدرس بک‌اند |

## ساختار

```
backend/app
  main.py  models.py  schemas.py  auth.py  services.py  jalali.py  database.py
  routers/  auth  categories  transactions  budgets  recurring  reports
frontend
  app/(app)/  داشبورد، تراکنش‌ها، بودجه، تکرارشونده‌ها، دسته‌ها
  app/login/
  components/  lib/
```
