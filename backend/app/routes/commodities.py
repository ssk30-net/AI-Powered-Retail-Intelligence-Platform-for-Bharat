"""
Commodities API Routes
Provides endpoints for commodity data, prices, and related information
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.response import ApiResponse
from app.models.commodity import Commodity
from app.models.price_history import PriceHistory
from app.models.region import Region

router = APIRouter()

@router.get("")
async def get_commodities(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all commodities"""
    try:
        query = db.query(Commodity)
        
        if category:
            query = query.filter(Commodity.category == category)
        
        commodities = query.offset(skip).limit(limit).all()
        
        return ApiResponse(
            success=True,
            data=[{
                "id": c.id,
                "name": c.name,
                "category": c.category,
                "unit": c.unit,
                "description": c.description
            } for c in commodities]
        )
    except Exception as e:
        return ApiResponse(
            success=False,
            data=[],
            message=f"Error fetching commodities: {str(e)}"
        )

@router.get("/{commodity_id}")
async def get_commodity(
    commodity_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get a specific commodity by ID"""
    try:
        commodity = db.query(Commodity).filter(Commodity.id == commodity_id).first()
        
        if not commodity:
            return ApiResponse(
                success=False,
                data=None,
                message=f"Commodity with ID {commodity_id} not found"
            )
        
        return ApiResponse(
            success=True,
            data={
                "id": commodity.id,
                "name": commodity.name,
                "category": commodity.category,
                "unit": commodity.unit,
                "description": commodity.description
            }
        )
    except Exception as e:
        return ApiResponse(
            success=False,
            data=None,
            message=f"Error fetching commodity: {str(e)}"
        )

@router.get("/{commodity_id}/prices")
async def get_commodity_prices(
    commodity_id: int,
    limit: int = Query(100, ge=1, le=1000),
    region_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get price history for a specific commodity"""
    try:
        query = db.query(PriceHistory).filter(PriceHistory.commodity_id == commodity_id)
        
        if region_id:
            query = query.filter(PriceHistory.region_id == region_id)
        
        prices = query.order_by(PriceHistory.recorded_at.desc()).limit(limit).all()
        
        return ApiResponse(
            success=True,
            data=[{
                "id": p.id,
                "commodity_id": p.commodity_id,
                "region_id": p.region_id,
                "price": float(p.price),
                "volume": float(p.volume) if p.volume else None,
                "recorded_at": p.recorded_at.isoformat() if p.recorded_at else None,
                "source": p.source
            } for p in prices]
        )
    except Exception as e:
        return ApiResponse(
            success=False,
            data=[],
            message=f"Error fetching prices: {str(e)}"
        )
