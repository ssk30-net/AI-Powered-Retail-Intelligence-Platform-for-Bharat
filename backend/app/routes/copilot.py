from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, Dict
from app.core.security import get_current_user
from app.schemas.response import ApiResponse

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict] = None

@router.post("/chat")
async def chat_with_copilot(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user)
):
    # Mock AI response
    response_text = f"Based on current market analysis, {request.message.lower()}. The forecast shows a positive trend with 85% confidence."
    
    return ApiResponse(
        success=True,
        data={
            "response": response_text,
            "confidence": 0.85,
            "sources": ["forecast_model", "sentiment_analysis"],
            "follow_up_suggestions": [
                "Show me the detailed forecast",
                "What factors are influencing this?",
                "Compare with last month"
            ]
        }
    )

@router.get("/history")
async def get_conversation_history(
    limit: int = 20,
    current_user: dict = Depends(get_current_user)
):
    return ApiResponse(
        success=True,
        data={
            "conversations": []
        }
    )
