from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.schemas.response import ApiResponse

router = APIRouter()

@router.get("/overview")
async def get_insights_overview(current_user: dict = Depends(get_current_user)):
    return ApiResponse(
        success=True,
        data={
            "market_opportunities": [],
            "top_recommendations": [],
            "performance_summary": {}
        }
    )
