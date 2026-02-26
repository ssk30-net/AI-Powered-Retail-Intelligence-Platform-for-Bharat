from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.schemas.response import ApiResponse

router = APIRouter()

@router.get("/commodities")
async def get_commodities(current_user: dict = Depends(get_current_user)):
    return ApiResponse(
        success=True,
        data={
            "commodities": [
                {"id": 1, "name": "Wheat", "category": "Grains", "unit": "quintal"},
                {"id": 2, "name": "Rice", "category": "Grains", "unit": "quintal"},
                {"id": 3, "name": "Onion", "category": "Vegetables", "unit": "quintal"}
            ]
        }
    )

@router.get("/{commodity_id}")
async def get_forecast(
    commodity_id: int,
    horizon: int = 30,
    region_id: int = 1,
    current_user: dict = Depends(get_current_user)
):
    # Mock forecast data
    return ApiResponse(
        success=True,
        data={
            "commodity_id": commodity_id,
            "commodity_name": "Wheat",
            "historical": [
                {"date": "2026-01-26", "price": 2500},
                {"date": "2026-02-26", "price": 2650}
            ],
            "forecast": [
                {
                    "date": "2026-02-27",
                    "predicted_price": 2680,
                    "lower_bound": 2620,
                    "upper_bound": 2740,
                    "confidence": 0.85
                },
                {
                    "date": "2026-03-27",
                    "predicted_price": 2750,
                    "lower_bound": 2680,
                    "upper_bound": 2820,
                    "confidence": 0.82
                }
            ],
            "explanation": "Based on historical trends and current market conditions, wheat prices are expected to increase by 4% over the next 30 days due to seasonal demand and supply constraints.",
            "accuracy": 92.5
        }
    )
