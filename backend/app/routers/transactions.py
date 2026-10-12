import csv
import datetime as dt
import io

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..jalali import format_jalali
from ..models import Category, Transaction, User
from ..schemas import TransactionIn, TransactionListOut, TransactionOut
from ..services import generate_recurring
from .categories import get_owned

router = APIRouter(prefix="/transactions", tags=["transactions"])


def build_filters(user, start, end, type_, category_id, q):
    filters = [Transaction.user_id == user.id]
    if start:
        filters.append(Transaction.date >= start)
    if end:
        filters.append(Transaction.date <= end)
    if type_:
        filters.append(Transaction.type == type_)
    if category_id:
        filters.append(Transaction.category_id == category_id)
    if q:
        filters.append(Transaction.note.ilike(f"%{q}%"))
    return filters


def to_out(t: Transaction, name: str, color: str) -> TransactionOut:
    return TransactionOut(
        id=t.id,
        type=t.type,
        amount=t.amount,
        note=t.note,
        date=t.date,
        category_id=t.category_id,
        category_name=name,
        category_color=color,
    )


def validated_category(db: Session, user: User, data: TransactionIn) -> Category:
    category = get_owned(db, user, data.category_id)
    if category.type != data.type:
        raise HTTPException(400, "نوع تراکنش با نوع دسته‌بندی هماهنگ نیست")
    return category


@router.get("", response_model=TransactionListOut)
def list_transactions(
    start: dt.date | None = None,
    end: dt.date | None = None,
    type: str | None = Query(default=None, pattern="^(income|expense)$"),
    category_id: int | None = None,
    q: str | None = None,
    limit: int = Query(default=500, ge=1, le=2000),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    generate_recurring(db, user)
    filters = build_filters(user, start, end, type, category_id, q)
    rows = db.execute(
        select(Transaction, Category.name, Category.color)
        .join(Category, Category.id == Transaction.category_id)
        .where(*filters)
        .order_by(Transaction.date.desc(), Transaction.id.desc())
        .limit(limit)
        .offset(offset)
    ).all()
    total, income, expense = db.execute(
        select(
            func.count(Transaction.id),
            func.coalesce(func.sum(case((Transaction.type == "income", Transaction.amount), else_=0)), 0),
            func.coalesce(func.sum(case((Transaction.type == "expense", Transaction.amount), else_=0)), 0),
        ).where(*filters)
    ).one()
    return TransactionListOut(
        items=[to_out(t, name, color) for t, name, color in rows],
        total=int(total),
        income=int(income),
        expense=int(expense),
    )


@router.get("/export")
def export_transactions(
    start: dt.date | None = None,
    end: dt.date | None = None,
    type: str | None = Query(default=None, pattern="^(income|expense)$"),
    category_id: int | None = None,
    q: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    generate_recurring(db, user)
    filters = build_filters(user, start, end, type, category_id, q)
    rows = db.execute(
        select(Transaction, Category.name)
        .join(Category, Category.id == Transaction.category_id)
        .where(*filters)
        .order_by(Transaction.date.desc(), Transaction.id.desc())
    ).all()
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["تاریخ", "نوع", "دسته‌بندی", "مبلغ (تومان)", "توضیحات"])
    for t, name in rows:
        writer.writerow(
            [format_jalali(t.date), "درآمد" if t.type == "income" else "هزینه", name, t.amount, t.note]
        )
    content = "﻿" + buffer.getvalue()
    return Response(
        content=content.encode("utf-8"),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": 'attachment; filename="transactions.csv"'},
    )


@router.post("", response_model=TransactionOut, status_code=201)
def create_transaction(data: TransactionIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    category = validated_category(db, user, data)
    transaction = Transaction(
        user_id=user.id,
        category_id=category.id,
        type=data.type,
        amount=data.amount,
        note=data.note.strip(),
        date=data.date,
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return to_out(transaction, category.name, category.color)


@router.put("/{transaction_id}", response_model=TransactionOut)
def update_transaction(
    transaction_id: int,
    data: TransactionIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    transaction = db.scalar(
        select(Transaction).where(Transaction.id == transaction_id, Transaction.user_id == user.id)
    )
    if transaction is None:
        raise HTTPException(404, "تراکنش پیدا نشد")
    category = validated_category(db, user, data)
    transaction.category_id = category.id
    transaction.type = data.type
    transaction.amount = data.amount
    transaction.note = data.note.strip()
    transaction.date = data.date
    db.commit()
    db.refresh(transaction)
    return to_out(transaction, category.name, category.color)


@router.delete("/{transaction_id}", status_code=204)
def delete_transaction(transaction_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    transaction = db.scalar(
        select(Transaction).where(Transaction.id == transaction_id, Transaction.user_id == user.id)
    )
    if transaction is None:
        raise HTTPException(404, "تراکنش پیدا نشد")
    db.delete(transaction)
    db.commit()
