from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.schemas.response import ApiResponse

router = APIRouter()

@router.get("")
async def get_alerts(
    status: str = "all",
    limit: int = 20,
    current_user: dict = Depends(get_current_user)
):
    return ApiResponse(
        success=True,
        data={
            "alerts": [],
            "unread_count": 0
        }
    )
