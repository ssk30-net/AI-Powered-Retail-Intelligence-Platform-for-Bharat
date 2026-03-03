from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.response import ApiResponse
from app.services.insights_engine import insights_engine
from app.services.agentic_insights import generate_agentic_insights
from sqlalchemy.orm import Session

router = APIRouter()


class InsightsRequest(BaseModel):
    commodities: Optional[List[str]] = []


@router.post("/generate")
async def generate_insights(
    request: InsightsRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Generate insights from user-uploaded (or platform) data using agentic AI (Groq).
    Returns opportunities, risks, recommendations, and mitigation strategies.
    Falls back to sentiment-based insights if Groq is unavailable.
    """
    try:
        user_id = current_user.get("user_id")
        agentic = generate_agentic_insights(db, user_id) if user_id else None

        if agentic:
            print("[Insights] Using Groq agentic AI (user data)")
            return ApiResponse(
                success=True,
                data={
                    "opportunities": agentic.get("opportunities", []),
                    "risks": agentic.get("risks", []),
                    "recommendations": agentic.get("recommendations", []),
                    "mitigation_strategies": agentic.get("mitigation_strategies", []),
                    "data_source_note": agentic.get("data_source_note", ""),
                    "model": agentic.get("model", ""),
                },
                message="Agentic insights generated from your data",
            )
        # Fallback: existing sentiment-based engine
        print("[Insights] Using sentiment fallback (Groq not used or unavailable)")
        insights = insights_engine.generate_insights_overview()
        opportunities = insights.get("market_opportunities", [])
        risks = insights.get("market_risks", [])
        recommendations = insights.get("top_recommendations", [])

        # If sentiment returned nothing, add placeholder insights so the page is never empty
        use_placeholders = not opportunities and not risks and not recommendations
        if use_placeholders:
            opportunities = [
                {"title": "Upload data for AI insights", "description": "Upload your price data (CSV/XLSX/JSON) via Upload data, or set GROQ_API_KEY in backend .env to enable agentic insights from platform data.", "impact": "Medium", "commodity": "All"},
            ]
            risks = [
                {"title": "No data analyzed yet", "description": "Insights are generated from your uploaded data or platform seed data. Add GROQ_API_KEY for Groq-powered analysis, or upload data to get recommendations.", "severity": "Low", "commodity": "—"},
            ]
            recommendations = [
                {"action": "Setup", "commodity": "—", "confidence": 80, "reasoning": "Set GROQ_API_KEY in backend/.env (get key at console.groq.com) and restart the backend for AI-driven insights; or upload price data and refresh this page."},
            ]

        return ApiResponse(
            success=True,
            data={
                "opportunities": opportunities,
                "risks": risks,
                "recommendations": recommendations,
                "mitigation_strategies": [],
                "data_source_note": "No data yet — add GROQ_API_KEY or upload data" if use_placeholders else "Sentiment-based insights (add GROQ_API_KEY for data-driven insights)",
                "model": "rule-based",
            },
            message="Market insights generated successfully",
        )
    except Exception as e:
        print(f"Error generating insights: {e}")
        return ApiResponse(
            success=True,
            data={
                "opportunities": [],
                "risks": [],
                "recommendations": [],
                "mitigation_strategies": [],
            },
            message="Using fallback insights",
        )

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
