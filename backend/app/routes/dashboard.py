from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta

# Number of days to compute price variation for "most varied" chart commodity
CHART_VARIATION_DAYS = 21
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.response import ApiResponse
from app.models.commodity import Commodity
from app.models.price_history import PriceHistory
from app.models.forecast import Forecast

router = APIRouter()


@router.get("/overview")
async def get_dashboard_overview(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Dashboard overview from RDS: KPIs, top commodities, recent alerts."""
    try:
        # Defaults when no data
        kpis = {
            "price_change_percent": 0.0,
            "demand_index": 0,
            "sentiment_score": 0.0,
            "risk_level": "low",
        }
        top_commodities = []
        top_gainers = []
        top_losers = []
        recent_alerts = []

        # Build one latest row per commodity explicitly to avoid duplicate-region skew.
        commodity_rows = (
            db.query(Commodity.id, Commodity.name)
            .join(PriceHistory, PriceHistory.commodity_id == Commodity.id)
            .distinct()
            .all()
        )
        if commodity_rows:
            top_commodities = []
            for commodity_id, commodity_name in commodity_rows:
                ph = (
                    db.query(PriceHistory)
                    .filter(PriceHistory.commodity_id == commodity_id)
                    .order_by(desc(PriceHistory.recorded_at), desc(PriceHistory.id))
                    .limit(1)
                    .first()
                )
                if not ph:
                    continue
                prev = (
                    db.query(PriceHistory.price)
                    .filter(
                        PriceHistory.commodity_id == commodity_id,
                        PriceHistory.recorded_at < ph.recorded_at,
                    )
                    .order_by(desc(PriceHistory.recorded_at), desc(PriceHistory.id))
                    .limit(1)
                    .first()
                )
                change = 0.0
                if prev and float(prev.price) != 0:
                    change = ((float(ph.price) - float(prev.price)) / float(prev.price)) * 100
                top_commodities.append({
                    "id": commodity_id,
                    "name": commodity_name or "Commodity",
                    "price": float(ph.price),
                    "change": round(change, 1),
                })
            top_commodities = sorted(top_commodities, key=lambda x: x["price"], reverse=True)
            if top_commodities:
                avg_change = sum(c["change"] for c in top_commodities) / len(top_commodities)
                kpis["price_change_percent"] = round(avg_change, 1)
                kpis["demand_index"] = min(100, max(0, 50 + int(avg_change * 2)))
                kpis["sentiment_score"] = round(0.5 + (avg_change / 100), 2)
                kpis["risk_level"] = "high" if abs(avg_change) > 10 else "medium" if abs(avg_change) > 5 else "low"
                top_gainers = sorted(top_commodities, key=lambda x: x["change"], reverse=True)[:3]
                top_losers = sorted(top_commodities, key=lambda x: x["change"])[:3]

        # Prefer Wheat for the dashboard price chart; else commodity with most price variation
        chart_commodity_id = None
        try:
            wheat = db.query(Commodity.id).filter(func.lower(Commodity.name) == "wheat").first()
            if wheat and any(c["id"] == wheat[0] for c in top_commodities):
                chart_commodity_id = wheat[0]
            if chart_commodity_id is None:
                since = datetime.utcnow() - timedelta(days=CHART_VARIATION_DAYS)
                row = (
                    db.query(PriceHistory.commodity_id)
                    .filter(PriceHistory.recorded_at >= since)
                    .group_by(PriceHistory.commodity_id)
                    .having(func.count(PriceHistory.id) >= 2)
                    .order_by(desc(func.stddev_samp(PriceHistory.price)))
                    .first()
                )
                if row:
                    chart_commodity_id = row[0]
        except Exception:
            pass

        return ApiResponse(
            success=True,
            data={
                "kpis": kpis,
                "top_commodities": top_commodities[:5],
                "top_gainers": top_gainers,
                "top_losers": top_losers,
                "recent_alerts": recent_alerts,
                "chart_commodity_id": chart_commodity_id,
            },
        )
    except Exception as e:
        return ApiResponse(
            success=True,
            data={
                "kpis": {
                    "price_change_percent": 0.0,
                    "demand_index": 0,
                    "sentiment_score": 0.0,
                    "risk_level": "low",
                },
                "top_commodities": [],
                "top_gainers": [],
                "top_losers": [],
                "recent_alerts": [],
                "chart_commodity_id": None,
            },
            message=f"Using defaults: {str(e)}",
        )


@router.get("/kpis")
async def get_kpis(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """KPIs from RDS (price change, demand index, sentiment, risk)."""
    try:
        subq = (
            db.query(
                PriceHistory.commodity_id,
                func.max(PriceHistory.recorded_at).label("max_at"),
            )
            .group_by(PriceHistory.commodity_id)
        )
        latest = (
            db.query(PriceHistory)
            .join(subq, (PriceHistory.commodity_id == subq.c.commodity_id) & (PriceHistory.recorded_at == subq.c.max_at))
            .all()
        )
        if not latest:
            return ApiResponse(
                success=True,
                data={
                    "price_change_percent": 0.0,
                    "demand_index": 0,
                    "sentiment_score": 0.0,
                    "risk_level": "low",
                },
            )
        changes = []
        for ph in latest:
            prev = (
                db.query(PriceHistory.price)
                .filter(
                    PriceHistory.commodity_id == ph.commodity_id,
                    PriceHistory.recorded_at < ph.recorded_at,
                )
                .order_by(desc(PriceHistory.recorded_at))
                .limit(1)
                .first()
            )
            if prev and float(prev.price) != 0:
                changes.append((float(ph.price) - float(prev.price)) / float(prev.price) * 100)
        avg_change = sum(changes) / len(changes) if changes else 0.0
        return ApiResponse(
            success=True,
            data={
                "price_change_percent": round(avg_change, 1),
                "demand_index": min(100, max(0, 50 + int(avg_change * 2))),
                "sentiment_score": round(0.5 + (avg_change / 100), 2),
                "risk_level": "high" if abs(avg_change) > 10 else "medium" if abs(avg_change) > 5 else "low",
            },
        )
    except Exception:
        return ApiResponse(
            success=True,
            data={
                "price_change_percent": 0.0,
                "demand_index": 0,
                "sentiment_score": 0.0,
                "risk_level": "low",
            },
        )


@router.get("/price-trends")
async def get_price_trends(
    commodity_ids: str = Query("1,2,3"),
    days: int = Query(30, ge=1, le=365),
    future_days: int = Query(2, ge=0, le=14),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Price trends from RDS: last N days by date + optional future days from forecasts (date granularity)."""
    try:
        ids = [int(x.strip()) for x in commodity_ids.split(",") if x.strip()]
        since = datetime.utcnow() - timedelta(days=days)
        today = datetime.utcnow().date()
        trends = []
        for cid in ids[:10]:
            comm = db.query(Commodity).filter(Commodity.id == cid).first()
            name = comm.name if comm else f"Commodity {cid}"
            day = func.date(PriceHistory.recorded_at)
            rows = (
                db.query(
                    day.label("day"),
                    func.avg(PriceHistory.price).label("avg_price"),
                )
                .filter(
                    PriceHistory.commodity_id == cid,
                    PriceHistory.recorded_at >= since,
                )
                .group_by(day)
                .order_by(day)
                .limit(days)
                .all()
            )
            data_points = [
                {"date": r.day.strftime("%Y-%m-%d") if r.day else None, "price": float(r.avg_price)}
                for r in rows
            ]
            if future_days > 0:
                future_rows = (
                    db.query(
                        Forecast.forecast_date.label("day"),
                        func.avg(Forecast.predicted_price).label("avg_price"),
                    )
                    .filter(
                        Forecast.commodity_id == cid,
                        Forecast.forecast_date >= today,
                    )
                    .group_by(Forecast.forecast_date)
                    .order_by(Forecast.forecast_date)
                    .limit(future_days)
                    .all()
                )
                for r in future_rows:
                    if r.day:
                        data_points.append({
                            "date": r.day.strftime("%Y-%m-%d"),
                            "price": float(r.avg_price),
                        })
            trends.append({
                "commodity_id": cid,
                "commodity_name": name,
                "data_points": data_points,
            })
        return ApiResponse(success=True, data={"trends": trends})
    except Exception as e:
        return ApiResponse(success=True, data={"trends": []}, message=str(e))
