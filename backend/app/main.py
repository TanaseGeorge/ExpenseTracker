from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from backend.app.database import init_db, get_db
from backend.app.routers import auth, expenses, categories
import uvicorn
from fastapi import Depends
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

app = FastAPI(
    title="ExpenseTracker API",
    description="Backend API for managing personal expenses",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()


# Health endpoints
@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "ExpenseTracker API is running"}


@app.get("/health", tags=["Health"])
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database connection failed: {str(e)}",
        )


# Register routers
app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(expenses.router)


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
