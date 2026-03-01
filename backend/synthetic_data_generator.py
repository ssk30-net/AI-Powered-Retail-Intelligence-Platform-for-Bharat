"""
Synthetic Data Generator for AI Market Pulse
Generates realistic synthetic data to augment training datasets
"""

import pandas as pd
import numpy as np
import psycopg2
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import logging
from scipy import stats

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')

def get_db_connection():
    """Create database connection"""
    return psycopg2.connect(DATABASE_URL)

class SyntheticDataGenerator:
    """Generate synthetic market data based on real patterns"""
    
    def __init__(self):
        self.conn = get_db_connection()
        self.cur = self.conn.cursor()
        
    def close(self):
        """Close database connection"""
        self.cur.close()
        self.conn.close()
    
    def get_commodity_stats(self, commodity_id):
        """Get statistical properties of existing commodity data"""
        self.cur.execute("""
            SELECT 
                AVG(price) as mean_price,
                STDDEV(price) as std_price,
                MIN(price) as min_price,
                MAX(price) as max_price,
                COUNT(*) as count
            FROM price_history
            WHERE commodity_id = %s
        """, (commodity_id,))
        
        result = self.cur.fetchone()
        if result and result[4] > 0:  # count > 0
            return {
                'mean': float(result[0]),
                'std': float(result[1]) if result[1] else 0,
                'min': float(result[2]),
                'max': float(result[3]),
                'count': int(result[4])
            }
        return None
    
    def generate_price_series(self, base_price, days=365, volatility=0.02, trend=0.0001):
        """
        Generate synthetic price series using Geometric Brownian Motion
        
        Args:
            base_price: Starting price
            days: Number of days to generate
            volatility: Daily volatility (default 2%)
            trend: Daily drift/trend (default 0.01%)
        """
        prices = [base_price]
        
        for _ in range(days - 1):
            # Geometric Brownian Motion
            random_shock = np.random.normal(0, volatility)
            price_change = prices[-1] * (trend + random_shock)
            new_price = prices[-1] + price_change
            
            # Ensure price stays positive
            new_price = max(new_price, base_price * 0.5)
            prices.append(new_price)
        
        return prices
    
    def add_seasonality(self, prices, period=365, amplitude=0.1):
        """Add seasonal patterns to price series"""
        seasonal_factor = np.sin(2 * np.pi * np.arange(len(prices)) / period)
        seasonal_prices = prices * (1 + amplitude * seasonal_factor)
        return seasonal_prices
    
    def add_noise(self, prices, noise_level=0.01):
        """Add random noise to make data more realistic"""
        noise = np.random.normal(0, noise_level, len(prices))
        noisy_prices = prices * (1 + noise)
        return noisy_prices
    
    def generate_commodity_data(self, commodity_id, num_days=365, num_regions=5):
        """Generate synthetic data for a commodity across multiple regions"""
        logger.info(f"Generating synthetic data for commodity {commodity_id}...")
        
        # Get existing stats
        stats = self.get_commodity_stats(commodity_id)
        if not stats:
            logger.warning(f"No existing data for commodity {commodity_id}, using defaults")
            base_price = 1000
            volatility = 0.02
        else:
            base_price = stats['mean']
            volatility = stats['std'] / stats['mean'] if stats['mean'] > 0 else 0.02
        
        # Get regions
        self.cur.execute("SELECT id FROM regions LIMIT %s", (num_regions,))
        regions = [row[0] for row in self.cur.fetchall()]
        
        if not regions:
            logger.error("No regions found in database")
            return 0
        
        total_generated = 0
        total_skipped = 0
        start_date = datetime.now() - timedelta(days=num_days)
        
        for region_id in regions:
            # Generate base price series
            prices = self.generate_price_series(
                base_price=base_price * np.random.uniform(0.9, 1.1),  # Regional variation
                days=num_days,
                volatility=volatility,
                trend=np.random.uniform(-0.0005, 0.0005)  # Random trend
            )
            
            # Add seasonality
            prices = self.add_seasonality(prices, amplitude=0.05)
            
            # Add noise
            prices = self.add_noise(prices, noise_level=0.01)
            
            # Insert into database
            for day, price in enumerate(prices):
                record_date = start_date + timedelta(days=day)
                
                # Generate volume (correlated with price changes)
                if day > 0:
                    price_change = (prices[day] - prices[day-1]) / prices[day-1]
                    volume = abs(price_change) * 10000 * np.random.uniform(0.8, 1.2)
                else:
                    volume = 5000 * np.random.uniform(0.8, 1.2)
                
                try:
                    # Convert numpy types to Python native types
                    price_val = float(price)
                    volume_val = float(volume)
                    
                    # Check if record already exists
                    self.cur.execute("""
                        SELECT id FROM price_history 
                        WHERE commodity_id = %s AND region_id = %s AND recorded_at = %s
                    """, (commodity_id, region_id, record_date))
                    
                    if self.cur.fetchone() is None:
                        self.cur.execute("""
                            INSERT INTO price_history (commodity_id, region_id, price, volume, source, recorded_at)
                            VALUES (%s, %s, %s, %s, %s, %s)
                        """, (commodity_id, region_id, round(price_val, 2), round(volume_val, 2), 'SYNTHETIC', record_date))
                        total_generated += 1
                    else:
                        total_skipped += 1
                    
                except Exception as e:
                    logger.error(f"Error inserting synthetic data: {e}")
                    self.conn.rollback()
                    continue
            
            if (total_generated + total_skipped) % 500 == 0:
                self.conn.commit()
                logger.info(f"Processed {total_generated + total_skipped} records (Generated: {total_generated}, Skipped: {total_skipped})")
        
        self.conn.commit()
        logger.info(f"✓ Synthetic price data: {total_generated} new records generated, {total_skipped} duplicates skipped")
        return total_generated
    
    def generate_sentiment_data(self, commodity_id, num_records=100):
        """Generate synthetic sentiment data"""
        logger.info(f"Generating sentiment data for commodity {commodity_id}...")
        
        sentiments = ['positive', 'negative', 'neutral']
        sources = ['news', 'social', 'article']
        
        titles = [
            "Market Analysis: {} Shows Strong Performance",
            "{} Prices Expected to Rise",
            "Supply Chain Issues Affect {}",
            "Demand for {} Increases",
            "{} Market Outlook Remains Stable",
            "Weather Conditions Impact {} Production",
            "Export Demand for {} Grows",
            "{} Inventory Levels Decline"
        ]
        
        total_generated = 0
        
        # Get commodity name
        self.cur.execute("SELECT name FROM commodities WHERE id = %s", (commodity_id,))
        commodity_name = self.cur.fetchone()[0]
        
        for _ in range(num_records):
            sentiment = np.random.choice(sentiments, p=[0.4, 0.2, 0.4])  # 40% positive, 20% negative, 40% neutral
            
            if sentiment == 'positive':
                score = np.random.uniform(0.3, 1.0)
            elif sentiment == 'negative':
                score = np.random.uniform(-1.0, -0.3)
            else:
                score = np.random.uniform(-0.2, 0.2)
            
            title = np.random.choice(titles).format(commodity_name)
            source_type = np.random.choice(sources)
            published_at = datetime.now() - timedelta(days=np.random.randint(0, 90))
            
            try:
                # Convert numpy types to Python native types
                score_val = float(score)
                
                self.cur.execute("""
                    INSERT INTO sentiment_data (
                        commodity_id, source_type, title, sentiment_score, 
                        sentiment_label, published_at
                    )
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (commodity_id, source_type, title, round(score_val, 4), sentiment, published_at))
                
                total_generated += 1
                
            except Exception as e:
                logger.error(f"Error inserting sentiment data: {e}")
                self.conn.rollback()
                continue
        
        self.conn.commit()
        logger.info(f"✓ Generated {total_generated} sentiment records")
        return total_generated
    
    def generate_forecasts(self, commodity_id, days_ahead=30):
        """Generate synthetic forecast data based on recent trends"""
        logger.info(f"Generating forecasts for commodity {commodity_id}...")
        
        # Get recent price data
        self.cur.execute("""
            SELECT price, recorded_at
            FROM price_history
            WHERE commodity_id = %s
            ORDER BY recorded_at DESC
            LIMIT 90
        """, (commodity_id,))
        
        recent_data = self.cur.fetchall()
        if len(recent_data) < 30:
            logger.warning(f"Not enough data for commodity {commodity_id}")
            return 0
        
        prices = [row[0] for row in reversed(recent_data)]
        
        # Calculate trend
        x = np.arange(len(prices))
        slope, intercept, _, _, _ = stats.linregress(x, prices)
        
        # Get regions
        self.cur.execute("""
            SELECT DISTINCT region_id 
            FROM price_history 
            WHERE commodity_id = %s 
            LIMIT 5
        """, (commodity_id,))
        regions = [row[0] for row in self.cur.fetchall()]
        
        total_generated = 0
        
        for region_id in regions:
            for day in range(1, days_ahead + 1):
                forecast_date = datetime.now().date() + timedelta(days=day)
                
                # Predict price using trend + some uncertainty
                predicted_price = intercept + slope * (len(prices) + day)
                uncertainty = abs(predicted_price) * 0.1  # 10% uncertainty
                
                lower_bound = predicted_price - uncertainty
                upper_bound = predicted_price + uncertainty
                confidence = max(0.5, 1.0 - (day / days_ahead) * 0.3)  # Confidence decreases with time
                
                try:
                    # Convert numpy types to Python native types
                    predicted_price_val = float(predicted_price)
                    lower_bound_val = float(lower_bound)
                    upper_bound_val = float(upper_bound)
                    confidence_val = float(confidence)
                    
                    # Check if forecast already exists
                    self.cur.execute("""
                        SELECT id FROM forecasts 
                        WHERE commodity_id = %s AND region_id = %s AND forecast_date = %s
                    """, (commodity_id, region_id, forecast_date))
                    
                    if self.cur.fetchone() is None:
                        self.cur.execute("""
                            INSERT INTO forecasts (
                                commodity_id, region_id, forecast_date, predicted_price,
                                lower_bound, upper_bound, confidence_score, model_version
                            )
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                        """, (commodity_id, region_id, forecast_date, round(predicted_price_val, 2),
                              round(lower_bound_val, 2), round(upper_bound_val, 2), round(confidence_val, 4), 'synthetic_v1'))
                        total_generated += 1
                    
                except Exception as e:
                    logger.error(f"Error inserting forecast: {e}")
                    self.conn.rollback()
                    continue
        
        self.conn.commit()
        logger.info(f"✓ Generated {total_generated} forecast records")
        return total_generated

def main():
    """Main execution - Only generates price history"""
    logger.info("=" * 60)
    logger.info("AI Market Pulse - Synthetic Price History Generator")
    logger.info("=" * 60)
    
    generator = SyntheticDataGenerator()
    
    try:
        # Get all commodities
        generator.cur.execute("SELECT id, name FROM commodities WHERE is_active = TRUE")
        commodities = generator.cur.fetchall()
        
        logger.info(f"Found {len(commodities)} commodities")
        
        total_price_records = 0
        
        for commodity_id, commodity_name in commodities:
            logger.info(f"\nProcessing: {commodity_name}")
            
            # Generate price data (1 year, 5 regions)
            price_count = generator.generate_commodity_data(
                commodity_id=commodity_id,
                num_days=365,
                num_regions=5
            )
            total_price_records += price_count
        
        logger.info("=" * 60)
        logger.info("Synthetic Price History Generation Complete!")
        logger.info(f"Total Price Records Generated: {total_price_records}")
        logger.info("=" * 60)
        logger.info("Note: Sentiment and forecast data will be generated separately")
        logger.info("=" * 60)
        
    except Exception as e:
        logger.error(f"Error in main execution: {e}")
        raise
    finally:
        generator.close()

if __name__ == "__main__":
    main()
