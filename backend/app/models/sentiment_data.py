from sqlalchemy import Column, BigInteger, Integer, String, DateTime, Numeric, ForeignKey, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from app.core.database import Base

class SentimentData(Base):
    __tablename__ = "sentiment_data"

    id = Column(BigInteger, primary_key=True, index=True)
    commodity_id = Column(Integer, ForeignKey('commodities.id'), index=True)
    source_type = Column(String(50))  # 'news', 'social', 'article'
    source_url = Column(Text)
    source = Column(String(100))  # Added for compatibility
    headline = Column(Text)  # Added for compatibility (alias for title)
    title = Column(Text)
    content = Column(Text)
    sentiment_score = Column(Numeric(5, 4), index=True)  # -1 to 1
    sentiment_label = Column(String(20))  # 'positive', 'negative', 'neutral'
    entities = Column(JSONB)
    published_at = Column(DateTime(timezone=True), index=True)
    processed_at = Column(DateTime(timezone=True), server_default=func.now())
