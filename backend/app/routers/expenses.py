from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import date
import os

from openai import OpenAI
from dotenv import load_dotenv
from backend.app.database import get_db
from backend.app.models import Expense, Category, User
from backend.app.schemas.expense import ExpenseCreate, ExpenseUpdate, ExpenseOut

router = APIRouter(
    prefix="/expenses",
    tags=["Expenses"]
)

load_dotenv()

api_key = os.getenv("OPENROUTER_API_KEY")

if not api_key:
    raise RuntimeError("OPENROUTER_API_KEY is missing")

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key,
)


def build_expense_summary(expenses):
    total_spent = 0
    categories = {}

    for expense in expenses:
        amount = float(expense.amount or 0)
        total_spent += amount

        category = getattr(expense, "category", None)
        category_name = category.name if category else "Uncategorized"

        categories[category_name] = categories.get(category_name, 0) + amount

    return {
        "month": "Current period",
        "total_spent": round(total_spent, 2),
        "categories": {k: round(v, 2) for k, v in categories.items()}
    }


def build_prompt(expense_summary):
    return f"""
Role:
You are a personal finance assistant that helps users understand their spending habits.

Context:
The user is using a personal expense tracking application.
Your task is to analyze their spending and provide helpful insights.

User spending data:
Month: {expense_summary["month"]}
Total spent: {expense_summary["total_spent"]}

Spending by category:
{expense_summary["categories"]}

Instructions:
1. Provide a short summary of the user's spending pattern.
2. Identify one potential concern or unusual pattern.
3. Suggest two practical ways the user could reduce spending.

Response format:
Summary: <one short paragraph>
Issue: <one sentence>
Recommendations:
- <tip 1>
- <tip 2>

Rules:
- Keep the response under 100 words.
- Use simple and friendly language.
- Base the advice strictly on the provided data.
""".strip()


def generate_ai_spending_insight(expenses):
    summary = build_expense_summary(expenses)
    prompt = build_prompt(summary)

    response = client.chat.completions.create(
        model="meta-llama/llama-3.3-70b-instruct:free",
        messages=[
            {
                "role": "system",
                "content": "You are a helpful personal finance assistant."
            },
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    insight = response.choices[0].message.content.strip()

    return {
        "summary_data": summary,
        "insight": insight
    }


@router.post("/", response_model=ExpenseOut, status_code=status.HTTP_201_CREATED)
def create_expense(expense: ExpenseCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == expense.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    category = db.query(Category).filter(
        Category.id == expense.category_id,
        Category.user_id == expense.user_id
    ).first()

    if not category:
        raise HTTPException(status_code=404, detail="Category not found for this user")

    db_expense = Expense(**expense.model_dump())
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense


@router.get("/ai-insight/{user_id}")
def get_ai_insight(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    expenses = (
        db.query(Expense)
        .filter(Expense.user_id == user_id)
        .order_by(Expense.expense_date.desc())
        .all()
    )

    if not expenses:
        raise HTTPException(status_code=400, detail="No expenses found for this user")

    for expense in expenses:
        expense.category = db.query(Category).filter(Category.id == expense.category_id).first()

    try:
        return generate_ai_spending_insight(expenses)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI insight error: {str(e)}")


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

    if updates.category_id is not None:
        category = db.query(Category).filter(
            Category.id == updates.category_id,
            Category.user_id == expense.user_id
        ).first()

        if not category:
            raise HTTPException(status_code=404, detail="Category not found for this user")

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