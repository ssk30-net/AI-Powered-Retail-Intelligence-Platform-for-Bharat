from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, Dict
from app.core.security import get_current_user
from app.schemas.response import ApiResponse
from app.services.ai_copilot import ai_copilot

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict] = None

@router.post("/chat")
async def chat_with_copilot(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Chat with AI Copilot
    Uses OpenAI GPT if API key is configured, otherwise uses rule-based intelligence
    """
    try:
        user_id = current_user.get('user_id', 'anonymous')
        response = ai_copilot.chat(
            message=request.message,
            user_id=user_id,
            context=request.context
        )
        if not isinstance(response.get("response"), str):
            response["response"] = str(response.get("response") or "I'm here to help. Ask about prices, sentiment, or trends.")
        return ApiResponse(
            success=True,
            data=response,
            message="AI response generated successfully"
        )
    except Exception as e:
        print(f"Error in copilot chat: {e}")
        return ApiResponse(
            success=True,
            data={
                "response": "I'm here to help with market intelligence queries. Could you please rephrase your question?",
                "confidence": 0.5,
                "sources": ["fallback"],
                "follow_up_suggestions": [
                    "Show me wheat price forecast",
                    "What's the market sentiment?",
                    "Analyze demand trends"
                ],
                "model": "fallback"
            }
        )

@router.get("/history")
async def get_conversation_history(
    limit: int = 20,
    current_user: dict = Depends(get_current_user)
):
    """
    Get conversation history for the current user
    """
    try:
        user_id = current_user.get('user_id', 'anonymous')
        history = ai_copilot.get_conversation_history(user_id, limit)
        
        return ApiResponse(
            success=True,
            data={
                "conversations": history,
                "total": len(history)
            }
        )
    except Exception as e:
        return ApiResponse(
            success=True,
            data={"conversations": [], "total": 0}
        )

@router.delete("/history")
async def clear_conversation_history(
    current_user: dict = Depends(get_current_user)
):
    """
    Clear conversation history for the current user
    """
    try:
        user_id = current_user.get('user_id', 'anonymous')
        success = ai_copilot.clear_conversation(user_id)
        
        return ApiResponse(
            success=success,
            message="Conversation history cleared successfully" if success else "No history found"
        )
    except Exception as e:
        return ApiResponse(
            success=False,
            message=f"Error clearing history: {str(e)}"
        )
