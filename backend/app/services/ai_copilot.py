"""
AI Copilot Service
Uses Groq (free tier) when GROQ_API_KEY is set; else Gemini; else OpenAI; else rule-based.
Groq is preferred to avoid Gemini free-tier quota limits (429).
"""
from typing import Dict, List, Optional
from datetime import datetime
import json

from app.core.config import settings

# Optional: Groq (free tier, good for avoiding quota issues)
try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False

# Optional: Google Generative AI (Gemini) — free tier has strict rate limits
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

# Optional: OpenAI (legacy)
try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

GROQ_COPILOT_MODEL = "llama-3.1-8b-instant"


class AICopilot:
    def __init__(self):
        self.conversation_history: Dict[str, list] = {}
        self._gemini_model = None
        self._gemini_model_name = None
        self._openai_client = None
        self._groq_client = None

        # 1) Prefer Groq when set (free tier, no quota issues like Gemini)
        if getattr(settings, "GROQ_API_KEY", None) and settings.GROQ_API_KEY and GROQ_AVAILABLE:
            try:
                self._groq_client = Groq(api_key=settings.GROQ_API_KEY)
                self._use_groq = True
                print("AI Copilot: using Groq (GROQ_API_KEY)")
            except Exception as e:
                print(f"Groq init failed: {e}")
                self._use_groq = False
        else:
            self._use_groq = False
            if not GROQ_AVAILABLE:
                pass  # groq optional

        # 2) Gemini (free tier has rate limits — 429 when exceeded)
        self._use_gemini = False
        if not self._use_groq and getattr(settings, "GEMINI_API_KEY", None) and settings.GEMINI_API_KEY and GEMINI_AVAILABLE:
            try:
                genai.configure(api_key=settings.GEMINI_API_KEY)
                self._gemini_model_name = "gemini-2.0-flash"
                self._gemini_model = genai.GenerativeModel(self._gemini_model_name)
                self._use_gemini = True
                print("AI Copilot: using Gemini (GEMINI_API_KEY)")
            except Exception as e:
                print(f"Gemini init failed: {e}, using fallback")
                self._gemini_model = None
            if not GEMINI_AVAILABLE:
                print("google-generativeai not installed. Install: pip install google-generativeai")

        # 3) OpenAI
        if not self._use_groq and not self._use_gemini and getattr(settings, "OPENAI_API_KEY", None) and settings.OPENAI_API_KEY and OPENAI_AVAILABLE:
            self._openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)
            self._use_openai = True
        else:
            self._use_openai = False

        self.market_context = {
            "commodities": ["wheat", "rice", "onion", "tomato", "potato", "corn", "soybean", "cabbage", "brinjal", "banana", "cucumber", "green chilli"],
            "metrics": ["price", "demand", "supply", "sentiment", "forecast", "trend"],
            "regions": ["north", "south", "east", "west", "central", "punjab", "maharashtra", "karnataka"],
        }

    def chat(self, message: str, user_id: str, context: Optional[Dict] = None) -> Dict:
        if user_id not in self.conversation_history:
            self.conversation_history[user_id] = []

        self.conversation_history[user_id].append({
            "role": "user",
            "content": message,
            "timestamp": datetime.utcnow().isoformat(),
        })

        if self._use_groq and self._groq_client:
            response = self._generate_groq_response(message, user_id, context)
        elif self._use_gemini and self._gemini_model:
            response = self._generate_gemini_response(message, user_id, context)
        elif self._use_openai and self._openai_client:
            response = self._generate_openai_response(message, user_id, context)
        else:
            response = self._generate_rule_based_response(message, context)

        self.conversation_history[user_id].append({
            "role": "assistant",
            "content": response["response"],
            "timestamp": datetime.utcnow().isoformat(),
        })

        if len(self.conversation_history[user_id]) > 20:
            self.conversation_history[user_id] = self.conversation_history[user_id][-20:]

        return response

    def _build_system_instruction(self, context: Optional[Dict]) -> str:
        prompt = """You are an AI Market Intelligence Assistant for Indian agricultural commodity markets (Bharat).

Your expertise: price forecasting, market sentiment, supply/demand, regional variations, trade. Focus on commodities like wheat, rice, onion, tomato, potato, and common vegetables.

Guidelines:
- Give data-driven, concise answers (2–4 sentences unless the user asks for more).
- Use percentages and INR when relevant; mention confidence when appropriate.
- Consider regional variations across India.
- Keep a professional, helpful tone.
- If the user asks about data you don't have, say so and suggest checking the dashboard or forecasts.
"""
        if context:
            prompt += f"\n\nAdditional context (use if relevant): {json.dumps(context)}"
        return prompt

    def _generate_groq_response(self, message: str, user_id: str, context: Optional[Dict]) -> Dict:
        try:
            system_prompt = self._build_system_instruction(context)
            history = self.conversation_history[user_id][-10:]
            messages = [{"role": "system", "content": system_prompt}]
            for msg in history:
                messages.append({"role": msg["role"], "content": msg["content"]})
            completion = self._groq_client.chat.completions.create(
                model=GROQ_COPILOT_MODEL,
                messages=messages,
                temperature=0.7,
                max_tokens=1024,
            )
            response_text = (completion.choices[0].message.content or "").strip() or "I couldn't generate a response. Please try again."
            sources = self._extract_sources(message, context)
            suggestions = self._generate_suggestions(message)
            return {
                "response": response_text,
                "confidence": 0.9,
                "sources": sources,
                "follow_up_suggestions": suggestions,
                "model": GROQ_COPILOT_MODEL,
            }
        except Exception as e:
            print(f"Groq copilot error: {e}")
            return self._generate_rule_based_response(message, context)

    def _generate_gemini_response(self, message: str, user_id: str, context: Optional[Dict]) -> Dict:
        try:
            system_instruction = self._build_system_instruction(context)
            history = self.conversation_history[user_id][-10:]
            prompt_parts = [system_instruction, "\n\n--- Recent conversation ---\n"]
            for msg in history:
                role = "User" if msg["role"] == "user" else "Assistant"
                prompt_parts.append(f"{role}: {msg['content']}\n")
            prompt_parts.append("\n--- End. Reply as the Assistant. ---")

            response = self._gemini_model.generate_content(
                "".join(prompt_parts),
                generation_config={
                    "temperature": 0.7,
                    "max_output_tokens": 1024,
                    "top_p": 0.95,
                },
            )
            response_text = response.text.strip() if response.text else "I couldn't generate a response. Please try again."

            sources = self._extract_sources(message, context)
            suggestions = self._generate_suggestions(message)
            return {
                "response": response_text,
                "confidence": 0.9,
                "sources": sources,
                "follow_up_suggestions": suggestions,
                "model": getattr(self, "_gemini_model_name", None) or "gemini",
            }
        except Exception as e:
            err_str = str(e).lower()
            if "api_key" in err_str or "invalid" in err_str or "400" in err_str:
                self._use_gemini = False
                self._gemini_model = None
                print("Gemini API key invalid or rejected. Set GEMINI_API_KEY in backend/.env or use GROQ_API_KEY for Copilot.")
            elif "429" in err_str or "quota" in err_str:
                print("Gemini quota exceeded (free tier limit). Use GROQ_API_KEY in backend/.env for Copilot to avoid limits.")
            else:
                print(f"Gemini error: {e}")
            if self._use_groq and self._groq_client:
                return self._generate_groq_response(message, user_id, context)
            return self._generate_rule_based_response(message, context)

    def _generate_openai_response(self, message: str, user_id: str, context: Optional[Dict]) -> Dict:
        try:
            system_prompt = self._build_system_instruction(context)
            messages = [{"role": "system", "content": system_prompt}]
            recent = self.conversation_history[user_id][-10:]
            for msg in recent:
                messages.append({"role": msg["role"], "content": msg["content"]})

            completion = self._openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                temperature=0.7,
                max_tokens=500,
            )
            response_text = completion.choices[0].message.content
            sources = self._extract_sources(message, context)
            suggestions = self._generate_suggestions(message)
            return {
                "response": response_text,
                "confidence": 0.95,
                "sources": sources,
                "follow_up_suggestions": suggestions,
                "model": "gpt-3.5-turbo",
            }
        except Exception as e:
            print(f"OpenAI error: {e}")
            return self._generate_rule_based_response(message, context)

    def _generate_rule_based_response(self, message: str, context: Optional[Dict]) -> Dict:
        message_lower = message.lower()

        if any(w in message_lower for w in ["price", "cost", "rate"]):
            commodity = self._extract_commodity(message_lower)
            response = f"Based on current market analysis, {commodity} prices show "
            if any(w in message_lower for w in ["forecast", "future", "predict"]):
                response += "an upward trend with 8–12% increase expected over the next 30 days, driven by seasonal demand and supply constraints. Confidence: 85%."
            elif any(w in message_lower for w in ["today", "current"]):
                response += "moderate stability at INR 2,450–2,650 per quintal across major mandis; 24h change around +2.3%."
            else:
                response += "positive momentum with 85% confidence; the forecast indicates continued growth."
            sources = ["price_history_model", "market_analysis", "demand_forecast"]

        elif any(w in message_lower for w in ["sentiment", "mood", "feeling", "opinion"]):
            commodity = self._extract_commodity(message_lower)
            response = f"Market sentiment for {commodity} is currently POSITIVE (score 0.72/1.0). Analysis of recent news: ~68% positive, 22% neutral, 10% negative. Key factors: export demand, weather, government support."
            sources = ["sentiment_analysis", "news_aggregation"]

        elif any(w in message_lower for w in ["demand", "supply", "volume"]):
            response = "Demand Index at 78/100 (high); supply moderate, +5% vs last month. North India ~12% higher demand; wholesale volumes 15k–18k MT/day."
            sources = ["demand_analytics", "supply_chain_data"]

        elif any(w in message_lower for w in ["region", "state", "where", "location"]):
            response = "Regional prices: Punjab & Haryana INR 2,650/q (highest), Maharashtra INR 2,480/q, Karnataka INR 2,420/q. Differentials reflect transport and local demand."
            sources = ["regional_data", "logistics_tracking"]

        elif any(w in message_lower for w in ["market", "trend", "analysis"]):
            response = "Market analysis: bullish across major agri commodities. Wheat & rice 8–10% growth potential; vegetables seasonal volatility; export opportunities expanding. Monitor supply chain and weather."
            sources = ["market_intelligence", "trend_analysis"]

        else:
            response = "I can help with price forecasts, sentiment, demand trends, regional comparisons, and commodities like wheat, rice, onion, tomato. What would you like to know?"
            sources = ["knowledge_base"]

        suggestions = self._generate_suggestions(message)
        return {
            "response": response,
            "confidence": 0.82,
            "sources": sources,
            "follow_up_suggestions": suggestions,
            "model": "rule-based",
        }

    def _extract_commodity(self, message: str) -> str:
        for c in self.market_context["commodities"]:
            if c in message:
                return c.title()
        return "Wheat"

    def _extract_sources(self, message: str, context: Optional[Dict]) -> List[str]:
        message_lower = message.lower()
        sources = []
        if "price" in message_lower or "forecast" in message_lower:
            sources.append("forecast_model")
        if "sentiment" in message_lower:
            sources.append("sentiment_analysis")
        if "demand" in message_lower:
            sources.append("demand_analytics")
        if "region" in message_lower:
            sources.append("regional_data")
        return sources or ["market_intelligence"]

    def _generate_suggestions(self, message: str) -> List[str]:
        message_lower = message.lower()
        if "price" in message_lower:
            return ["What factors are affecting this price?", "Show me the price trend chart", "Compare with last month"]
        if "forecast" in message_lower:
            return ["What's the confidence level?", "Show detailed forecast", "Compare with other commodities"]
        if "sentiment" in message_lower:
            return ["What news is driving this?", "Show sentiment distribution", "Compare with market average"]
        return ["Show me price forecasts", "What's the market sentiment?", "Analyze demand trends"]

    def get_conversation_history(self, user_id: str, limit: int = 20) -> List[Dict]:
        if user_id not in self.conversation_history:
            return []
        return self.conversation_history[user_id][-limit:]

    def clear_conversation(self, user_id: str) -> bool:
        if user_id in self.conversation_history:
            del self.conversation_history[user_id]
            return True
        return False


ai_copilot = AICopilot()
