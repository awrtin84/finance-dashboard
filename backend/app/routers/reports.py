from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..jalali import month_length, month_range, shift_month, to_jalali_date
from ..models import Category, Transaction, User
from ..services import generate_recurring

router = APIRouter(prefix="/reports", tags=["reports"])


def totals_for(db: Session, user: User, start, end) -> dict[str, int]:
    totals = {"income": 0, "expense": 0}
    rows = db.execute(
        select(Transaction.type, func.sum(Transaction.amount))
        .where(Transaction.user_id == user.id, Transaction.date >= start, Transaction.date < end)
        .group_by(Transaction.type)
    ).all()
    for kind, total in rows:
        totals[kind] = int(total)
    return totals


@router.get("/summary")
def summary(
    jy: int = Query(ge=1300, le=1600),
    jm: int = Query(ge=1, le=12),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    generate_recurring(db, user)
    start, end = month_range(jy, jm)
    totals = totals_for(db, user, start, end)

    by_category = db.execute(
        select(Category.id, Category.name, Category.color, func.sum(Transaction.amount))
        .select_from(Transaction)
        .join(Category, Category.id == Transaction.category_id)
        .where(
            Transaction.user_id == user.id,
            Transaction.type == "expense",
            Transaction.date >= start,
            Transaction.date < end,
        )
        .group_by(Category.id, Category.name, Category.color)
        .order_by(func.sum(Transaction.amount).desc())
    ).all()

    daily_rows = db.execute(
        select(Transaction.date, Transaction.type, func.sum(Transaction.amount))
        .where(Transaction.user_id == user.id, Transaction.date >= start, Transaction.date < end)
        .group_by(Transaction.date, Transaction.type)
    ).all()
    daily = {day: {"day": day, "income": 0, "expense": 0} for day in range(1, month_length(jy, jm) + 1)}
    for when, kind, total in daily_rows:
        daily[to_jalali_date(when)[2]][kind] = int(total)

    trend = []
    for offset in range(-5, 1):
        y, m = shift_month(jy, jm, offset)
        s, e = month_range(y, m)
        t = totals_for(db, user, s, e)
        trend.append({"jy": y, "jm": m, "income": t["income"], "expense": t["expense"]})

    return {
        "income": totals["income"],
        "expense": totals["expense"],
        "balance": totals["income"] - totals["expense"],
        "by_category": [
            {"category_id": cid, "name": name, "color": color, "total": int(total)}
            for cid, name, color, total in by_category
        ],
        "daily": list(daily.values()),
        "trend": trend,
    }
