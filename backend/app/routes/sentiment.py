from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.schemas.response import ApiResponse

router = APIRouter()

@router.get("/overview")
async def get_sentiment_overview(
    days: int = 30,
    current_user: dict = Depends(get_current_user)
):
    return ApiResponse(
        success=True,
        data={
            "overall_sentiment": 0.45,
            "sentiment_distribution": {
                "positive": 55,
                "neutral": 30,
                "negative": 15
            },
            "trending_topics": ["supply chain", "harvest season", "export demand"]
        }
    )

@router.get("/{commodity_id}")
async def get_commodity_sentiment(
    commodity_id: int,
    days: int = 30,
    current_user: dict = Depends(get_current_user)
):
    return ApiResponse(
        success=True,
        data={
            "commodity_id": commodity_id,
            "commodity_name": "Wheat",
            "current_sentiment": 0.65,
            "sentiment_trend": [
                {"date": "2026-02-01", "score": 0.5},
                {"date": "2026-02-15", "score": 0.6},
                {"date": "2026-02-26", "score": 0.65}
            ],
            "recent_news": [
                {
                    "title": "Wheat prices expected to rise due to strong export demand",
                    "sentiment": 0.8,
                    "source": "Economic Times",
                    "published_at": "2026-02-25T08:00:00Z"
                }
            ]
        }
    )
