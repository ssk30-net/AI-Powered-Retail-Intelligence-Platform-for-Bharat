from sqlalchemy import Column, Integer, String, Date, DateTime, Numeric, ForeignKey, Text
from sqlalchemy.sql import func
from app.core.database import Base

class Forecast(Base):
    __tablename__ = "forecasts"

    id = Column(Integer, primary_key=True, index=True)
    commodity_id = Column(Integer, ForeignKey('commodities.id'), index=True)
    region_id = Column(Integer, ForeignKey('regions.id'))
    forecast_date = Column(Date, nullable=False, index=True)
    predicted_price = Column(Numeric(12, 2), nullable=False)
    lower_bound = Column(Numeric(12, 2))
    upper_bound = Column(Numeric(12, 2))
    confidence_score = Column(Numeric(5, 4))
    model_version = Column(String(50))
    explanation = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
