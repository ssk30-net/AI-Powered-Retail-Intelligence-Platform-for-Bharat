"""
Generate ML Training Data (Sentiment + Forecasts)
Optimized for model training - generates sufficient data quickly
"""

import psycopg2
import numpy as np
from datetime import datetime, timedelta
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

class MLTrainingDataGenerator:
    """Generate sentiment and forecast data for ML training"""
    
    def __init__(self):
        self.conn = psycopg2.connect(DATABASE_URL)
        self.cur = self.conn.cursor()
        
        # Sentiment templates
        self.sentiment_templates = {
            'positive': [
                "{} Prices Rally on Strong Demand Outlook",
                "Export Orders Boost {} Market Confidence",
                "{} Production Quality Exceeds Expectations",
                "Favorable Conditions Support {} Price Gains",
                "Global Demand for {} Reaches Record High",
                "{} Supply Tightness Pushes Prices Higher",
                "Trade Agreement Boosts {} Export Potential",
                "Economic Growth Lifts {} Market Sentiment",
                "{} Inventory Shortage Supports Prices",
                "Analysts Raise {} Price Targets",
                "{} Market Shows Strong Bullish Momentum",
                "Weather Patterns Favor {} Price Increase",
                "Consumer Demand for {} Surges Unexpectedly",
                "{} Futures Hit Multi-Month High",
                "Industry Report Bullish on {} Outlook"
            ],
            'negative': [
                "{} Prices Decline on Oversupply Concerns",
                "Weak Demand Pressures {} Market Lower",
                "{} Production Surplus Weighs on Prices",
                "Adverse Conditions Impact {} Quality",
                "Export Restrictions Hurt {} Demand",
                "{} Inventory Builds to Multi-Year High",
                "Trade Tensions Dampen {} Market Outlook",
                "Economic Slowdown Reduces {} Consumption",
                "{} Prices Fall on Harvest Pressure",
                "Analysts Cut {} Price Forecasts",
                "{} Market Faces Bearish Headwinds",
                "Weather Concerns Ease, {} Prices Drop",
                "Consumer Spending on {} Weakens",
                "{} Futures Slide to New Lows",
                "Industry Report Warns of {} Oversupply"
            ],
            'neutral': [
                "{} Market Consolidates Recent Moves",
                "{} Prices Hold Steady in Range-Bound Trade",
                "Mixed Signals Keep {} Market Balanced",
                "{} Trading Remains Quiet Ahead of Data",
                "Market Participants Await {} Direction",
                "{} Prices Stable Despite Volatility",
                "Traders Cautious on {} Near-Term Outlook",
                "{} Market Digests Recent Price Action",
                "Technical Levels Guide {} Trading",
                "{} Prices Unchanged in Sideways Market",
                "{} Market Awaits Fundamental Catalyst",
                "Balanced Supply-Demand Keeps {} Flat",
                "{} Trading Volume Light, Prices Steady",
                "Market Sentiment Mixed on {} Outlook",
                "{} Prices Consolidate After Recent Rally"
            ]
        }
        
        self.sources = ['news', 'social', 'article', 'blog', 'report', 'analysis']
        
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
            ORDER BY region_id
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
    
    def generate_sentiment_batch(self, commodity_id, commodity_name, count=50):
        """Generate batch of sentiment records for a commodity"""
        
        records_generated = 0
        
        # Generate sentiment over the past 90 days
        for i in range(count):
            # Determine sentiment (40% positive, 20% negative, 40% neutral)
            sentiment_type = np.random.choice(
                ['positive', 'negative', 'neutral'],
                p=[0.4, 0.2, 0.4]
            )
            
            # Generate sentiment score based on type
            if sentiment_type == 'positive':
                score = float(np.random.uniform(0.3, 1.0))
                headline = random.choice(self.sentiment_templates['positive']).format(commodity_name)
            elif sentiment_type == 'negative':
                score = float(np.random.uniform(-1.0, -0.3))
                headline = random.choice(self.sentiment_templates['negative']).format(commodity_name)
            else:
                score = float(np.random.uniform(-0.2, 0.2))
                headline = random.choice(self.sentiment_templates['neutral']).format(commodity_name)
            
            # Random source
            source = random.choice(self.sources)
            
            # Published time (spread over last 90 days)
            days_ago = int(np.random.exponential(15))  # More recent data weighted higher
            days_ago = min(days_ago, 90)
            published_at = datetime.now() - timedelta(days=days_ago, hours=np.random.randint(0, 24))
            
            try:
                self.cur.execute("""
                    INSERT INTO sentiment_data (
                        commodity_id, source_type, title, sentiment_score,
                        sentiment_label, published_at
                    )
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (
                    commodity_id,
                    source,
                    headline,
                    round(score, 4),
                    sentiment_type,
                    published_at
                ))
                
                records_generated += 1
                
            except Exception as e:
                logger.error(f"Error inserting sentiment: {e}")
                self.conn.rollback()
                continue
        
        self.conn.commit()
        return records_generated
    
    def generate_forecast_batch(self, commodity_id, commodity_name, region_id, days_ahead=30):
        """Generate forecast records for a commodity-region pair"""
        
        # Get recent prices
        recent_data = self.get_recent_prices(commodity_id, region_id, days=90)
        
        # Generate forecasts with ANY available data (even 1 day)
        if len(recent_data) < 1:
            logger.warning(f"No data for {commodity_name} in region {region_id}")
            return 0
        
        prices = [float(row[0]) for row in reversed(recent_data)]
        
        # Always generate full forecast horizon regardless of data availability
        logger.info(f"  📊 {commodity_name} region {region_id}: {len(prices)} days of data available")
        
        # Calculate trend using linear regression or simple methods
        try:
            if len(prices) >= 2:
                # Use linear regression if we have at least 2 points
                x = np.arange(len(prices))
                slope, intercept, r_value, _, _ = stats.linregress(x, prices)
            else:
                # Use the single price point as baseline
                slope = 0
                intercept = float(prices[0])
                r_value = 0.5
        except Exception as e:
            # Fallback: use average or last price
            logger.info(f"  ℹ️ Using simple average for {commodity_name} region {region_id}")
            slope = 0
            intercept = float(np.mean(prices))
            r_value = 0.5
        
        # Calculate volatility (or use default if not enough data)
        if len(prices) > 1:
            volatility = float(np.std(prices))
        else:
            # Use 10% of price as default volatility
            volatility = float(prices[0]) * 0.1
        
        records_generated = 0
        
        for day in range(1, days_ahead + 1):
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
            random_factor = float(np.random.normal(0, volatility * 0.05))
            predicted_price += random_factor
            
            # Ensure price stays positive and reasonable
            predicted_price = max(predicted_price, prices[-1] * 0.5)
            predicted_price = min(predicted_price, prices[-1] * 2.0)
            
            # Calculate uncertainty (increases with time)
            base_uncertainty = volatility * 0.1
            time_factor = 1 + (day / days_ahead) * 0.5
            uncertainty = base_uncertainty * time_factor
            
            lower_bound = predicted_price - uncertainty
            upper_bound = predicted_price + uncertainty
            
            # Confidence calculation based on data availability
            if len(prices) >= 30:
                # Good data: high confidence
                base_confidence = 0.7 + (abs(r_value) ** 2) * 0.2
            elif len(prices) >= 7:
                # Limited data: medium confidence
                base_confidence = 0.6 + (abs(r_value) ** 2) * 0.15
            else:
                # Very limited data: lower confidence but still generate
                base_confidence = 0.5 + (abs(r_value) ** 2) * 0.1
            
            time_decay = (1 - day / days_ahead) * 0.2
            confidence = base_confidence + time_decay
            confidence = max(0.5, min(0.99, float(confidence)))
            
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
                    round(confidence, 4),
                    'ml_training_v1',
                    datetime.now()
                ))
                
                records_generated += 1
                
            except Exception as e:
                logger.error(f"Error inserting forecast: {e}")
                self.conn.rollback()
                continue
        
        self.conn.commit()
        return records_generated
    
    def generate_all_data(self, sentiment_per_commodity=50, forecast_days=30):
        """Generate all sentiment and forecast data"""
        
        logger.info("=" * 80)
        logger.info("ML TRAINING DATA GENERATOR")
        logger.info("=" * 80)
        
        commodities = self.get_active_commodities()
        logger.info(f"Found {len(commodities)} active commodities")
        
        if not commodities:
            logger.error("No commodities found! Run LOAD_DATA.bat first")
            return False
        
        total_sentiment = 0
        total_forecasts = 0
        no_data_commodities = []
        
        # Generate data for each commodity
        for idx, (commodity_id, commodity_name) in enumerate(commodities, 1):
            logger.info(f"\n[{idx}/{len(commodities)}] Processing: {commodity_name}")
            logger.info("-" * 80)
            
            # Generate sentiment data
            logger.info(f"  📰 Generating {sentiment_per_commodity} sentiment records...")
            sentiment_count = self.generate_sentiment_batch(
                commodity_id, 
                commodity_name, 
                count=sentiment_per_commodity
            )
            total_sentiment += sentiment_count
            logger.info(f"     ✓ Generated {sentiment_count} sentiment records")
            
            # Generate forecasts for each region
            regions = self.get_commodity_regions(commodity_id)
            
            if not regions:
                logger.warning(f"     ⚠️ No regions found, skipping forecasts")
                no_data_commodities.append(commodity_name)
                continue
            
            logger.info(f"  🔮 Generating forecasts for {len(regions)} regions...")
            forecast_count = 0
            
            for region_id in regions:
                count = self.generate_forecast_batch(
                    commodity_id,
                    commodity_name,
                    region_id,
                    days_ahead=forecast_days
                )
                forecast_count += count
            
            total_forecasts += forecast_count
            
            if forecast_count > 0:
                logger.info(f"     ✓ Generated {forecast_count} forecast records")
            else:
                logger.warning(f"     ⚠️ No forecasts generated (no price data)")
                no_data_commodities.append(commodity_name)
        
        # Final summary
        logger.info("\n" + "=" * 80)
        logger.info("GENERATION COMPLETE!")
        logger.info("=" * 80)
        logger.info(f"Sentiment Records: {total_sentiment:,}")
        logger.info(f"Forecast Records:  {total_forecasts:,}")
        logger.info(f"Total Records:     {total_sentiment + total_forecasts:,}")
        
        # Show commodities with no data
        if no_data_commodities:
            logger.info("\n⚠️ Commodities with No Price Data:")
            for commodity in no_data_commodities:
                logger.info(f"  • {commodity}")
            logger.info("  (Run LOAD_ALL_DATA.bat to add price history)")
        else:
            logger.info("\n✅ All commodities have forecast data!")
        
        logger.info("=" * 80)
        
        # Verify data
        logger.info("\nVerifying data in database...")
        self.cur.execute("SELECT COUNT(*) FROM sentiment_data")
        db_sentiment = self.cur.fetchone()[0]
        
        self.cur.execute("SELECT COUNT(*) FROM forecasts")
        db_forecasts = self.cur.fetchone()[0]
        
        logger.info(f"Database sentiment_data: {db_sentiment:,}")
        logger.info(f"Database forecasts:      {db_forecasts:,}")
        
        if db_sentiment > 0 and db_forecasts > 0:
            logger.info("\n✅ SUCCESS! Data ready for ML training")
            logger.info("\nNext steps:")
            logger.info("  1. Run CHECK_DATABASE.bat to verify")
            logger.info("  2. Run STEP1_VERIFY_DATA.bat")
            logger.info("  3. Run STEP2_EXPORT_DATA.bat")
            return True
        else:
            logger.error("\n❌ FAILED! Data not generated properly")
            return False

def main():
    """Main execution"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Generate ML Training Data')
    parser.add_argument('--sentiment', type=int, default=50,
                       help='Sentiment records per commodity (default: 50)')
    parser.add_argument('--forecast-days', type=int, default=30,
                       help='Forecast days ahead (default: 30)')
    
    args = parser.parse_args()
    
    generator = MLTrainingDataGenerator()
    
    try:
        success = generator.generate_all_data(
            sentiment_per_commodity=args.sentiment,
            forecast_days=args.forecast_days
        )
        
        if not success:
            exit(1)
            
    except Exception as e:
        logger.error(f"Error: {e}")
        raise
    finally:
        generator.close()

if __name__ == "__main__":
    main()
