from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime, timedelta
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.response import ApiResponse
from app.models.forecast import Forecast
from app.models.commodity import Commodity
from app.models.price_history import PriceHistory

router = APIRouter()


@router.get("")
async def get_forecasts(
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Get all forecasts from RDS."""
    try:
        forecasts = (
            db.query(Forecast)
            .order_by(Forecast.forecast_date.desc())
            .limit(limit)
            .all()
        )
        return ApiResponse(
            success=True,
            data=[
                {
                    "id": f.id,
                    "commodity_id": f.commodity_id,
                    "region_id": f.region_id,
                    "forecast_date": f.forecast_date.isoformat() if f.forecast_date else None,
                    "predicted_price": float(f.predicted_price),
                    "lower_bound": float(f.lower_bound) if f.lower_bound else None,
                    "upper_bound": float(f.upper_bound) if f.upper_bound else None,
                    "confidence_score": float(f.confidence_score) if f.confidence_score else None,
                    "model_version": f.model_version,
                    "explanation": f.explanation,
                }
                for f in forecasts
            ],
        )
    except Exception as e:
        return ApiResponse(
            success=False,
            data=[],
            message=f"Error fetching forecasts: {str(e)}",
        )


@router.get("/commodities")
async def get_commodities(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List commodities from RDS; fallback to defaults if empty."""
    try:
        rows = db.query(Commodity).filter(Commodity.is_active != False).all()
        if rows:
            return ApiResponse(
                success=True,
                data={
                    "commodities": [
                        {
                            "id": c.id,
                            "name": c.name,
                            "category": c.category or "General",
                            "unit": c.unit or "unit",
                        }
                        for c in rows
                    ]
                },
            )
    except Exception:
        pass
    return ApiResponse(
        success=True,
        data={
            "commodities": [
                {"id": 1, "name": "Wheat", "category": "Grains", "unit": "quintal"},
                {"id": 2, "name": "Rice", "category": "Grains", "unit": "quintal"},
                {"id": 3, "name": "Onion", "category": "Vegetables", "unit": "quintal"},
            ]
        },
    )


@router.get("/commodity/{commodity_id}")
async def get_commodity_forecasts(
    commodity_id: int,
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Get forecasts for a specific commodity from RDS."""
    try:
        forecasts = (
            db.query(Forecast)
            .filter(Forecast.commodity_id == commodity_id)
            .order_by(Forecast.forecast_date.desc())
            .limit(limit)
            .all()
        )
        return ApiResponse(
            success=True,
            data=[
                {
                    "id": f.id,
                    "commodity_id": f.commodity_id,
                    "region_id": f.region_id,
                    "forecast_date": f.forecast_date.isoformat() if f.forecast_date else None,
                    "predicted_price": float(f.predicted_price),
                    "lower_bound": float(f.lower_bound) if f.lower_bound else None,
                    "upper_bound": float(f.upper_bound) if f.upper_bound else None,
                    "confidence_score": float(f.confidence_score) if f.confidence_score else None,
                    "model_version": f.model_version,
                    "explanation": f.explanation,
                }
                for f in forecasts
            ],
        )
    except Exception as e:
        return ApiResponse(
            success=False,
            data=[],
            message=f"Error fetching forecasts: {str(e)}",
        )


@router.get("/{commodity_id}")
async def get_forecast(
    commodity_id: int,
    horizon: int = Query(30, ge=1, le=90),
    region_id: int = 1,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Historical prices + forecast from RDS for a commodity (model output)."""
    try:
        comm = db.query(Commodity).filter(Commodity.id == commodity_id).first()
        commodity_name = comm.name if comm else f"Commodity {commodity_id}"

        since = datetime.utcnow() - timedelta(days=min(horizon * 2, 365))
        historical = (
            db.query(PriceHistory.recorded_at, PriceHistory.price)
            .filter(
                PriceHistory.commodity_id == commodity_id,
                PriceHistory.region_id == region_id,
                PriceHistory.recorded_at >= since,
            )
            .order_by(PriceHistory.recorded_at)
            .all()
        )
        historical_list = [
            {"date": r.recorded_at.strftime("%Y-%m-%d") if r.recorded_at else None, "price": float(r.price)}
            for r in historical
        ]

        forecast_rows = (
            db.query(Forecast)
            .filter(
                Forecast.commodity_id == commodity_id,
                Forecast.region_id == region_id,
                Forecast.forecast_date >= datetime.utcnow().date(),
            )
            .order_by(Forecast.forecast_date)
            .limit(horizon)
            .all()
        )
        forecast_list = [
            {
                "date": f.forecast_date.strftime("%Y-%m-%d") if f.forecast_date else None,
                "predicted_price": float(f.predicted_price),
                "lower_bound": float(f.lower_bound) if f.lower_bound else float(f.predicted_price) * 0.98,
                "upper_bound": float(f.upper_bound) if f.upper_bound else float(f.predicted_price) * 1.02,
                "confidence": float(f.confidence_score) if f.confidence_score else 0.85,
            }
            for f in forecast_rows
        ]

        # If no historical in RDS, add minimal placeholder so chart works
        if not historical_list:
            historical_list = [
                {"date": (datetime.utcnow() - timedelta(days=i)).strftime("%Y-%m-%d"), "price": 0}
                for i in range(7, 0, -1)
            ]
        if not forecast_list and forecast_rows is not None:
            pass  # keep empty
        elif not forecast_list:
            # No forecast rows: optional fallback so UI still works
            forecast_list = [
                {
                    "date": (datetime.utcnow().date() + timedelta(days=i)).strftime("%Y-%m-%d"),
                    "predicted_price": 0,
                    "lower_bound": 0,
                    "upper_bound": 0,
                    "confidence": 0.8,
                }
                for i in range(1, min(horizon + 1, 31))
            ]

        last_explanation = None
        if forecast_rows:
            last_explanation = getattr(forecast_rows[-1], "explanation", None) or (
                f"Model forecast for {commodity_name} based on RDS historical data."
            )
        else:
            last_explanation = f"No model forecast in RDS yet for {commodity_name}. Add forecasts to see predictions."

        avg_confidence = (
            sum(f["confidence"] for f in forecast_list) / len(forecast_list)
            if forecast_list
            else 0.0
        )

        return ApiResponse(
            success=True,
            data={
                "commodity_id": commodity_id,
                "commodity_name": commodity_name,
                "historical": historical_list,
                "forecast": forecast_list,
                "explanation": last_explanation,
                "accuracy": round(avg_confidence * 100, 1) if forecast_list else 0,
            },
        )
    except Exception as e:
        return ApiResponse(
            success=False,
            data={
                "commodity_id": commodity_id,
                "commodity_name": "Unknown",
                "historical": [],
                "forecast": [],
                "explanation": str(e),
                "accuracy": 0,
            },
            message=str(e),
        )
