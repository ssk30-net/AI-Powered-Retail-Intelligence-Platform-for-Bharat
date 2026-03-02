from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
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


@router.get("/data-availability")
async def get_data_availability(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List which commodities have price_history and forecasts in RDS."""
    try:
        # Lightweight distinct lists to keep dropdown loading fast.
        with_ph = (
            db.query(Commodity.id, Commodity.name)
            .join(PriceHistory, PriceHistory.commodity_id == Commodity.id)
            .distinct()
            .order_by(Commodity.name)
            .all()
        )
        with_price_history = [
            {"commodity_id": row[0], "name": row[1], "price_history_count": None}
            for row in with_ph
        ]

        with_fc = (
            db.query(Commodity.id, Commodity.name)
            .join(Forecast, Forecast.commodity_id == Commodity.id)
            .distinct()
            .order_by(Commodity.name)
            .all()
        )
        with_forecasts = [
            {"commodity_id": row[0], "name": row[1], "forecast_count": None}
            for row in with_fc
        ]

        return ApiResponse(
            success=True,
            data={
                "with_price_history": with_price_history,
                "with_forecasts": with_forecasts,
            },
        )
    except Exception as e:
        return ApiResponse(
            success=False,
            data={"with_price_history": [], "with_forecasts": []},
            message=str(e),
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
    region_id: int | None = Query(None),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Historical prices + forecast from RDS for a commodity (model output)."""
    try:
        comm = db.query(Commodity).filter(Commodity.id == commodity_id).first()
        commodity_name = comm.name if comm else f"Commodity {commodity_id}"

        max_history_days = min(max(horizon * 2, 30), 120)
        since = datetime.utcnow() - timedelta(days=max_history_days)
        history_day = func.date(PriceHistory.recorded_at)
        historical_query = db.query(
            history_day.label("day"),
            func.avg(PriceHistory.price).label("avg_price"),
        ).filter(
            PriceHistory.commodity_id == commodity_id,
            PriceHistory.recorded_at >= since,
        )
        if region_id is not None:
            historical_query = historical_query.filter(PriceHistory.region_id == region_id)
        historical = (
            historical_query
            .group_by(history_day)
            .order_by(history_day.desc())
            .limit(max_history_days)
            .all()
        )
        historical = list(reversed(historical))
        historical_list = [
            {"date": r.day.strftime("%Y-%m-%d") if r.day else None, "price": float(r.avg_price)}
            for r in historical
        ]

        forecast_query = db.query(
            Forecast.forecast_date.label("day"),
            func.avg(Forecast.predicted_price).label("predicted_price"),
            func.avg(Forecast.lower_bound).label("lower_bound"),
            func.avg(Forecast.upper_bound).label("upper_bound"),
            func.avg(Forecast.confidence_score).label("confidence_score"),
        ).filter(
            Forecast.commodity_id == commodity_id,
            Forecast.forecast_date >= datetime.utcnow().date(),
        )
        if region_id is not None:
            forecast_query = forecast_query.filter(Forecast.region_id == region_id)
        forecast_rows = (
            forecast_query
            .group_by(Forecast.forecast_date)
            .order_by(Forecast.forecast_date)
            .limit(horizon)
            .all()
        )
        forecast_list = [
            {
                "date": f.day.strftime("%Y-%m-%d") if f.day else None,
                "predicted_price": float(f.predicted_price),
                "lower_bound": float(f.lower_bound) if f.lower_bound is not None else float(f.predicted_price) * 0.98,
                "upper_bound": float(f.upper_bound) if f.upper_bound is not None else float(f.predicted_price) * 1.02,
                "confidence": float(f.confidence_score) if f.confidence_score is not None else 0.85,
            }
            for f in forecast_rows
        ]

        latest_explanation_row = db.query(Forecast.explanation).filter(
            Forecast.commodity_id == commodity_id,
            Forecast.forecast_date >= datetime.utcnow().date(),
        )
        if region_id is not None:
            latest_explanation_row = latest_explanation_row.filter(Forecast.region_id == region_id)
        latest_explanation_row = latest_explanation_row.order_by(desc(Forecast.forecast_date)).limit(1).first()

        if forecast_rows:
            last_explanation = (latest_explanation_row[0] if latest_explanation_row else None) or (
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
