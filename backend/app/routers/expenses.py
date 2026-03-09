from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import date

from backend.app.database import get_db
from backend.app.models import Expense, Category, User
from backend.app.schemas.expense import ExpenseCreate, ExpenseUpdate, ExpenseOut

router = APIRouter(
    prefix="/expenses",
    tags=["Expenses"]
)


@router.post("/", response_model=ExpenseOut, status_code=status.HTTP_201_CREATED)
def create_expense(expense: ExpenseCreate, db: Session = Depends(get_db)):

    if not db.query(User).filter(User.id == expense.user_id).first():
        raise HTTPException(status_code=404, detail="User not found")

    if not db.query(Category).filter(Category.id == expense.category_id).first():
        raise HTTPException(status_code=404, detail="Category not found")

    db_expense = Expense(**expense.model_dump())

    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)

    return db_expense


@router.get("/", response_model=List[ExpenseOut])
def list_expenses(
    user_id: int,
    category_id: int | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    db: Session = Depends(get_db),
):

    query = db.query(Expense).filter(Expense.user_id == user_id)

    if category_id:
        query = query.filter(Expense.category_id == category_id)

    if start_date:
        query = query.filter(Expense.expense_date >= start_date)

    if end_date:
        query = query.filter(Expense.expense_date <= end_date)

    return query.order_by(Expense.expense_date.desc()).all()


@router.get("/{expense_id}", response_model=ExpenseOut)
def get_expense(expense_id: int, db: Session = Depends(get_db)):

    expense = db.query(Expense).filter(Expense.id == expense_id).first()

    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    return expense


@router.patch("/{expense_id}", response_model=ExpenseOut)
def update_expense(expense_id: int, updates: ExpenseUpdate, db: Session = Depends(get_db)):

    expense = db.query(Expense).filter(Expense.id == expense_id).first()

    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    for field, value in updates.model_dump(exclude_unset=True).items():
        setattr(expense, field, value)

    db.commit()
    db.refresh(expense)

    return expense


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(expense_id: int, db: Session = Depends(get_db)):

    expense = db.query(Expense).filter(Expense.id == expense_id).first()

    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    db.delete(expense)
    db.commit()


@router.get("/summary/{user_id}")
def expense_summary(user_id: int, db: Session = Depends(get_db)):

    results = (
        db.query(Category.name, func.sum(Expense.amount).label("total"))
        .join(Expense, Expense.category_id == Category.id)
        .filter(Expense.user_id == user_id)
        .group_by(Category.name)
        .all()
    )

    return [{"category": r.name, "total": round(r.total, 2)} for r in results]
