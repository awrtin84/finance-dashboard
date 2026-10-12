from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import Budget, Category, RecurringRule, Transaction, User
from ..schemas import CategoryIn, CategoryOut

router = APIRouter(prefix="/categories", tags=["categories"])


def get_owned(db: Session, user: User, category_id: int) -> Category:
    category = db.scalar(select(Category).where(Category.id == category_id, Category.user_id == user.id))
    if category is None:
        raise HTTPException(404, "دسته‌بندی پیدا نشد")
    return category


@router.get("", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.scalars(select(Category).where(Category.user_id == user.id).order_by(Category.type, Category.id)).all()


@router.post("", response_model=CategoryOut, status_code=201)
def create_category(data: CategoryIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    name = data.name.strip()
    exists = db.scalar(
        select(Category.id).where(Category.user_id == user.id, Category.name == name, Category.type == data.type)
    )
    if exists:
        raise HTTPException(409, "این دسته‌بندی قبلاً وجود دارد")
    category = Category(user_id=user.id, name=name, type=data.type, color=data.color)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.put("/{category_id}", response_model=CategoryOut)
def update_category(
    category_id: int,
    data: CategoryIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    category = get_owned(db, user, category_id)
    if category.type != data.type:
        raise HTTPException(400, "نوع دسته‌بندی قابل تغییر نیست")
    name = data.name.strip()
    duplicate = db.scalar(
        select(Category.id).where(
            Category.user_id == user.id,
            Category.name == name,
            Category.type == data.type,
            Category.id != category.id,
        )
    )
    if duplicate:
        raise HTTPException(409, "این دسته‌بندی قبلاً وجود دارد")
    category.name = name
    category.color = data.color
    db.commit()
    db.refresh(category)
    return category


@router.delete("/{category_id}", status_code=204)
def delete_category(category_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    category = get_owned(db, user, category_id)
    used = db.scalar(select(func.count(Transaction.id)).where(Transaction.category_id == category.id))
    rules = db.scalar(select(func.count(RecurringRule.id)).where(RecurringRule.category_id == category.id))
    if used or rules:
        raise HTTPException(409, "این دسته‌بندی در تراکنش‌ها یا تراکنش‌های تکرارشونده استفاده شده و قابل حذف نیست")
    db.execute(delete(Budget).where(Budget.category_id == category.id))
    db.delete(category)
    db.commit()
