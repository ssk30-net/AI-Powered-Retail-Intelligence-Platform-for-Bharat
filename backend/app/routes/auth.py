from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from app.core.database import get_db
from app.core.security import (
    verify_password, 
    get_password_hash, 
    create_access_token, 
    create_refresh_token,
    decode_token,
    get_current_user
)
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, TokenResponse, UserResponse, RefreshTokenRequest
from app.schemas.response import ApiResponse, ErrorResponse

router = APIRouter()

@router.post("/register", response_model=ApiResponse[TokenResponse])
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        password_hash=hashed_password,
        full_name=user_data.full_name,
        company_name=user_data.company_name,
        industry=user_data.industry
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Generate tokens
    access_token = create_access_token(data={"sub": str(new_user.id), "email": new_user.email})
    refresh_token = create_refresh_token(data={"sub": str(new_user.id), "email": new_user.email})
    
    return ApiResponse(
        success=True,
        data=TokenResponse(
            user_id=str(new_user.id),
            email=new_user.email,
            token=access_token,
            refresh_token=refresh_token,
            is_first_login=True
        ),
        message="User registered successfully"
    )

@router.post("/login", response_model=ApiResponse[TokenResponse])
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    # Find user
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )
    
    # Update last login
    user.last_login_at = datetime.utcnow()
    db.commit()
    
    # Generate tokens
    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
    refresh_token = create_refresh_token(data={"sub": str(user.id), "email": user.email})
    
    return ApiResponse(
        success=True,
        data=TokenResponse(
            user_id=str(user.id),
            email=user.email,
            token=access_token,
            refresh_token=refresh_token,
            is_first_login=user.is_first_login
        ),
        message="Login successful"
    )

@router.post("/refresh-token", response_model=ApiResponse[dict])
async def refresh_token(request: RefreshTokenRequest):
    try:
        payload = decode_token(request.refresh_token)
        
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )
        
        # Generate new tokens
        access_token = create_access_token(data={"sub": payload.get("sub"), "email": payload.get("email")})
        new_refresh_token = create_refresh_token(data={"sub": payload.get("sub"), "email": payload.get("email")})
        
        return ApiResponse(
            success=True,
            data={
                "token": access_token,
                "refresh_token": new_refresh_token
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

@router.get("/me", response_model=ApiResponse[UserResponse])
async def get_current_user_info(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == current_user["user_id"]).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return ApiResponse(
        success=True,
        data=UserResponse(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            company_name=user.company_name,
            industry=user.industry,
            is_first_login=user.is_first_login,
            created_at=user.created_at
        )
    )

@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    return ApiResponse(
        success=True,
        message="Logged out successfully"
    )
