from pydantic import BaseModel, Field


class UserBase(BaseModel):
    username: str = Field(..., example="johndoe")
    email: str = Field(..., example="john@example.com")


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, example="secret123")


class UserOut(UserBase):
    id: int

    class Config:
        from_attributes = True