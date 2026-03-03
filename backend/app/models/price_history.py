from sqlalchemy import Column, BigInteger, Integer, String, DateTime, Numeric, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base


class PriceHistory(Base):
    __tablename__ = "price_history"

    id = Column(BigInteger, primary_key=True, index=True)
    commodity_id = Column(Integer, ForeignKey('commodities.id'), index=True)
    region_id = Column(Integer, ForeignKey('regions.id'), index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='SET NULL'), index=True, nullable=True)
    price = Column(Numeric(12, 2), nullable=False)
    volume = Column(Numeric(15, 2))
    source = Column(String(100))
    recorded_at = Column(DateTime(timezone=True), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
