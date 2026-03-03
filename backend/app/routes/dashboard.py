from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, or_
from datetime import datetime, timedelta
from uuid import UUID

# Number of days to compute price variation for "most varied" chart commodity
CHART_VARIATION_DAYS = 21
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.response import ApiResponse
from app.models.commodity import Commodity
from app.models.price_history import PriceHistory
from app.models.forecast import Forecast

router = APIRouter()


def _user_has_uploaded_data(db: Session, user_id: UUID) -> bool:
    """Return True if this user has any price_history rows (their uploaded data)."""
    return db.query(PriceHistory.id).filter(PriceHistory.user_id == user_id).limit(1).first() is not None


def _price_history_filter(PriceHistory, user_id: UUID, use_user_data: bool):
    """
    When use_user_data: only rows uploaded by this user (user_id match).
    Otherwise: RDS/training data — rows not from user upload (user_id IS NULL or source != 'user_upload').
    This ensures users who haven't uploaded see the same data used for model training (e.g. AGMARKNET, SYNTHETIC).
    """
    if use_user_data:
        return PriceHistory.user_id == user_id
    return or_(
        PriceHistory.user_id.is_(None),
        PriceHistory.source.is_(None),
        PriceHistory.source != "user_upload",
    )


@router.get("/overview")
async def get_dashboard_overview(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Dashboard overview from RDS: KPIs, top commodities, recent alerts. Uses user's uploaded data when present, else seed data."""
    try:
        user_id = UUID(current_user["user_id"])
        use_user_data = _user_has_uploaded_data(db, user_id)
        ph_filter = _price_history_filter(PriceHistory, user_id, use_user_data)

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

        # Build one latest row per commodity (filtered by user's data or seed).
        commodity_rows = (
            db.query(Commodity.id, Commodity.name)
            .join(PriceHistory, (PriceHistory.commodity_id == Commodity.id) & ph_filter)
            .distinct()
            .all()
        )
        if commodity_rows:
            top_commodities = []
            for commodity_id, commodity_name in commodity_rows:
                ph = (
                    db.query(PriceHistory)
                    .filter(PriceHistory.commodity_id == commodity_id, ph_filter)
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
                        ph_filter,
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
                    .filter(PriceHistory.recorded_at >= since, ph_filter)
                    .group_by(PriceHistory.commodity_id)
                    .having(func.count(PriceHistory.id) >= 2)
                    .order_by(desc(func.stddev_samp(PriceHistory.price)))
                    .first()
                )
                if row:
                    chart_commodity_id = row[0]
        except Exception:
            pass

        data_source = "your_uploaded_data" if use_user_data else "rds_seed"

        return ApiResponse(
            success=True,
            data={
                "kpis": kpis,
                "top_commodities": top_commodities[:5],
                "top_gainers": top_gainers,
                "top_losers": top_losers,
                "recent_alerts": recent_alerts,
                "chart_commodity_id": chart_commodity_id,
                "data_source": data_source,
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
                "data_source": "rds_seed",
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
    """Price trends from RDS: last N days by date + optional future days from forecasts. Uses user's data when present."""
    try:
        user_id = UUID(current_user["user_id"])
        use_user_data = _user_has_uploaded_data(db, user_id)
        ph_filter = _price_history_filter(PriceHistory, user_id, use_user_data)

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
                    ph_filter,
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
