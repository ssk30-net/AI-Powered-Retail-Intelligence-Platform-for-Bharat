from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.schemas.response import ApiResponse

router = APIRouter()

@router.get("/overview")
async def get_dashboard_overview(current_user: dict = Depends(get_current_user)):
    # Mock data for now
    return ApiResponse(
        success=True,
        data={
            "kpis": {
                "price_change_percent": 5.2,
                "demand_index": 78,
                "sentiment_score": 0.65,
                "risk_level": "medium"
            },
            "top_commodities": [
                {"id": 1, "name": "Wheat", "price": 2500, "change": 5.2},
                {"id": 2, "name": "Rice", "price": 3200, "change": -2.1},
                {"id": 3, "name": "Onion", "price": 1800, "change": 12.5}
            ],
            "recent_alerts": []
        }
    )

@router.get("/kpis")
async def get_kpis(current_user: dict = Depends(get_current_user)):
    return ApiResponse(
        success=True,
        data={
            "price_change_percent": 5.2,
            "demand_index": 78,
            "sentiment_score": 0.65,
            "risk_level": "medium"
        }
    )

@router.get("/price-trends")
async def get_price_trends(
    commodity_ids: str = "1,2,3",
    days: int = 30,
    current_user: dict = Depends(get_current_user)
):
    # Mock data
    return ApiResponse(
        success=True,
        data={
            "trends": [
                {
                    "commodity_id": 1,
                    "commodity_name": "Wheat",
                    "data_points": [
                        {"date": "2026-02-01", "price": 2500},
                        {"date": "2026-02-15", "price": 2600},
                        {"date": "2026-02-26", "price": 2650}
                    ]
                }
            ]
        }
    )
