"""
Seed demo RDS data for the Market Intelligence Dashboard.
Run this when the dashboard shows zeros / "No data" so it displays sample numbers
like the reference dashboard (KPIs, price trend chart, top gainers/losers).

Usage (from backend folder):
  python seed_demo_dashboard.py

Uses DATABASE_URL from .env. Inserts commodities, one region, and price_history
with user_id NULL and source 'SYNTHETIC' so the dashboard shows this as RDS/training data.
"""
import os
import sys
from datetime import datetime, timedelta
import psycopg2
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("ERROR: DATABASE_URL not set in .env")
    sys.exit(1)

# Commodities with base prices and trend (positive = recent price higher, for gainers/losers)
# Format: (name, base_price, trend_multiplier for last 30 days)
COMMODITIES = [
    ("Wheat", 2100, 1.12),       # ~12% up
    ("Cabbage", 280, 3.5),       # big gainer
    ("Brinjal", 850, 2.2),
    ("Potato", 450, 1.45),
    ("Cucumber", 3200, 0.22),    # big loser
    ("Green Chilli", 14000, 0.27),
    ("Banana", 2000, 0.30),
]


def run():
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = False
    cur = conn.cursor()
    try:
        # 1. Ensure default region
        cur.execute(
            "SELECT id FROM regions WHERE name = %s AND state = %s LIMIT 1",
            ("Default", "India"),
        )
        row = cur.fetchone()
        if row:
            region_id = row[0]
        else:
            cur.execute(
                "INSERT INTO regions (name, state, country) VALUES (%s, %s, %s) RETURNING id",
                ("Default", "India", "India"),
            )
            region_id = cur.fetchone()[0]
        print(f"Region id: {region_id}")

        # 2. Insert commodities and build id -> name map
        commodity_ids = {}
        for name, _base, _mult in COMMODITIES:
            cur.execute("SELECT id FROM commodities WHERE name = %s LIMIT 1", (name,))
            row = cur.fetchone()
            if row:
                commodity_ids[name] = row[0]
            else:
                cur.execute(
                    "INSERT INTO commodities (name, category, unit) VALUES (%s, %s, %s) RETURNING id",
                    (name, "Agricultural", "quintal"),
                )
                commodity_ids[name] = cur.fetchone()[0]
        print(f"Commodities: {list(commodity_ids.keys())}")

        # 3. Insert price_history for last 60 days so we have "previous" for % change
        today = datetime.utcnow().date()
        total_inserted = 0
        for name, base_price, trend_mult in COMMODITIES:
            cid = commodity_ids[name]
            # 60 days of data; older prices lower (so recent = higher for gainers)
            for d in range(60):
                record_date = today - timedelta(days=d)
                recorded_at = datetime(record_date.year, record_date.month, record_date.day, 12, 0, 0)
                # Price increases as we get closer to today (so last day is highest for gainers)
                progress = 1 - (d / 60.0)  # 1 at today, 0 at 60 days ago
                price = base_price * (1 + (trend_mult - 1) * progress)
                price = round(price, 2)
                cur.execute(
                    """
                    INSERT INTO price_history (commodity_id, region_id, price, volume, source, recorded_at)
                    VALUES (%s, %s, %s, NULL, 'SYNTHETIC', %s)
                    """,
                    (cid, region_id, price, recorded_at),
                )
                total_inserted += 1
        conn.commit()
        print(f"Inserted {total_inserted} price_history rows (user_id NULL, source SYNTHETIC)")
        print("Done. Refresh the dashboard to see RDS data (KPIs, chart, top movers).")
    except Exception as e:
        conn.rollback()
        print(f"Error: {e}")
        sys.exit(1)
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    run()
