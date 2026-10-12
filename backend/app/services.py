import datetime as dt

from sqlalchemy import select
from sqlalchemy.orm import Session

from .jalali import jalali_to_date, month_length, shift_month, to_jalali_date
from .models import RecurringRule, Transaction, User

MAX_CATCH_UP_MONTHS = 36


def generate_recurring(db: Session, user: User) -> None:
    rules = db.scalars(
        select(RecurringRule).where(RecurringRule.user_id == user.id, RecurringRule.active.is_(True))
    ).all()
    if not rules:
        return

    today = dt.date.today()
    cy, cm, _ = to_jalali_date(today)
    changed = False

    for rule in rules:
        if rule.last_generated is None:
            y, m, created_day = to_jalali_date(rule.created_at.date())
            if min(rule.day_of_month, month_length(y, m)) < created_day:
                y, m = shift_month(y, m, 1)
        else:
            y, m = shift_month(rule.last_generated // 100, rule.last_generated % 100, 1)

        steps = 0
        while (y, m) <= (cy, cm) and steps < MAX_CATCH_UP_MONTHS:
            day = min(rule.day_of_month, month_length(y, m))
            when = jalali_to_date(y, m, day)
            if when > today:
                break
            db.add(
                Transaction(
                    user_id=user.id,
                    category_id=rule.category_id,
                    type=rule.type,
                    amount=rule.amount,
                    note=rule.note,
                    date=when,
                )
            )
            rule.last_generated = y * 100 + m
            changed = True
            y, m = shift_month(y, m, 1)
            steps += 1

    if changed:
        db.commit()
