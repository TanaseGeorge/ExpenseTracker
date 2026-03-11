from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from backend.app.database import get_db
from backend.app.models import User, Category
from backend.app.schemas.user import UserCreate, UserOut, UserLogin

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

DEFAULT_CATEGORIES = [
    {"name": "Food", "description": "Groceries, dining, snacks"},
    {"name": "Transport", "description": "Bus, taxi, fuel, train"},
    {"name": "Bills", "description": "Utilities, rent, subscriptions"},
    {"name": "Shopping", "description": "Clothes, electronics, misc purchases"},
    {"name": "Entertainment", "description": "Movies, games, streaming"},
    {"name": "Health", "description": "Medicine, doctor, pharmacy"},
]


@router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=pwd_context.hash(user.password),
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    default_categories = [
        Category(
            name=category["name"],
            description=category["description"],
            user_id=db_user.id,
        )
        for category in DEFAULT_CATEGORIES
    ]

    db.add_all(default_categories)
    db.commit()

    return db_user


@router.post("/login", response_model=UserOut)
def login_user(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not pwd_context.verify(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    return user


@router.get("/{user_id}", response_model=UserOut)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user