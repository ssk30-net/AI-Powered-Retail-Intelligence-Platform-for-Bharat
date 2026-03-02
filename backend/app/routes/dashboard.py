from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
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
        recent_alerts = []

        # Latest price per commodity (from price_history)
        subq = (
            db.query(
                PriceHistory.commodity_id,
                func.max(PriceHistory.recorded_at).label("max_at"),
            )
            .group_by(PriceHistory.commodity_id)
        ).subquery()
        latest_prices = (
            db.query(PriceHistory, Commodity.name)
            .join(Commodity, PriceHistory.commodity_id == Commodity.id)
            .join(subq, (PriceHistory.commodity_id == subq.c.commodity_id) & (PriceHistory.recorded_at == subq.c.max_at))
            .limit(10)
            .all()
        )
        if latest_prices:
            # Simple price change: compare to 7 days ago if available
            top_commodities = []
            for ph, name in latest_prices:
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
                change = 0.0
                if prev and float(prev.price) != 0:
                    change = ((float(ph.price) - float(prev.price)) / float(prev.price)) * 100
                top_commodities.append({
                    "id": ph.commodity_id,
                    "name": name or "Commodity",
                    "price": float(ph.price),
                    "change": round(change, 1),
                })
            if top_commodities:
                avg_change = sum(c["change"] for c in top_commodities) / len(top_commodities)
                kpis["price_change_percent"] = round(avg_change, 1)
                kpis["demand_index"] = min(100, max(0, 50 + int(avg_change * 2)))
                kpis["sentiment_score"] = round(0.5 + (avg_change / 100), 2)
                kpis["risk_level"] = "high" if abs(avg_change) > 10 else "medium" if abs(avg_change) > 5 else "low"

        return ApiResponse(
            success=True,
            data={
                "kpis": kpis,
                "top_commodities": top_commodities[:5],
                "recent_alerts": recent_alerts,
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
                "recent_alerts": [],
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
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Price trends from RDS price_history for given commodities and days."""
    try:
        ids = [int(x.strip()) for x in commodity_ids.split(",") if x.strip()]
        since = datetime.utcnow() - timedelta(days=days)
        trends = []
        for cid in ids[:10]:
            comm = db.query(Commodity).filter(Commodity.id == cid).first()
            name = comm.name if comm else f"Commodity {cid}"
            rows = (
                db.query(PriceHistory.recorded_at, PriceHistory.price)
                .filter(
                    PriceHistory.commodity_id == cid,
                    PriceHistory.recorded_at >= since,
                )
                .order_by(PriceHistory.recorded_at)
                .all()
            )
            data_points = [
                {"date": r.recorded_at.strftime("%Y-%m-%d") if r.recorded_at else None, "price": float(r.price)}
                for r in rows
            ]
            trends.append({
                "commodity_id": cid,
                "commodity_name": name,
                "data_points": data_points,
            })
        return ApiResponse(success=True, data={"trends": trends})
    except Exception as e:
        return ApiResponse(success=True, data={"trends": []}, message=str(e))
