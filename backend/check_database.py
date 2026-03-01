"""
Quick Database Check Script
Verify what data has been loaded into RDS
"""

import psycopg2
from dotenv import load_dotenv
import os
from tabulate import tabulate

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')

def check_database():
    """Check database contents"""
    
    print("=" * 80)
    print("AI MARKET PULSE - DATABASE CHECK")
    print("=" * 80)
    print()
    
    try:
        # Connect to database
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        # 1. Check all tables
        print("📊 TABLE SUMMARY")
        print("-" * 80)
        
        tables = [
            'commodities',
            'regions',
            'price_history',
            'sentiment_data',
            'forecasts'
        ]
        
        table_data = []
        for table in tables:
            cur.execute(f"SELECT COUNT(*) FROM {table}")
            count = cur.fetchone()[0]
            table_data.append([table, f"{count:,}"])
        
        print(tabulate(table_data, headers=['Table', 'Record Count'], tablefmt='grid'))
        print()
        
        # 2. Check commodities
        print("🌾 COMMODITIES")
        print("-" * 80)
        cur.execute("""
            SELECT id, name, category, unit 
            FROM commodities 
            ORDER BY id 
            LIMIT 10
        """)
        commodities = cur.fetchall()
        
        if commodities:
            print(tabulate(commodities, headers=['ID', 'Name', 'Category', 'Unit'], tablefmt='grid'))
            
            cur.execute("SELECT COUNT(*) FROM commodities")
            total = cur.fetchone()[0]
            if total > 10:
                print(f"\n... and {total - 10} more commodities")
        else:
            print("❌ No commodities found")
        print()
        
        # 3. Check regions
        print("🗺️  REGIONS")
        print("-" * 80)
        cur.execute("""
            SELECT id, name, state, country 
            FROM regions 
            ORDER BY id 
            LIMIT 10
        """)
        regions = cur.fetchall()
        
        if regions:
            print(tabulate(regions, headers=['ID', 'Name', 'State', 'Country'], tablefmt='grid'))
            
            cur.execute("SELECT COUNT(*) FROM regions")
            total = cur.fetchone()[0]
            if total > 10:
                print(f"\n... and {total - 10} more regions")
        else:
            print("❌ No regions found")
        print()
        
        # 4. Check price history by source
        print("💰 PRICE HISTORY BY SOURCE")
        print("-" * 80)
        cur.execute("""
            SELECT 
                source,
                COUNT(*) as count,
                MIN(recorded_at) as earliest_date,
                MAX(recorded_at) as latest_date,
                ROUND(AVG(price)::numeric, 2) as avg_price
            FROM price_history
            GROUP BY source
            ORDER BY count DESC
        """)
        price_sources = cur.fetchall()
        
        if price_sources:
            print(tabulate(price_sources, 
                         headers=['Source', 'Count', 'Earliest Date', 'Latest Date', 'Avg Price'], 
                         tablefmt='grid'))
        else:
            print("❌ No price history found")
        print()
        
        # 5. Check price history per commodity (top 10)
        print("📈 TOP 10 COMMODITIES BY PRICE RECORDS")
        print("-" * 80)
        cur.execute("""
            SELECT 
                c.name,
                COUNT(*) as record_count,
                ROUND(AVG(ph.price)::numeric, 2) as avg_price,
                ROUND(MIN(ph.price)::numeric, 2) as min_price,
                ROUND(MAX(ph.price)::numeric, 2) as max_price
            FROM price_history ph
            JOIN commodities c ON ph.commodity_id = c.id
            GROUP BY c.name
            ORDER BY record_count DESC
            LIMIT 10
        """)
        commodity_stats = cur.fetchall()
        
        if commodity_stats:
            print(tabulate(commodity_stats, 
                         headers=['Commodity', 'Records', 'Avg Price', 'Min Price', 'Max Price'], 
                         tablefmt='grid'))
        else:
            print("❌ No price data found")
        print()
        
        # 6. Check sentiment data
        print("😊 SENTIMENT DATA")
        print("-" * 80)
        cur.execute("""
            SELECT 
                sentiment_label,
                COUNT(*) as count,
                ROUND(AVG(sentiment_score)::numeric, 4) as avg_score
            FROM sentiment_data
            GROUP BY sentiment_label
            ORDER BY count DESC
        """)
        sentiment_stats = cur.fetchall()
        
        if sentiment_stats:
            print(tabulate(sentiment_stats, 
                         headers=['Sentiment', 'Count', 'Avg Score'], 
                         tablefmt='grid'))
        else:
            print("❌ No sentiment data found")
        print()
        
        # 7. Check forecasts
        print("🔮 FORECASTS")
        print("-" * 80)
        cur.execute("""
            SELECT 
                COUNT(*) as total_forecasts,
                MIN(forecast_date) as earliest_forecast,
                MAX(forecast_date) as latest_forecast,
                ROUND(AVG(confidence_score)::numeric, 4) as avg_confidence
            FROM forecasts
        """)
        forecast_stats = cur.fetchone()
        
        if forecast_stats and forecast_stats[0] > 0:
            print(tabulate([forecast_stats], 
                         headers=['Total', 'Earliest Date', 'Latest Date', 'Avg Confidence'], 
                         tablefmt='grid'))
        else:
            print("❌ No forecasts found")
        print()
        
        # 8. Data quality check
        print("✅ DATA QUALITY CHECK")
        print("-" * 80)
        
        quality_checks = []
        
        # Check for NULL prices
        cur.execute("SELECT COUNT(*) FROM price_history WHERE price IS NULL")
        null_prices = cur.fetchone()[0]
        quality_checks.append(['NULL prices', null_prices, '✅ OK' if null_prices == 0 else '⚠️ WARNING'])
        
        # Check for negative prices
        cur.execute("SELECT COUNT(*) FROM price_history WHERE price < 0")
        negative_prices = cur.fetchone()[0]
        quality_checks.append(['Negative prices', negative_prices, '✅ OK' if negative_prices == 0 else '❌ ERROR'])
        
        # Check for future dates
        cur.execute("SELECT COUNT(*) FROM price_history WHERE recorded_at > CURRENT_DATE")
        future_dates = cur.fetchone()[0]
        quality_checks.append(['Future dates', future_dates, '✅ OK' if future_dates == 0 else '⚠️ WARNING'])
        
        # Check date range
        cur.execute("SELECT MIN(recorded_at), MAX(recorded_at) FROM price_history")
        date_range = cur.fetchone()
        if date_range[0]:
            days_span = (date_range[1] - date_range[0]).days
            quality_checks.append(['Date range (days)', days_span, '✅ OK' if days_span > 30 else '⚠️ LIMITED'])
        
        print(tabulate(quality_checks, headers=['Check', 'Value', 'Status'], tablefmt='grid'))
        print()
        
        # 9. Summary
        print("=" * 80)
        print("📋 SUMMARY")
        print("=" * 80)
        
        cur.execute("SELECT COUNT(*) FROM commodities")
        commodity_count = cur.fetchone()[0]
        
        cur.execute("SELECT COUNT(*) FROM regions")
        region_count = cur.fetchone()[0]
        
        cur.execute("SELECT COUNT(*) FROM price_history")
        price_count = cur.fetchone()[0]
        
        cur.execute("SELECT COUNT(*) FROM sentiment_data")
        sentiment_count = cur.fetchone()[0]
        
        cur.execute("SELECT COUNT(*) FROM forecasts")
        forecast_count = cur.fetchone()[0]
        
        total_records = commodity_count + region_count + price_count + sentiment_count + forecast_count
        
        print(f"Total Records: {total_records:,}")
        print(f"  • Commodities: {commodity_count:,}")
        print(f"  • Regions: {region_count:,}")
        print(f"  • Price History: {price_count:,}")
        print(f"  • Sentiment Data: {sentiment_count:,}")
        print(f"  • Forecasts: {forecast_count:,}")
        print()
        
        # Readiness check
        print("🎯 ML READINESS CHECK")
        print("-" * 80)
        
        readiness = []
        readiness.append(['Commodities loaded', commodity_count > 0, '✅' if commodity_count > 0 else '❌'])
        readiness.append(['Regions loaded', region_count > 0, '✅' if region_count > 0 else '❌'])
        readiness.append(['Price history (min 1000)', price_count >= 1000, '✅' if price_count >= 1000 else '⚠️'])
        readiness.append(['Sentiment data available', sentiment_count > 0, '✅' if sentiment_count > 0 else '⚠️'])
        readiness.append(['Date range (min 90 days)', days_span >= 90 if date_range[0] else False, '✅' if date_range[0] and days_span >= 90 else '⚠️'])
        
        print(tabulate(readiness, headers=['Requirement', 'Met', 'Status'], tablefmt='grid'))
        print()
        
        # Final verdict
        all_ready = all([r[1] for r in readiness[:3]])  # Check critical requirements
        
        if all_ready:
            print("✅ DATABASE IS READY FOR ML TRAINING!")
            print("   You can proceed with STEP 1: Verify Data Structure")
        else:
            print("⚠️  DATABASE NEEDS MORE DATA")
            print("   Run LOAD_ALL_DATA.bat to populate the database")
        
        print("=" * 80)
        
        # Close connection
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error connecting to database: {e}")
        print()
        print("Check your .env file has correct DATABASE_URL")
        return False
    
    return True

if __name__ == "__main__":
    check_database()
