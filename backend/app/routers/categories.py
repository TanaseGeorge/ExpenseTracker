from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.app.database import get_db
from backend.app.models import Category
from backend.app.schemas.category import CategoryCreate, CategoryOut

router = APIRouter(
    prefix="/categories",
    tags=["Categories"]
)


@router.post("/", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):

    db_cat = Category(**category.model_dump())

    db.add(db_cat)
    db.commit()
    db.refresh(db_cat)

    return db_cat


@router.get("/", response_model=List[CategoryOut])
def list_categories(db: Session = Depends(get_db)):

    return db.query(Category).all()


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(category_id: int, db: Session = Depends(get_db)):

    cat = db.query(Category).filter(Category.id == category_id).first()

    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")

    db.delete(cat)
    db.commit()
