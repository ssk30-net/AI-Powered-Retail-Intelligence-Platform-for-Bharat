"""
Agentic AI Insights: uses Groq LLM (free tier) to analyze user-uploaded data
and return business recommendations and mitigation strategies.
"""
import json
import re
from typing import Any, Dict, List, Optional

from app.core.config import settings
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_

try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False

# Free-tier model on Groq
GROQ_MODEL = "llama-3.1-8b-instant"


def _build_user_data_context(db: Session, user_id: str) -> str:
    """Build a text summary of the user's price data for the LLM (user uploads or seed)."""
    from app.models.commodity import Commodity
    from app.models.price_history import PriceHistory
    from uuid import UUID

    uid = UUID(user_id)
    use_user_data = db.query(PriceHistory.id).filter(PriceHistory.user_id == uid).limit(1).first() is not None
    if use_user_data:
        ph_filter = PriceHistory.user_id == uid
        data_source = "user-uploaded"
    else:
        ph_filter = or_(
            PriceHistory.user_id.is_(None),
            PriceHistory.source != "user_upload",
        )
        data_source = "platform seed/training"

    commodity_rows = (
        db.query(Commodity.id, Commodity.name)
        .join(PriceHistory, (PriceHistory.commodity_id == Commodity.id) & ph_filter)
        .distinct()
        .all()
    )
    if not commodity_rows:
        return f"Data source: {data_source}. No price history records available yet."

    lines = [f"Data source: {data_source}. Price history summary (latest vs previous period):"]
    for commodity_id, name in commodity_rows[:15]:
        latest = (
            db.query(PriceHistory)
            .filter(PriceHistory.commodity_id == commodity_id, ph_filter)
            .order_by(desc(PriceHistory.recorded_at), desc(PriceHistory.id))
            .limit(1)
            .first()
        )
        if not latest:
            continue
        prev = (
            db.query(PriceHistory.price)
            .filter(
                PriceHistory.commodity_id == commodity_id,
                PriceHistory.recorded_at < latest.recorded_at,
                ph_filter,
            )
            .order_by(desc(PriceHistory.recorded_at))
            .limit(1)
            .first()
        )
        price = float(latest.price)
        change = 0.0
        if prev and float(prev.price) != 0:
            change = ((price - float(prev.price)) / float(prev.price)) * 100
        lines.append(f"- {name}: INR {price:.2f} (change {change:+.1f}%)")
    return "\n".join(lines)


def _parse_llm_json(response_text: str) -> Dict[str, List[Dict[str, Any]]]:
    """Extract JSON from LLM response (handle markdown code blocks)."""
    text = response_text.strip()
    # Try to find ```json ... ``` block
    match = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
    if match:
        text = match.group(1).strip()
    # Fallback: find first { ... }
    start = text.find("{")
    if start >= 0:
        depth = 0
        for i in range(start, len(text)):
            if text[i] == "{":
                depth += 1
            elif text[i] == "}":
                depth -= 1
                if depth == 0:
                    text = text[start : i + 1]
                    break
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {}


def generate_agentic_insights(db: Session, user_id: str) -> Optional[Dict[str, Any]]:
    """
    Use Groq LLM to analyze user's data and return opportunities, risks,
    recommendations, and mitigation strategies. Returns None if Groq is unavailable.
    """
    if not getattr(settings, "GROQ_API_KEY", None) or not settings.GROQ_API_KEY or not GROQ_AVAILABLE:
        return None

    try:
        client = Groq(api_key=settings.GROQ_API_KEY)
    except Exception:
        return None

    context = _build_user_data_context(db, user_id)

    system_prompt = """You are an expert agri-market analyst for Indian (Bharat) retail and commodity markets.
Given a summary of price history data (user-uploaded or platform data), identify:
1. Opportunities: favorable conditions, upside potential, or good entry points.
2. Risks: price volatility, downside, supply/demand or policy risks.
3. Recommendations: clear actions (e.g. Buy/Hold/Sell/Diversify/Monitor) with reasoning.
4. Mitigation strategies: how to reduce exposure or hedge against identified risks.

Respond with valid JSON only, no other text. Use this exact structure:
{
  "opportunities": [{"title": "...", "description": "...", "impact": "High|Medium|Low", "commodity": "..."}],
  "risks": [{"title": "...", "description": "...", "severity": "High|Medium|Low", "commodity": "..."}],
  "recommendations": [{"action": "Buy|Hold|Sell|Monitor|Diversify", "commodity": "...", "confidence": 0-100, "reasoning": "..."}],
  "mitigation_strategies": [{"title": "...", "description": "...", "for_risk": "..."}]
}
Keep each list to 3-5 items. Use the commodity names and price changes from the data. Be specific and actionable."""

    user_prompt = f"Analyze this price data and return the JSON structure above.\n\n{context}"

    try:
        completion = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.4,
            max_tokens=2048,
        )
        raw = completion.choices[0].message.content
        if not raw:
            return None
        parsed = _parse_llm_json(raw)
        if not parsed:
            return None
        # Normalize to frontend shape
        opportunities = []
        for o in parsed.get("opportunities", [])[:5]:
            opportunities.append({
                "title": o.get("title", "Opportunity"),
                "description": o.get("description", ""),
                "impact": o.get("impact", "Medium"),
                "commodity": o.get("commodity", ""),
            })
        risks = []
        for r in parsed.get("risks", [])[:5]:
            risks.append({
                "title": r.get("title", "Risk"),
                "description": r.get("description", ""),
                "severity": r.get("severity", "Medium"),
                "commodity": r.get("commodity", ""),
            })
        recommendations = []
        for rec in parsed.get("recommendations", [])[:5]:
            recommendations.append({
                "action": rec.get("action", "Monitor"),
                "commodity": rec.get("commodity", ""),
                "confidence": int(rec.get("confidence", 70)) if isinstance(rec.get("confidence"), (int, float)) else 70,
                "reasoning": rec.get("reasoning", ""),
            })
        mitigation_strategies = []
        for m in parsed.get("mitigation_strategies", [])[:5]:
            mitigation_strategies.append({
                "title": m.get("title", "Mitigation"),
                "description": m.get("description", ""),
                "for_risk": m.get("for_risk", ""),
            })
        return {
            "opportunities": opportunities,
            "risks": risks,
            "recommendations": recommendations,
            "mitigation_strategies": mitigation_strategies,
            "model": GROQ_MODEL,
            "data_source_note": "Insights from your uploaded data" if "user-uploaded" in context else "Insights from platform data",
        }
    except Exception as e:
        print(f"Agentic insights Groq error: {e}")
        return None
