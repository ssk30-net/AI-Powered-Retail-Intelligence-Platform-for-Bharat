from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    company_name: Optional[str] = None
    industry: Optional[str] = None

class UserCreate(UserBase):
    password: str
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
        if len(v) > 72:
            raise ValueError('Password must be at most 72 characters long')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) > 72:
            raise ValueError('Password must be at most 72 characters long')
        return v

class UserResponse(UserBase):
    id: str
    is_first_login: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    user_id: str
    email: str
    token: str
    refresh_token: str
    is_first_login: bool

class RefreshTokenRequest(BaseModel):
    refresh_token: str
