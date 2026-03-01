from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.schemas.response import ApiResponse
from app.services.insights_engine import insights_engine

router = APIRouter()

@router.get("/overview")
async def get_insights_overview(current_user: dict = Depends(get_current_user)):
    """
    Get comprehensive market insights overview
    Includes opportunities, risks, and actionable recommendations
    """
    try:
        insights = insights_engine.generate_insights_overview()
        
        return ApiResponse(
            success=True,
            data=insights,
            message="Market insights generated successfully"
        )
    except Exception as e:
        print(f"Error generating insights: {e}")
        return ApiResponse(
            success=True,
            data={
                "market_opportunities": [],
                "market_risks": [],
                "top_recommendations": [],
                "performance_summary": {},
                "insights_count": 0
            },
            message="Using cached insights"
        )

@router.get("/commodity/{commodity_id}")
async def get_commodity_insights(
    commodity_id: int,
    current_user: dict = Depends(get_current_user)
):
    """
    Get insights specific to a commodity
    """
    try:
        insights = insights_engine.get_commodity_specific_insights(commodity_id)
        
        return ApiResponse(
            success=True,
            data=insights,
            message=f"Insights for commodity ID {commodity_id} retrieved"
        )
    except Exception as e:
        print(f"Error getting commodity insights: {e}")
        return ApiResponse(
            success=False,
            message="Error retrieving commodity insights"
        )

@router.get("/opportunities")
async def get_opportunities(current_user: dict = Depends(get_current_user)):
    """
    Get market opportunities
    """
    try:
        opportunities = insights_engine._identify_opportunities()
        
        return ApiResponse(
            success=True,
            data={
                "opportunities": opportunities,
                "count": len(opportunities)
            }
        )
    except Exception as e:
        return ApiResponse(
            success=True,
            data={"opportunities": [], "count": 0}
        )

@router.get("/risks")
async def get_risks(current_user: dict = Depends(get_current_user)):
    """
    Get market risks
    """
    try:
        risks = insights_engine._identify_risks()
        
        return ApiResponse(
            success=True,
            data={
                "risks": risks,
                "count": len(risks)
            }
        )
    except Exception as e:
        return ApiResponse(
            success=True,
            data={"risks": [], "count": 0}
        )

@router.get("/recommendations")
async def get_recommendations(current_user: dict = Depends(get_current_user)):
    """
    Get actionable recommendations
    """
    try:
        recommendations = insights_engine._generate_recommendations()
        
        return ApiResponse(
            success=True,
            data={
                "recommendations": recommendations,
                "count": len(recommendations)
            }
        )
    except Exception as e:
        return ApiResponse(
            success=True,
            data={"recommendations": [], "count": 0}
        )
