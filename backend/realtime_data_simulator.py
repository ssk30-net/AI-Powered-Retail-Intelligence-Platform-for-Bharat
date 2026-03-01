"""
Real-Time Data Simulator
Continuously generates synthetic sentiment data and forecasts
Simulates near real-time data creation for ML model testing
"""

import psycopg2
from psycopg2.extras import execute_batch
import numpy as np
from datetime import datetime, timedelta
import time
import os
from dotenv import load_dotenv
import logging
from scipy import stats
import random

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
DATABASE_URL = os.getenv('DATABASE_URL')

class RealtimeDataSimulator:
    """Simulate real-time data generation"""
    
    def __init__(self):
        self.conn = psycopg2.connect(DATABASE_URL)
        self.cur = self.conn.cursor()
        
        # News headline templates
        self.positive_headlines = [
            "{} Prices Expected to Rise on Strong Demand",
            "Export Orders Boost {} Market Sentiment",
            "{} Production Exceeds Expectations",
            "Favorable Weather Conditions Support {} Prices",
            "Global Demand for {} Reaches New High",
            "{} Inventory Levels Drop, Prices Firm",
            "Trade Deal Boosts {} Export Prospects",
            "Strong Economic Data Lifts {} Prices",
            "{} Supply Concerns Push Prices Higher",
            "Analysts Upgrade {} Price Forecasts"
        ]
        
        self.negative_headlines = [
            "{} Prices Under Pressure from Oversupply",
            "Weak Demand Weighs on {} Market",
            "{} Production Surplus Concerns Emerge",
            "Adverse Weather Impacts {} Quality",
            "Export Restrictions Hurt {} Prices",
            "{} Inventory Builds Up, Prices Soften",
            "Trade Tensions Affect {} Market",
            "Economic Slowdown Impacts {} Demand",
            "{} Prices Fall on Harvest Pressure",
            "Analysts Downgrade {} Price Outlook"
        ]
        
        self.neutral_headlines = [
            "{} Market Remains Stable Amid Mixed Signals",
            "{} Prices Hold Steady in Quiet Trading",
            "Market Awaits Direction on {} Prices",
            "{} Trading Range-Bound This Week",
            "Mixed Fundamentals Keep {} Prices Flat",
            "{} Market Consolidates Recent Gains",
            "Traders Cautious on {} Price Direction",
            "{} Prices Unchanged Despite Volatility",
            "Market Participants Monitor {} Developments",
            "{} Prices Stable Ahead of Key Report"
        ]
        
        self.sources = ['news', 'social', 'article', 'blog', 'report']
        
    def close(self):
        """Close database connection"""
        self.cur.close()
        self.conn.close()
    
    def get_active_commodities(self):
        """Get list of active commodities"""
        self.cur.execute("""
            SELECT id, name 
            FROM commodities 
            WHERE is_active = TRUE
            ORDER BY id
        """)
        return self.cur.fetchall()
    
    def get_commodity_regions(self, commodity_id):
        """Get regions for a commodity"""
        self.cur.execute("""
            SELECT DISTINCT region_id 
            FROM price_history 
            WHERE commodity_id = %s
            LIMIT 5
        """, (commodity_id,))
        return [row[0] for row in self.cur.fetchall()]
    
    def get_recent_prices(self, commodity_id, region_id, days=90):
        """Get recent price data for forecasting"""
        self.cur.execute("""
            SELECT price, recorded_at
            FROM price_history
            WHERE commodity_id = %s AND region_id = %s
            ORDER BY recorded_at DESC
            LIMIT %s
        """, (commodity_id, region_id, days))
        return self.cur.fetchall()
    
    def generate_sentiment_record(self, commodity_id, commodity_name):
        """Generate a single sentiment record"""
        
        # Determine sentiment (40% positive, 20% negative, 40% neutral)
        sentiment_type = np.random.choice(
            ['positive', 'negative', 'neutral'],
            p=[0.4, 0.2, 0.4]
        )
        
        # Generate sentiment score based on type
        if sentiment_type == 'positive':
            score = np.random.uniform(0.3, 1.0)
            headline = random.choice(self.positive_headlines).format(commodity_name)
        elif sentiment_type == 'negative':
            score = np.random.uniform(-1.0, -0.3)
            headline = random.choice(self.negative_headlines).format(commodity_name)
        else:
            score = np.random.uniform(-0.2, 0.2)
            headline = random.choice(self.neutral_headlines).format(commodity_name)
        
        # Random source
        source = random.choice(self.sources)
        
        # Published time (within last hour)
        published_at = datetime.now() - timedelta(minutes=np.random.randint(0, 60))
        
        try:
            self.cur.execute("""
                INSERT INTO sentiment_data (
                    commodity_id, source_type, title, sentiment_score,
                    sentiment_label, published_at
                )
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (
                commodity_id,
                source,
                headline,
                round(float(score), 4),
                sentiment_type,
                published_at
            ))
            
            record_id = self.cur.fetchone()[0]
            self.conn.commit()
            
            return {
                'id': record_id,
                'commodity': commodity_name,
                'sentiment': sentiment_type,
                'score': round(float(score), 4),
                'headline': headline[:50] + '...' if len(headline) > 50 else headline
            }
            
        except Exception as e:
            logger.error(f"Error inserting sentiment: {e}")
            self.conn.rollback()
            return None
    
    def generate_forecast_record(self, commodity_id, commodity_name, region_id):
        """Generate forecast records for next 30 days"""
        
        # Get recent prices
        recent_data = self.get_recent_prices(commodity_id, region_id, days=90)
        
        if len(recent_data) < 30:
            logger.warning(f"Not enough data for {commodity_name} in region {region_id}")
            return 0
        
        prices = [float(row[0]) for row in reversed(recent_data)]
        
        # Calculate trend using linear regression
        x = np.arange(len(prices))
        slope, intercept, r_value, _, _ = stats.linregress(x, prices)
        
        # Generate forecasts for next 30 days
        forecasts_generated = 0
        
        for day in range(1, 31):
            forecast_date = datetime.now().date() + timedelta(days=day)
            
            # Check if forecast already exists
            self.cur.execute("""
                SELECT id FROM forecasts
                WHERE commodity_id = %s 
                  AND region_id = %s 
                  AND forecast_date = %s
            """, (commodity_id, region_id, forecast_date))
            
            if self.cur.fetchone() is not None:
                continue  # Skip if already exists
            
            # Predict price using trend
            predicted_price = intercept + slope * (len(prices) + day)
            
            # Add some randomness based on historical volatility
            volatility = np.std(prices) * 0.1
            predicted_price += np.random.normal(0, volatility)
            
            # Calculate uncertainty (increases with time)
            uncertainty = abs(predicted_price) * (0.05 + 0.005 * day)
            
            lower_bound = predicted_price - uncertainty
            upper_bound = predicted_price + uncertainty
            
            # Confidence decreases with time
            confidence = max(0.5, 1.0 - (day / 30) * 0.3)
            
            # Add some randomness to confidence
            confidence += np.random.uniform(-0.05, 0.05)
            confidence = max(0.5, min(0.99, confidence))
            
            try:
                self.cur.execute("""
                    INSERT INTO forecasts (
                        commodity_id, region_id, forecast_date,
                        predicted_price, lower_bound, upper_bound,
                        confidence_score, model_version, created_at
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    commodity_id,
                    region_id,
                    forecast_date,
                    round(float(predicted_price), 2),
                    round(float(lower_bound), 2),
                    round(float(upper_bound), 2),
                    round(float(confidence), 4),
                    'realtime_v1',
                    datetime.now()
                ))
                
                forecasts_generated += 1
                
            except Exception as e:
                logger.error(f"Error inserting forecast: {e}")
                self.conn.rollback()
                continue
        
        self.conn.commit()
        return forecasts_generated
    
    def run_continuous(self, interval_seconds=10, duration_minutes=None):
        """
        Run continuous data generation
        
        Args:
            interval_seconds: Seconds between each generation cycle
            duration_minutes: Total duration to run (None = infinite)
        """
        
        logger.info("=" * 80)
        logger.info("REAL-TIME DATA SIMULATOR STARTED")
        logger.info("=" * 80)
        logger.info(f"Interval: {interval_seconds} seconds")
        logger.info(f"Duration: {'Infinite' if duration_minutes is None else f'{duration_minutes} minutes'}")
        logger.info("Press Ctrl+C to stop")
        logger.info("=" * 80)
        
        commodities = self.get_active_commodities()
        logger.info(f"Found {len(commodities)} active commodities")
        
        if not commodities:
            logger.error("No commodities found! Run LOAD_DATA.bat first")
            return
        
        start_time = datetime.now()
        cycle = 0
        total_sentiment = 0
        total_forecasts = 0
        
        try:
            while True:
                cycle += 1
                cycle_start = time.time()
                
                logger.info(f"\n{'='*80}")
                logger.info(f"CYCLE {cycle} - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
                logger.info(f"{'='*80}")
                
                # Generate sentiment for random commodities (2-5 per cycle)
                num_sentiments = np.random.randint(2, 6)
                selected_commodities = random.sample(commodities, min(num_sentiments, len(commodities)))
                
                sentiment_count = 0
                for commodity_id, commodity_name in selected_commodities:
                    result = self.generate_sentiment_record(commodity_id, commodity_name)
                    if result:
                        sentiment_count += 1
                        logger.info(f"  📰 Sentiment: {result['commodity']} | {result['sentiment'].upper()} ({result['score']:+.2f}) | {result['headline']}")
                
                total_sentiment += sentiment_count
                
                # Generate forecasts for 1-2 random commodities per cycle
                num_forecast_commodities = np.random.randint(1, 3)
                forecast_commodities = random.sample(commodities, min(num_forecast_commodities, len(commodities)))
                
                forecast_count = 0
                for commodity_id, commodity_name in forecast_commodities:
                    regions = self.get_commodity_regions(commodity_id)
                    if regions:
                        region_id = random.choice(regions)
                        count = self.generate_forecast_record(commodity_id, commodity_name, region_id)
                        if count > 0:
                            forecast_count += count
                            logger.info(f"  🔮 Forecast: {commodity_name} | Region {region_id} | {count} days generated")
                
                total_forecasts += forecast_count
                
                # Summary
                logger.info(f"\n  ✅ Cycle {cycle} Complete:")
                logger.info(f"     • Sentiment records: {sentiment_count}")
                logger.info(f"     • Forecast records: {forecast_count}")
                logger.info(f"     • Total sentiment: {total_sentiment}")
                logger.info(f"     • Total forecasts: {total_forecasts}")
                
                # Check duration
                if duration_minutes:
                    elapsed = (datetime.now() - start_time).total_seconds() / 60
                    if elapsed >= duration_minutes:
                        logger.info(f"\n{'='*80}")
                        logger.info(f"Duration limit reached ({duration_minutes} minutes)")
                        break
                
                # Wait for next cycle
                cycle_time = time.time() - cycle_start
                sleep_time = max(0, interval_seconds - cycle_time)
                
                if sleep_time > 0:
                    logger.info(f"\n  ⏳ Waiting {sleep_time:.1f} seconds until next cycle...")
                    time.sleep(sleep_time)
                
        except KeyboardInterrupt:
            logger.info("\n\n" + "="*80)
            logger.info("SIMULATOR STOPPED BY USER")
        
        finally:
            # Final summary
            elapsed_time = (datetime.now() - start_time).total_seconds() / 60
            
            logger.info("="*80)
            logger.info("FINAL SUMMARY")
            logger.info("="*80)
            logger.info(f"Total Runtime: {elapsed_time:.2f} minutes")
            logger.info(f"Total Cycles: {cycle}")
            logger.info(f"Sentiment Records Generated: {total_sentiment}")
            logger.info(f"Forecast Records Generated: {total_forecasts}")
            logger.info(f"Total Records: {total_sentiment + total_forecasts}")
            logger.info("="*80)
            
            self.close()

    def run_bulk_generation(self):
        """
        Generate bulk data once (non-continuous)
        Used by LOAD_ALL_DATA.bat for one-time generation
        """
        
        logger.info("=" * 80)
        logger.info("BULK DATA GENERATION MODE")
        logger.info("=" * 80)
        
        commodities = self.get_active_commodities()
        logger.info(f"Found {len(commodities)} active commodities")
        
        if not commodities:
            logger.error("No commodities found! Load commodities first")
            return False
        
        total_sentiment = 0
        total_forecasts = 0
        
        # Generate sentiment for all commodities
        logger.info("\n📰 Generating Sentiment Data...")
        logger.info("-" * 80)
        
        for commodity_id, commodity_name in commodities:
            # Generate 50 sentiment records per commodity
            for _ in range(50):
                result = self.generate_sentiment_record(commodity_id, commodity_name)
                if result:
                    total_sentiment += 1
            
            if total_sentiment % 100 == 0:
                logger.info(f"  Generated {total_sentiment} sentiment records...")
        
        logger.info(f"✓ Generated {total_sentiment} sentiment records")
        
        # Generate forecasts for all commodities
        logger.info("\n🔮 Generating Forecast Data...")
        logger.info("-" * 80)
        
        for commodity_id, commodity_name in commodities:
            regions = self.get_commodity_regions(commodity_id)
            
            if not regions:
                logger.warning(f"  No regions found for {commodity_name}, skipping...")
                continue
            
            for region_id in regions:
                count = self.generate_forecast_record(commodity_id, commodity_name, region_id)
                total_forecasts += count
            
            logger.info(f"  {commodity_name}: {len(regions)} regions, {len(regions) * 30} forecasts")
        
        logger.info(f"✓ Generated {total_forecasts} forecast records")
        
        # Summary
        logger.info("\n" + "=" * 80)
        logger.info("BULK GENERATION COMPLETE")
        logger.info("=" * 80)
        logger.info(f"Sentiment Records: {total_sentiment}")
        logger.info(f"Forecast Records: {total_forecasts}")
        logger.info(f"Total Records: {total_sentiment + total_forecasts}")
        logger.info("=" * 80)
        
        self.close()
        return True

def main():
    """Main execution"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Real-time Data Simulator')
    parser.add_argument('--interval', type=int, default=10, 
                       help='Seconds between generation cycles (default: 10)')
    parser.add_argument('--duration', type=int, default=None,
                       help='Total duration in minutes (default: infinite)')
    parser.add_argument('--quick', action='store_true',
                       help='Quick mode: 5 second interval, 5 minute duration')
    parser.add_argument('--bulk', action='store_true',
                       help='Bulk mode: Generate all data once and exit')
    
    args = parser.parse_args()
    
    simulator = RealtimeDataSimulator()
    
    if args.bulk:
        logger.info("BULK MODE: Generating all data once")
        simulator.run_bulk_generation()
    elif args.quick:
        interval = 5
        duration = 5
        logger.info("QUICK MODE: 5 second intervals for 5 minutes")
        simulator.run_continuous(interval_seconds=interval, duration_minutes=duration)
    else:
        interval = args.interval
        duration = args.duration
        simulator.run_continuous(interval_seconds=interval, duration_minutes=duration)

if __name__ == "__main__":
    main()
