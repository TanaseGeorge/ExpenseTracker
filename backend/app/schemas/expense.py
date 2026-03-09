from pydantic import BaseModel, Field
from datetime import date
from .category import CategoryOut


class ExpenseBase(BaseModel):
    title: str = Field(..., example="Lunch at Subway")
    amount: float = Field(..., gt=0, example=12.50)
    expense_date: date = Field(..., example="2026-03-09")
    category_id: int = Field(..., example=1)
    notes: str | None = Field(None, example="Team lunch")


class ExpenseCreate(ExpenseBase):
    user_id: int


class ExpenseUpdate(BaseModel):
    title: str | None = None
    amount: float | None = Field(None, gt=0)
    expense_date: date | None = None
    category_id: int | None = None
    notes: str | None = None


class ExpenseOut(ExpenseBase):
    id: int
    user_id: int
    category: CategoryOut | None = None


class Config:
    from_attributes = True
