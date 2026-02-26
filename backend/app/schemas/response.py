from pydantic import BaseModel
from typing import Generic, TypeVar, Optional
from datetime import datetime

T = TypeVar('T')

class ApiResponse(BaseModel, Generic[T]):
    success: bool
    data: Optional[T] = None
    message: Optional[str] = None
    timestamp: datetime = datetime.utcnow()

class ErrorResponse(BaseModel):
    success: bool = False
    error: dict
    timestamp: datetime = datetime.utcnow()
