from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from app.core.database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=True)
    commodity_id = Column(Integer, ForeignKey("commodities.id", ondelete="SET NULL"), index=True, nullable=True)
    alert_type = Column(String(50), index=True)  # price_spike, demand_change, supply_disruption, forecast_breach
    severity = Column(String(20), index=True)  # high, medium, low
    title = Column(String(255), nullable=False)
    message = Column(Text)
    metadata_ = Column("metadata", JSONB, nullable=True)
    is_read = Column(Boolean, default=False)
    is_acknowledged = Column(Boolean, default=False)
    triggered_at = Column(DateTime(timezone=True), server_default=func.now())
    acknowledged_at = Column(DateTime(timezone=True), nullable=True)
