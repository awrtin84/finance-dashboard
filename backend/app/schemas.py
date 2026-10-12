import datetime as dt
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

TxType = Literal["income", "expense"]


class RegisterIn(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(max_length=128)


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str


class CategoryIn(BaseModel):
    name: str = Field(min_length=1, max_length=60)
    type: TxType
    color: str = Field(default="#6366f1", pattern=r"^#[0-9a-fA-F]{6}$")


class CategoryOut(CategoryIn):
    model_config = ConfigDict(from_attributes=True)

    id: int


class TransactionIn(BaseModel):
    type: TxType
    amount: int = Field(gt=0, le=1_000_000_000_000)
    category_id: int
    date: dt.date
    note: str = Field(default="", max_length=300)


class TransactionOut(BaseModel):
    id: int
    type: TxType
    amount: int
    note: str
    date: dt.date
    category_id: int
    category_name: str
    category_color: str


class TransactionListOut(BaseModel):
    items: list[TransactionOut]
    total: int
    income: int
    expense: int


class BudgetIn(BaseModel):
    category_id: int
    jy: int = Field(ge=1300, le=1600)
    jm: int = Field(ge=1, le=12)
    amount: int = Field(ge=0, le=1_000_000_000_000)


class BudgetRow(BaseModel):
    category_id: int
    category_name: str
    category_color: str
    amount: int | None
    spent: int


class RecurringIn(BaseModel):
    type: TxType
    amount: int = Field(gt=0, le=1_000_000_000_000)
    category_id: int
    day_of_month: int = Field(ge=1, le=31)
    note: str = Field(default="", max_length=300)


class RecurringPatch(BaseModel):
    active: bool


class RecurringOut(BaseModel):
    id: int
    type: TxType
    amount: int
    note: str
    day_of_month: int
    category_id: int
    category_name: str
    category_color: str
    active: bool
