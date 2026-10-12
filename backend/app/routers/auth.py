from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..auth import create_token, get_current_user, hash_password, verify_password
from ..database import get_db
from ..models import Category, User
from ..schemas import LoginIn, RegisterIn, TokenOut, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])

DEFAULT_CATEGORIES = [
    ("خوراک", "expense", "#f97316"),
    ("مسکن", "expense", "#6366f1"),
    ("حمل‌ونقل", "expense", "#0ea5e9"),
    ("قبوض", "expense", "#eab308"),
    ("سلامت", "expense", "#ef4444"),
    ("آموزش", "expense", "#8b5cf6"),
    ("تفریح", "expense", "#ec4899"),
    ("خرید", "expense", "#14b8a6"),
    ("سایر", "expense", "#64748b"),
    ("حقوق", "income", "#22c55e"),
    ("فریلنس", "income", "#10b981"),
    ("سایر درآمدها", "income", "#84cc16"),
]


@router.post("/register", response_model=TokenOut, status_code=201)
def register(data: RegisterIn, db: Session = Depends(get_db)):
    email = data.email.lower()
    if db.scalar(select(User).where(User.email == email)):
        raise HTTPException(409, "این ایمیل قبلاً ثبت شده است")
    user = User(name=data.name.strip(), email=email, password_hash=hash_password(data.password))
    db.add(user)
    db.flush()
    db.add_all(
        [Category(user_id=user.id, name=name, type=kind, color=color) for name, kind, color in DEFAULT_CATEGORIES]
    )
    db.commit()
    return TokenOut(access_token=create_token(user.id))


@router.post("/login", response_model=TokenOut)
def login(data: LoginIn, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == data.email.lower()))
    if user is None or not verify_password(data.password, user.password_hash):
        raise HTTPException(401, "ایمیل یا رمز عبور اشتباه است")
    return TokenOut(access_token=create_token(user.id))


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user
