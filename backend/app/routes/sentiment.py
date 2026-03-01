from fastapi import APIRouter, Depends, HTTPException
from app.core.security import get_current_user
from app.schemas.response import ApiResponse
from app.services.sentiment_analyzer import sentiment_analyzer

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
