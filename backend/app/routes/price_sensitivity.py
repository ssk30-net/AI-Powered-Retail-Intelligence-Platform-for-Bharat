from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.core.security import get_current_user
from app.schemas.response import ApiResponse

router = APIRouter()

class SimulationRequest(BaseModel):
    commodity_id: int
    price_adjustment_percent: float
    region_id: int = 1

@router.get("/{commodity_id}")
async def get_price_sensitivity(
    commodity_id: int,
    region_id: int = 1,
    current_user: dict = Depends(get_current_user)
):
    return ApiResponse(
        success=True,
        data={
            "commodity_id": commodity_id,
            "elasticity_coefficient": -1.2,
            "optimal_price": 2700,
            "current_price": 2500,
            "demand_at_optimal": 15000,
            "revenue_at_optimal": 40500000
        }
    )

@router.post("/simulate")
async def simulate_price_change(
    request: SimulationRequest,
    current_user: dict = Depends(get_current_user)
):
    # Simple simulation logic
    base_price = 2500
    new_price = base_price * (1 + request.price_adjustment_percent / 100)
    elasticity = -1.2
    demand_change = elasticity * request.price_adjustment_percent
    base_demand = 16000
    new_demand = base_demand * (1 + demand_change / 100)
    new_revenue = new_price * new_demand
    base_revenue = base_price * base_demand
    revenue_change = ((new_revenue - base_revenue) / base_revenue) * 100
    
    return ApiResponse(
        success=True,
        data={
            "new_price": round(new_price, 2),
            "predicted_demand": round(new_demand, 0),
            "predicted_revenue": round(new_revenue, 0),
            "revenue_change_percent": round(revenue_change, 2),
            "risk_level": "medium" if abs(request.price_adjustment_percent) > 10 else "low"
        }
    )
