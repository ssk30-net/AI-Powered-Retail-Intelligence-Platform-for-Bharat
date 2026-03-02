"""
Seed the forecasts table from latest price_history so the UI shows forecast data.
Run from backend folder: python seed_forecasts.py
Uses DATABASE_URL from .env.
"""
import sys
from datetime import date, timedelta
from decimal import Decimal

# Add app to path
sys.path.insert(0, ".")

from sqlalchemy import func
from app.core.database import SessionLocal
from app.models.commodity import Commodity
from app.models.region import Region
from app.models.price_history import PriceHistory
from app.models.forecast import Forecast


def ensure_regions(db, region_ids):
    """Ensure all given region ids exist in regions table."""
    for rid in set(region_ids):
        if db.query(Region).filter(Region.id == rid).first():
            continue
        db.add(Region(id=rid, name=f"Region {rid}", country="India"))
        print(f"  Created region id={rid}")
    db.commit()


def get_commodities_with_latest_price(db):
    """Return list of (commodity_id, region_id, latest_price, commodity_name)."""
    subq = (
        db.query(
            PriceHistory.commodity_id,
            PriceHistory.region_id,
            func.max(PriceHistory.recorded_at).label("max_at"),
        )
        .group_by(PriceHistory.commodity_id, PriceHistory.region_id)
    ).subquery()
    rows = (
        db.query(PriceHistory.commodity_id, PriceHistory.region_id, PriceHistory.price, Commodity.name)
        .join(Commodity, PriceHistory.commodity_id == Commodity.id)
        .join(
            subq,
            (PriceHistory.commodity_id == subq.c.commodity_id)
            & (PriceHistory.region_id == subq.c.region_id)
            & (PriceHistory.recorded_at == subq.c.max_at),
        )
        .distinct()
        .all()
    )
    return [(r.commodity_id, r.region_id, float(r.price), r.name or f"Commodity {r.commodity_id}") for r in rows]


def seed_forecasts(db, days_ahead: int = 30):
    """For each commodity that has price_history, create forecast rows for the next days_ahead days."""
    commodities_with_price = get_commodities_with_latest_price(db)
    if commodities_with_price:
        ensure_regions(db, [r[1] for r in commodities_with_price])
    if not commodities_with_price:
        print("No price_history found. Add price_history rows first, then run this script again.")
        return 0

    today = date.today()
    total_inserted = 0

    for commodity_id, region_id, last_price, name in commodities_with_price:
        # Skip if we already have forecasts for this commodity+region in the future
        existing = (
            db.query(Forecast)
            .filter(
                Forecast.commodity_id == commodity_id,
                Forecast.region_id == region_id,
                Forecast.forecast_date >= today,
            )
            .limit(1)
            .first()
        )
        if existing:
            print(f"  Skipping {name} (id={commodity_id}): already has future forecasts")
            continue

        # Create forecast for next `days_ahead` days (simple trend: slight upward)
        base = Decimal(str(round(last_price, 2)))
        inserted = 0
        for i in range(1, days_ahead + 1):
            forecast_date = today + timedelta(days=i)
            # Slight upward trend: +0.1% per day
            factor = 1 + (i * 0.001)
            pred = round(base * Decimal(str(factor)), 2)
            lower = round(pred * Decimal("0.97"), 2)
            upper = round(pred * Decimal("1.03"), 2)
            confidence = Decimal("0.85")
            explanation = (
                f"Model forecast for {name} based on latest price ₹{last_price}; trend +0.1%/day."
                if i == 1
                else (f"30-day forecast for {name}. Predicted range from seed model (seed-v1)." if i == days_ahead else None)
            )
            db.add(
                Forecast(
                    commodity_id=commodity_id,
                    region_id=region_id,
                    forecast_date=forecast_date,
                    predicted_price=pred,
                    lower_bound=lower,
                    upper_bound=upper,
                    confidence_score=confidence,
                    model_version="seed-v1",
                    explanation=explanation,
                )
            )
            inserted += 1
        db.commit()
        total_inserted += inserted
        print(f"  {name} (id={commodity_id}): added {inserted} forecast days")

    return total_inserted


def main():
    print("Connecting to database...")
    db = SessionLocal()
    try:
        print("Seeding forecasts from latest price_history...")
        n = seed_forecasts(db, days_ahead=30)
        print(f"Done. Total forecast rows added: {n}")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
