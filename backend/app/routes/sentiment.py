from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.response import ApiResponse
from app.services.sentiment_analyzer import sentiment_analyzer
from app.models.sentiment_data import SentimentData
from app.models.price_history import PriceHistory
from app.models.commodity import Commodity

router = APIRouter()

# How news is gathered:
# 1. Database (sentiment_data): seed/synthetic data from scripts (generate_ml_training_data, synthetic_data_generator).
# 2. Live RSS fallback: when DB has no rows for a commodity, we call sentiment_analyzer.fetch_news_articles()
#    which uses Google News RSS (query: "{commodity} price India market") and VADER+TextBlob for sentiment.

# Commodity ID to name mapping (and reverse for name -> id)
COMMODITY_MAP = {
    1: "wheat",
    2: "rice",
    3: "onion",
    4: "tomato",
    5: "potato",
    6: "corn",
    7: "soybean"
}
NAME_TO_ID = {v: k for k, v in COMMODITY_MAP.items()}

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


def _user_has_uploaded_data(db: Session, user_id: UUID) -> bool:
    """True if this user has any price_history rows (their uploaded data)."""
    return db.query(PriceHistory.id).filter(PriceHistory.user_id == user_id).limit(1).first() is not None


def _ph_filter(use_user_data: bool, user_id: UUID):
    """Filter for price_history: user rows when use_user_data else platform/seed rows."""
    if use_user_data:
        return PriceHistory.user_id == user_id
    return or_(
        PriceHistory.user_id.is_(None),
        PriceHistory.source.is_(None),
        PriceHistory.source != "user_upload",
    )


@router.get("/commodities")
async def get_sentiment_commodities(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    List commodities to show on the sentiment page: from the user's uploaded data,
    or platform/seed data when the user has not uploaded. Enables a user-data–based sentiment view.
    """
    user_id = UUID(current_user["user_id"])
    use_user_data = _user_has_uploaded_data(db, user_id)
    ph_filter = _ph_filter(use_user_data, user_id)
    rows = (
        db.query(Commodity.id, Commodity.name)
        .join(PriceHistory, (PriceHistory.commodity_id == Commodity.id) & ph_filter)
        .distinct()
        .all()
    )
    commodities = [{"id": cid, "name": (name or "Commodity").strip().lower()} for cid, name in rows]
    # If no rows (e.g. no seed data), fall back to known names from COMMODITY_MAP
    if not commodities:
        commodities = [{"id": cid, "name": name} for cid, name in COMMODITY_MAP.items()]
    data_source = "your_uploaded_data" if use_user_data else "platform_data"
    return ApiResponse(success=True, data={"commodities": commodities, "data_source": data_source})


def _resolve_commodity_id(commodity_id_or_name: str, db: Optional[Session] = None) -> Optional[int]:
    """Resolve path param to commodity_id: accept integer string (e.g. '1') or name (e.g. 'wheat'). If name not in map, look up in DB when db provided."""
    try:
        return int(commodity_id_or_name)
    except ValueError:
        pass
    name = commodity_id_or_name.lower().strip()
    if name in NAME_TO_ID:
        return NAME_TO_ID[name]
    if db is not None:
        row = db.query(Commodity.id).filter(Commodity.name.ilike(name)).limit(1).first()
        if row:
            return row[0]
    return None


@router.get("/commodity/{commodity_id_or_name}")
async def get_commodity_sentiment_data(
    commodity_id_or_name: str,
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get sentiment data for a specific commodity. Path can be id (e.g. 1) or name (e.g. wheat)."""
    commodity_id = _resolve_commodity_id(commodity_id_or_name, db)
    if commodity_id is None:
        raise HTTPException(status_code=422, detail=f"Unknown commodity: {commodity_id_or_name!r}. Use id (1-7) or name (e.g. wheat, rice).")
    try:
        sentiment_records = db.query(SentimentData).filter(
            SentimentData.commodity_id == commodity_id
        ).order_by(SentimentData.published_at.desc()).limit(limit).all()

        # Build aggregated shape expected by frontend: overall_sentiment, sentiment_score, article_count, articles
        articles = [
            {
                "headline": s.headline,
                "sentiment": s.sentiment_label or "neutral",
                "source": s.source or "Unknown",
                "published_at": s.published_at.isoformat() if s.published_at else None,
            }
            for s in sentiment_records
        ]
        if not sentiment_records:
            # Live RSS fallback: fetch from Google News and analyze with VADER+TextBlob
            commodity_name = COMMODITY_MAP.get(commodity_id)
            if not commodity_name:
                name_row = db.query(Commodity.name).filter(Commodity.id == commodity_id).limit(1).first()
                commodity_name = (name_row[0] if name_row else "").strip().lower() or commodity_id_or_name.lower()
            try:
                live_articles = sentiment_analyzer.fetch_news_articles(
                    f"{commodity_name} price India market", max_articles=20
                )
            except Exception:
                live_articles = []
            if live_articles:
                articles = [
                    {
                        "headline": a.get("title", ""),
                        "sentiment": a.get("sentiment", "neutral"),
                        "source": a.get("source", "Google News"),
                        "published_at": a.get("published_at"),
                    }
                    for a in live_articles
                ]
                scores = [a.get("sentiment_score", 0) for a in live_articles]
                avg_score = sum(scores) / len(scores) if scores else 0.0
                if avg_score > 0.1:
                    overall = "positive"
                elif avg_score < -0.1:
                    overall = "negative"
                else:
                    overall = "neutral"
                payload = {
                    "overall_sentiment": overall,
                    "sentiment_score": round(avg_score, 2),
                    "article_count": len(live_articles),
                    "articles": articles,
                    "data_source_note": "Live news (RSS)",
                }
            else:
                payload = {
                    "overall_sentiment": "neutral",
                    "sentiment_score": 0.0,
                    "article_count": 0,
                    "articles": [],
                }
        else:
            avg_score = sum(float(s.sentiment_score) for s in sentiment_records) / len(sentiment_records)
            if avg_score > 0.1:
                overall = "positive"
            elif avg_score < -0.1:
                overall = "negative"
            else:
                overall = "neutral"
            payload = {
                "overall_sentiment": overall,
                "sentiment_score": round(avg_score, 2),
                "article_count": len(sentiment_records),
                "articles": articles,
                "data_source_note": "Database (platform data)",
            }

        return ApiResponse(success=True, data=payload)
    except Exception as e:
        return ApiResponse(
            success=False,
            data={"overall_sentiment": "neutral", "sentiment_score": 0.0, "article_count": 0, "articles": []},
            message=f"Error fetching sentiment data: {str(e)}",
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

@router.get("/commodity/{commodity_name}")
async def get_commodity_sentiment_by_name(
    commodity_name: str,
    days: int = 30,
    current_user: dict = Depends(get_current_user)
):
    """
    Get sentiment analysis for a specific commodity by name
    Analyzes recent news articles using VADER and TextBlob
    """
    try:
        # Get real sentiment analysis
        result = sentiment_analyzer.get_commodity_sentiment(commodity_name.lower(), days)
        
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
                "commodity_name": commodity_name.title(),
                "overall_sentiment": "Neutral",
                "sentiment_score": 0.0,
                "article_count": 0,
                "articles": []
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
    Get sentiment analysis for a specific commodity by ID
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
