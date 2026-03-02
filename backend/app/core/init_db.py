from app.core.database import engine, Base
from app.models.user import User
from app.models.commodity import Commodity
from app.models.region import Region
from app.models.price_history import PriceHistory
from app.models.forecast import Forecast
from app.models.sentiment_data import SentimentData

def init_db():
    """Initialize database tables (User, Commodity, Region, PriceHistory, Forecast, SentimentData)"""
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    init_db()
