"""
Quick script to check data dates in database
"""
import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database connection
DATABASE_URL = os.getenv('DATABASE_URL')
engine = create_engine(DATABASE_URL)

print("=" * 80)
print("CHECKING DATA DATES IN DATABASE")
print("=" * 80)

with engine.connect() as conn:
    # Check price_history
    result = conn.execute(text("""
        SELECT 
            COUNT(*) as total_records,
            MIN(recorded_at) as earliest_date,
            MAX(recorded_at) as latest_date,
            COUNT(DISTINCT commodity_id) as unique_commodities,
            COUNT(DISTINCT region_id) as unique_regions
        FROM price_history
    """))
    
    row = result.fetchone()
    print("\nPRICE HISTORY:")
    print(f"  Total Records: {row[0]:,}")
    print(f"  Date Range: {row[1]} to {row[2]}")
    print(f"  Unique Commodities: {row[3]}")
    print(f"  Unique Regions: {row[4]}")
    
    # Check sentiment_data
    result = conn.execute(text("""
        SELECT 
            COUNT(*) as total_records,
            MIN(published_at) as earliest_date,
            MAX(published_at) as latest_date,
            COUNT(DISTINCT commodity_id) as unique_commodities
        FROM sentiment_data
    """))
    
    row = result.fetchone()
    print("\nSENTIMENT DATA:")
    print(f"  Total Records: {row[0]:,}")
    print(f"  Date Range: {row[1]} to {row[2]}")
    print(f"  Unique Commodities: {row[3]}")
    
    # Check forecasts
    result = conn.execute(text("""
        SELECT 
            COUNT(*) as total_records,
            MIN(forecast_date) as earliest_date,
            MAX(forecast_date) as latest_date,
            COUNT(DISTINCT commodity_id) as unique_commodities
        FROM forecasts
    """))
    
    row = result.fetchone()
    print("\nFORECASTS:")
    print(f"  Total Records: {row[0]:,}")
    print(f"  Date Range: {row[1]} to {row[2]}")
    print(f"  Unique Commodities: {row[3]}")

print("\n" + "=" * 80)
print("✓ Data check complete!")
print("=" * 80)
