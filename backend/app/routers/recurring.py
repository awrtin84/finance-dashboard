from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import Category, RecurringRule, User
from ..schemas import RecurringIn, RecurringOut, RecurringPatch
from .categories import get_owned

router = APIRouter(prefix="/recurring", tags=["recurring"])


def to_out(rule: RecurringRule, name: str, color: str) -> RecurringOut:
    return RecurringOut(
        id=rule.id,
        type=rule.type,
        amount=rule.amount,
        note=rule.note,
        day_of_month=rule.day_of_month,
        category_id=rule.category_id,
        category_name=name,
        category_color=color,
        active=rule.active,
    )


def get_rule(db: Session, user: User, rule_id: int) -> RecurringRule:
    rule = db.scalar(select(RecurringRule).where(RecurringRule.id == rule_id, RecurringRule.user_id == user.id))
    if rule is None:
        raise HTTPException(404, "مورد پیدا نشد")
    return rule


@router.get("", response_model=list[RecurringOut])
def list_rules(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rows = db.execute(
        select(RecurringRule, Category.name, Category.color)
        .join(Category, Category.id == RecurringRule.category_id)
        .where(RecurringRule.user_id == user.id)
        .order_by(RecurringRule.day_of_month, RecurringRule.id)
    ).all()
    return [to_out(rule, name, color) for rule, name, color in rows]


@router.post("", response_model=RecurringOut, status_code=201)
def create_rule(data: RecurringIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    category = get_owned(db, user, data.category_id)
    if category.type != data.type:
        raise HTTPException(400, "نوع تراکنش با نوع دسته‌بندی هماهنگ نیست")
    rule = RecurringRule(
        user_id=user.id,
        category_id=category.id,
        type=data.type,
        amount=data.amount,
        note=data.note.strip(),
        day_of_month=data.day_of_month,
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return to_out(rule, category.name, category.color)


@router.patch("/{rule_id}", response_model=RecurringOut)
def toggle_rule(
    rule_id: int,
    data: RecurringPatch,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    rule = get_rule(db, user, rule_id)
    rule.active = data.active
    db.commit()
    category = db.get(Category, rule.category_id)
    return to_out(rule, category.name, category.color)


@router.delete("/{rule_id}", status_code=204)
def delete_rule(rule_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rule = get_rule(db, user, rule_id)
    db.delete(rule)
    db.commit()
