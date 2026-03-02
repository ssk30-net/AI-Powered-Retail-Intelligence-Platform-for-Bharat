from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.response import ApiResponse
from app.models.forecast import Forecast

router = APIRouter()

@router.get("")
async def get_forecasts(
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all forecasts"""
    try:
        forecasts = db.query(Forecast).order_by(Forecast.forecast_date.desc()).limit(limit).all()
        
        return ApiResponse(
            success=True,
            data=[{
                "id": f.id,
                "commodity_id": f.commodity_id,
                "region_id": f.region_id,
                "forecast_date": f.forecast_date.isoformat() if f.forecast_date else None,
                "predicted_price": float(f.predicted_price),
                "confidence_score": float(f.confidence_score),
                "model_version": f.model_version
            } for f in forecasts]
        )
    except Exception as e:
        return ApiResponse(
            success=False,
            data=[],
            message=f"Error fetching forecasts: {str(e)}"
        )

@router.get("/commodity/{commodity_id}")
async def get_commodity_forecasts(
    commodity_id: int,
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get forecasts for a specific commodity"""
    try:
        forecasts = db.query(Forecast).filter(
            Forecast.commodity_id == commodity_id
        ).order_by(Forecast.forecast_date.desc()).limit(limit).all()
        
        return ApiResponse(
            success=True,
            data=[{
                "id": f.id,
                "commodity_id": f.commodity_id,
                "region_id": f.region_id,
                "forecast_date": f.forecast_date.isoformat() if f.forecast_date else None,
                "predicted_price": float(f.predicted_price),
                "confidence_score": float(f.confidence_score),
                "model_version": f.model_version
            } for f in forecasts]
        )
    except Exception as e:
        return ApiResponse(
            success=False,
            data=[],
            message=f"Error fetching forecasts: {str(e)}"
        )

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
