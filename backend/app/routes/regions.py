"""
Regions API Routes
Provides endpoints for region/location data
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.response import ApiResponse
from app.models.region import Region

router = APIRouter()

@router.get("")
async def get_regions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all regions"""
    try:
        regions = db.query(Region).offset(skip).limit(limit).all()
        
        return ApiResponse(
            success=True,
            data=[{
                "id": r.id,
                "name": r.name,
                "state": r.state,
                "type": r.type
            } for r in regions]
        )
    except Exception as e:
        return ApiResponse(
            success=False,
            data=[],
            message=f"Error fetching regions: {str(e)}"
        )

@router.get("/{region_id}")
async def get_region(
    region_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get a specific region by ID"""
    try:
        region = db.query(Region).filter(Region.id == region_id).first()
        
        if not region:
            return ApiResponse(
                success=False,
                data=None,
                message=f"Region with ID {region_id} not found"
            )
        
        return ApiResponse(
            success=True,
            data={
                "id": region.id,
                "name": region.name,
                "state": region.state,
                "type": region.type
            }
        )
    except Exception as e:
        return ApiResponse(
            success=False,
            data=None,
            message=f"Error fetching region: {str(e)}"
        )
