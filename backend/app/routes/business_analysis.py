"""
Business Analysis API: margin simulation and recommendations from user data.
Uses price_history (user or seed), price sensitivity, and cost/volume inputs.
"""
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.commodity import Commodity
from app.models.price_history import PriceHistory
from app.schemas.response import ApiResponse

router = APIRouter()


def _user_has_uploaded_data(db: Session, user_id: UUID) -> bool:
    return db.query(PriceHistory.id).filter(PriceHistory.user_id == user_id).limit(1).first() is not None


def _ph_filter(user_id: UUID, use_user_data: bool):
    if use_user_data:
        return PriceHistory.user_id == user_id
    return or_(
        PriceHistory.user_id.is_(None),
        PriceHistory.source.is_(None),
        PriceHistory.source != "user_upload",
    )


@router.get("/commodities")
async def get_commodities_for_analysis(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List commodities with latest price (and volume if present) from user/seed data for business analysis."""
    user_id = UUID(current_user["user_id"])
    use_user_data = _user_has_uploaded_data(db, user_id)
    ph_filter = _ph_filter(user_id, use_user_data)
    commodity_rows = (
        db.query(Commodity.id, Commodity.name)
        .join(PriceHistory, (PriceHistory.commodity_id == Commodity.id) & ph_filter)
        .distinct()
        .all()
    )
    result = []
    for cid, name in commodity_rows:
        ph = (
            db.query(PriceHistory)
            .filter(PriceHistory.commodity_id == cid, ph_filter)
            .order_by(desc(PriceHistory.recorded_at), desc(PriceHistory.id))
            .limit(1)
            .first()
        )
        if not ph:
            continue
        result.append({
            "id": cid,
            "name": name or "Commodity",
            "price": float(ph.price),
            "volume": float(ph.volume) if ph.volume is not None else None,
        })
    data_source = "your_uploaded_data" if use_user_data else "platform_data"
    if not result:
        result = [{"id": 0, "name": "No data — upload price data", "price": 0, "volume": None}]
    return ApiResponse(success=True, data={"commodities": result, "data_source": data_source})


class ProductInput(BaseModel):
    commodity_id: int
    name: str
    cost_per_unit: float
    price_per_unit: float
    volume: float = 100.0
    elasticity: float = -1.2


class SimulateRequest(BaseModel):
    products: List[ProductInput]


@router.post("/simulate")
async def simulate_margins(
    request: SimulateRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Simulate margins and profit from cost, price, volume. Optionally apply price change %
    and elasticity to estimate demand change. Returns per-product margin/profit and recommendations.
    """
    products = request.products or []
    if not products:
        return ApiResponse(success=True, data={"results": [], "recommendations": [], "summary": {}})
    results = []
    total_revenue = 0.0
    total_cost = 0.0
    total_profit = 0.0
    for p in products:
        cost = p.cost_per_unit
        price = p.price_per_unit
        vol = max(0, p.volume)
        rev = price * vol
        cst = cost * vol
        profit = rev - cst
        margin_pct = (float(price - cost) / price * 100) if price > 0 else 0
        total_revenue += rev
        total_cost += cst
        total_profit += profit
        results.append({
            "commodity_id": p.commodity_id,
            "name": p.name,
            "cost_per_unit": cost,
            "price_per_unit": price,
            "volume": vol,
            "revenue": round(rev, 2),
            "total_cost": round(cst, 2),
            "profit": round(profit, 2),
            "margin_percent": round(margin_pct, 1),
            "elasticity": p.elasticity,
        })
    recommendations = _build_recommendations(results, total_profit)
    summary = {
        "total_revenue": round(total_revenue, 2),
        "total_cost": round(total_cost, 2),
        "total_profit": round(total_profit, 2),
        "overall_margin_percent": round((total_profit / total_revenue * 100), 1) if total_revenue > 0 else 0,
    }
    return ApiResponse(
        success=True,
        data={"results": results, "recommendations": recommendations, "summary": summary},
    )


def _build_recommendations(results: list, total_profit: float) -> list:
    recs = []
    if not results:
        return recs
    sorted_by_margin = sorted(results, key=lambda x: x["margin_percent"], reverse=True)
    sorted_by_profit = sorted(results, key=lambda x: x["profit"], reverse=True)
    low_margin = [r for r in results if r["margin_percent"] < 15 and r["volume"] > 0]
    high_margin = [r for r in results if r["margin_percent"] >= 20]
    if len(sorted_by_margin) >= 2:
        a, b = sorted_by_margin[0], sorted_by_margin[1]
        recs.append({
            "type": "pair_commodities",
            "title": "Pair high-margin products",
            "description": f"Bundle or promote **{a['name']}** with **{b['name']}** to leverage strong margins ({a['margin_percent']}% and {b['margin_percent']}%) together.",
            "action": f"Pair {a['name']} and {b['name']}",
        })
    for r in low_margin[:2]:
        suggested_pct = min(15, max(2, (15 - r["margin_percent"])))
        recs.append({
            "type": "price_increase",
            "title": f"Increase {r['name']} price",
            "description": f"Current margin is {r['margin_percent']}%. Consider increasing price by **{suggested_pct}%** to improve margin (watch volume via price sensitivity).",
            "action": f"Increase {r['name']} price by ~{suggested_pct}%",
            "commodity": r["name"],
            "suggested_change_percent": suggested_pct,
        })
    if high_margin and len(high_margin) >= 1:
        top = high_margin[0]
        recs.append({
            "type": "volume_focus",
            "title": "Focus volume on high margin",
            "description": f"**{top['name']}** has {top['margin_percent']}% margin. Consider shifting volume or promotion to this product.",
            "action": f"Increase volume for {top['name']}",
        })
    if total_profit < 0 and results:
        recs.append({
            "type": "warning",
            "title": "Overall loss",
            "description": "Total profit is negative. Review cost vs price and volume; consider cost reduction or price increase on key products.",
            "action": "Review costs and pricing",
        })
    return recs[:8]
