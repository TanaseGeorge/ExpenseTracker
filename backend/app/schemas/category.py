from pydantic import BaseModel, Field


class CategoryBase(BaseModel):
    name: str = Field(..., example="Food")
    description: str | None = Field(None, example="Groceries and dining")


class CategoryCreate(CategoryBase):
    pass


class CategoryOut(CategoryBase):
    id: int


class Config:
    from_attributes = True