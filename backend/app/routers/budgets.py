from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..jalali import month_range
from ..models import Budget, Category, Transaction, User
from ..schemas import BudgetIn, BudgetRow
from ..services import generate_recurring
from .categories import get_owned

router = APIRouter(prefix="/budgets", tags=["budgets"])


@router.get("", response_model=list[BudgetRow])
def list_budgets(
    jy: int = Query(ge=1300, le=1600),
    jm: int = Query(ge=1, le=12),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    generate_recurring(db, user)
    start, end = month_range(jy, jm)
    spent = dict(
        db.execute(
            select(Transaction.category_id, func.sum(Transaction.amount))
            .where(
                Transaction.user_id == user.id,
                Transaction.type == "expense",
                Transaction.date >= start,
                Transaction.date < end,
            )
            .group_by(Transaction.category_id)
        ).all()
    )
    budgets = {
        b.category_id: b.amount
        for b in db.scalars(select(Budget).where(Budget.user_id == user.id, Budget.jy == jy, Budget.jm == jm))
    }
    categories = db.scalars(
        select(Category).where(Category.user_id == user.id, Category.type == "expense").order_by(Category.id)
    ).all()
    return [
        BudgetRow(
            category_id=c.id,
            category_name=c.name,
            category_color=c.color,
            amount=budgets.get(c.id),
            spent=int(spent.get(c.id, 0)),
        )
        for c in categories
    ]


@router.put("", status_code=204)
def set_budget(data: BudgetIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    category = get_owned(db, user, data.category_id)
    budget = db.scalar(
        select(Budget).where(
            Budget.user_id == user.id,
            Budget.category_id == category.id,
            Budget.jy == data.jy,
            Budget.jm == data.jm,
        )
    )
    if data.amount == 0:
        if budget:
            db.delete(budget)
            db.commit()
        return
    if budget:
        budget.amount = data.amount
    else:
        db.add(Budget(user_id=user.id, category_id=category.id, jy=data.jy, jm=data.jm, amount=data.amount))
    db.commit()
