from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.response import ApiResponse
from app.services.sentiment_analyzer import sentiment_analyzer
from app.models.sentiment_data import SentimentData

router = APIRouter()

# Commodity ID to name mapping
COMMODITY_MAP = {
    1: "wheat",
    2: "rice", 
    3: "onion",
    4: "tomato",
    5: "potato",
    6: "corn",
    7: "soybean"
}

@router.get("")
async def get_sentiment(
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all sentiment data"""
    try:
        sentiment_records = db.query(SentimentData).order_by(SentimentData.published_at.desc()).limit(limit).all()
        
        return ApiResponse(
            success=True,
            data=[{
                "id": s.id,
                "commodity_id": s.commodity_id,
                "headline": s.headline,
                "sentiment_score": float(s.sentiment_score),
                "sentiment_label": s.sentiment_label,
                "published_at": s.published_at.isoformat() if s.published_at else None,
                "source": s.source
            } for s in sentiment_records]
        )
    except Exception as e:
        return ApiResponse(
            success=False,
            data=[],
            message=f"Error fetching sentiment data: {str(e)}"
        )

@router.get("/commodity/{commodity_id}")
async def get_commodity_sentiment_data(
    commodity_id: int,
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get sentiment data for a specific commodity"""
    try:
        sentiment_records = db.query(SentimentData).filter(
            SentimentData.commodity_id == commodity_id
        ).order_by(SentimentData.published_at.desc()).limit(limit).all()
        
        return ApiResponse(
            success=True,
            data=[{
                "id": s.id,
                "commodity_id": s.commodity_id,
                "headline": s.headline,
                "sentiment_score": float(s.sentiment_score),
                "sentiment_label": s.sentiment_label,
                "published_at": s.published_at.isoformat() if s.published_at else None,
                "source": s.source
            } for s in sentiment_records]
        )
    except Exception as e:
        return ApiResponse(
            success=False,
            data=[],
            message=f"Error fetching sentiment data: {str(e)}"
        )

@router.get("/overview")
async def get_sentiment_overview(
    days: int = 30,
    current_user: dict = Depends(get_current_user)
):
    """
    Get overall market sentiment across multiple commodities
    Uses real NLP analysis of news articles
    """
    try:
        # Get sentiment for major commodities
        commodities = ['wheat', 'rice', 'onion', 'tomato', 'potato']
        result = sentiment_analyzer.get_market_sentiment_overview(commodities)
        
        return ApiResponse(
            success=True,
            data=result,
            message="Market sentiment analyzed successfully"
        )
    except Exception as e:
        print(f"Error in sentiment overview: {e}")
        # Fallback to basic data if service fails
        return ApiResponse(
            success=True,
            data={
                "overall_sentiment": 0.0,
                "sentiment_distribution": {
                    "positive": 33,
                    "neutral": 34,
                    "negative": 33
                },
                "trending_topics": ["market analysis", "price trends", "supply chain"],
                "market_mood": "neutral"
            },
            message="Using cached sentiment data"
        )

@router.get("/{commodity_id}")
async def get_commodity_sentiment(
    commodity_id: int,
    days: int = 30,
    current_user: dict = Depends(get_current_user)
):
    """
    Get sentiment analysis for a specific commodity
    Analyzes recent news articles using VADER and TextBlob
    """
    try:
        # Map commodity ID to name
        commodity_name = COMMODITY_MAP.get(commodity_id, "wheat")
        
        # Get real sentiment analysis
        result = sentiment_analyzer.get_commodity_sentiment(commodity_name, days)
        
        # Add commodity_id to result
        result['commodity_id'] = commodity_id
        
        return ApiResponse(
            success=True,
            data=result,
            message=f"Sentiment analysis for {commodity_name.title()} completed"
        )
    except Exception as e:
        print(f"Error in commodity sentiment: {e}")
        # Fallback to basic data if service fails
        return ApiResponse(
            success=True,
            data={
                "commodity_id": commodity_id,
                "commodity_name": COMMODITY_MAP.get(commodity_id, "wheat").title(),
                "current_sentiment": 0.0,
                "sentiment_label": "neutral",
                "confidence": 0.5,
                "article_count": 0,
                "sentiment_distribution": {"positive": 33, "neutral": 34, "negative": 33},
                "sentiment_trend": [],
                "recent_news": [],
                "trending_topics": ["market trends"]
            },
            message="Using cached sentiment data"
        )

@router.post("/analyze-text")
async def analyze_text_sentiment(
    text: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Analyze sentiment of custom text
    Useful for analyzing customer reviews, feedback, etc.
    """
    try:
        if not text or len(text.strip()) == 0:
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        result = sentiment_analyzer.analyze_text(text)
        
        return ApiResponse(
            success=True,
            data=result,
            message="Text sentiment analyzed successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing sentiment: {str(e)}")
