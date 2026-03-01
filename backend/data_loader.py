"""
Data Loader Script for AI Market Pulse
Loads datasets into PostgreSQL database
"""

import pandas as pd
import psycopg2
from psycopg2.extras import execute_batch
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Database connection
DATABASE_URL = os.getenv('DATABASE_URL')

def get_db_connection():
    """Create database connection"""
    return psycopg2.connect(DATABASE_URL)

def load_commodity_prices():
    """
    Load Indian commodity price data
    Files: comodity_price_Dataset.csv, datasets/Indian_commodity_price.csv
    Purpose: Historical price data for forecasting and analysis
    """
    logger.info("Loading commodity price data...")
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Load both commodity price files
    files = [
        '../comodity_price_Dataset.csv',
        '../datasets/Indian_commodity_price.csv'
    ]
    
    total_loaded = 0
    total_skipped = 0
    
    for file_path in files:
        if not os.path.exists(file_path):
            logger.warning(f"File not found: {file_path}")
            continue
            
        logger.info(f"Processing {file_path}...")
        df = pd.read_csv(file_path)
        
        # Clean column names
        df.columns = df.columns.str.replace('_x0020_', '_').str.lower()
        
        # Process each row
        for _, row in df.iterrows():
            try:
                # Get or create commodity
                commodity_name = row['commodity']
                variety = row.get('variety', '')
                
                # Check if commodity exists
                cur.execute("SELECT id FROM commodities WHERE name = %s", (commodity_name,))
                result = cur.fetchone()
                
                if result:
                    commodity_id = result[0]
                else:
                    # Insert new commodity
                    cur.execute("""
                        INSERT INTO commodities (name, category, unit, description)
                        VALUES (%s, %s, %s, %s)
                        RETURNING id
                    """, (commodity_name, 'Agricultural', 'quintal', variety))
                    commodity_id = cur.fetchone()[0]
                
                # Get or create region
                market = row.get('market', '')
                district = row.get('district', '')
                state = row.get('state', '')
                
                region_name = market or district or 'Unknown'
                
                # Check if region exists
                cur.execute("SELECT id FROM regions WHERE name = %s AND state = %s", 
                          (region_name, state))
                result = cur.fetchone()
                
                if result:
                    region_id = result[0]
                else:
                    # Insert new region
                    cur.execute("""
                        INSERT INTO regions (name, state, country)
                        VALUES (%s, %s, %s)
                        RETURNING id
                    """, (region_name, state, 'India'))
                    region_id = cur.fetchone()[0]
                
                # Parse date
                arrival_date = pd.to_datetime(row['arrival_date'], format='%d/%m/%Y', errors='coerce')
                if pd.isna(arrival_date):
                    continue
                
                # Get prices
                modal_price = float(row.get('modal_price', 0))
                if modal_price <= 0:
                    continue
                
                min_price = float(row.get('min_price', modal_price))
                max_price = float(row.get('max_price', modal_price))
                
                # Check if price history already exists
                cur.execute("""
                    SELECT id FROM price_history 
                    WHERE commodity_id = %s AND region_id = %s AND recorded_at = %s
                """, (commodity_id, region_id, arrival_date))
                
                if cur.fetchone() is None:
                    # Insert price history
                    cur.execute("""
                        INSERT INTO price_history (commodity_id, region_id, price, volume, source, recorded_at)
                        VALUES (%s, %s, %s, %s, %s, %s)
                    """, (commodity_id, region_id, modal_price, None, 'AGMARKNET', arrival_date))
                    total_loaded += 1
                else:
                    total_skipped += 1
                
                if (total_loaded + total_skipped) % 100 == 0:
                    conn.commit()
                    logger.info(f"Processed {total_loaded + total_skipped} records (Loaded: {total_loaded}, Skipped: {total_skipped})")
                    
            except Exception as e:
                logger.error(f"Error processing row: {e}")
                conn.rollback()
                continue
    
    conn.commit()
    cur.close()
    conn.close()
    
    logger.info(f"✓ Commodity prices: {total_loaded} new records loaded, {total_skipped} duplicates skipped")
    return total_loaded

def load_sales_data():
    """
    Load sales data for demand analysis
    Files: datasets/cleaned_dataset.csv, datasets/archive (3)/Sale Report.csv
    Purpose: Demand patterns and sales trends
    """
    logger.info("Loading sales data...")
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    file_path = '../datasets/cleaned_dataset.csv'
    
    if not os.path.exists(file_path):
        logger.warning(f"File not found: {file_path}")
        return 0
    
    df = pd.read_csv(file_path)
    total_loaded = 0
    total_skipped = 0
    
    # Group by product category to create commodity demand data
    for category in df['product_category'].unique():
        try:
            category_data = df[df['product_category'] == category]
            
            # Check if commodity exists
            cur.execute("SELECT id FROM commodities WHERE name = %s", (category,))
            result = cur.fetchone()
            
            if result:
                commodity_id = result[0]
            else:
                # Insert new commodity
                cur.execute("""
                    INSERT INTO commodities (name, category, unit)
                    VALUES (%s, %s, %s)
                    RETURNING id
                """, (category, 'Retail', 'units'))
                commodity_id = cur.fetchone()[0]
            
            # Check if region exists
            cur.execute("SELECT id FROM regions WHERE name = %s", ('Global',))
            result = cur.fetchone()
            
            if result:
                region_id = result[0]
            else:
                # Insert new region
                cur.execute("""
                    INSERT INTO regions (name, state, country)
                    VALUES (%s, %s, %s)
                    RETURNING id
                """, ('Global', 'N/A', 'Global'))
                region_id = cur.fetchone()[0]
            
            # Aggregate sales by date
            category_data['order_date'] = pd.to_datetime(category_data['order_date'])
            daily_sales = category_data.groupby('order_date').agg({
                'discounted_price': 'mean',
                'quantity_sold': 'sum',
                'total_revenue': 'sum'
            }).reset_index()
            
            # Insert as price history (using average price)
            for _, row in daily_sales.iterrows():
                # Check if record already exists
                cur.execute("""
                    SELECT id FROM price_history 
                    WHERE commodity_id = %s AND region_id = %s AND recorded_at = %s
                """, (commodity_id, region_id, row['order_date']))
                
                if cur.fetchone() is None:
                    cur.execute("""
                        INSERT INTO price_history (commodity_id, region_id, price, volume, source, recorded_at)
                        VALUES (%s, %s, %s, %s, %s, %s)
                    """, (commodity_id, region_id, row['discounted_price'], row['quantity_sold'], 'SALES_DATA', row['order_date']))
                    total_loaded += 1
                else:
                    total_skipped += 1
            
            if (total_loaded + total_skipped) % 50 == 0:
                conn.commit()
                logger.info(f"Processed {total_loaded + total_skipped} sales records (Loaded: {total_loaded}, Skipped: {total_skipped})")
                
        except Exception as e:
            logger.error(f"Error processing category {category}: {e}")
            conn.rollback()
            continue
    
    conn.commit()
    cur.close()
    conn.close()
    
    logger.info(f"✓ Sales data: {total_loaded} new records loaded, {total_skipped} duplicates skipped")
    return total_loaded

def load_stock_data():
    """
    Load stock price data for market correlation
    Files: datasets/archive/KO_CocaCola_Stock_Prices_1980_2026.csv
    Purpose: Market sentiment and correlation analysis
    """
    logger.info("Loading stock data...")
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    file_path = '../datasets/archive/KO_CocaCola_Stock_Prices_1980_2026.csv'
    
    if not os.path.exists(file_path):
        logger.warning(f"File not found: {file_path}")
        return 0
    
    df = pd.read_csv(file_path)
    total_loaded = 0
    
    # Check if commodity exists
    cur.execute("SELECT id FROM commodities WHERE name = %s", ('Coca-Cola Stock',))
    result = cur.fetchone()
    
    if result:
        commodity_id = result[0]
    else:
        # Create commodity for stock
        cur.execute("""
            INSERT INTO commodities (name, category, unit, description)
            VALUES (%s, %s, %s, %s)
            RETURNING id
        """, ('Coca-Cola Stock', 'Financial', 'shares', 'KO Stock Price'))
        commodity_id = cur.fetchone()[0]
    
    # Check if region exists
    cur.execute("SELECT id FROM regions WHERE name = %s", ('NYSE',))
    result = cur.fetchone()
    
    if result:
        region_id = result[0]
    else:
        # Get or create default region
        cur.execute("""
            INSERT INTO regions (name, state, country)
            VALUES (%s, %s, %s)
            RETURNING id
        """, ('NYSE', 'New York', 'USA'))
        region_id = cur.fetchone()[0]
    
    # Process stock data
    df['Date'] = pd.to_datetime(df['Date'])
    
    total_skipped = 0
    
    for _, row in df.iterrows():
        try:
            # Check if record already exists
            cur.execute("""
                SELECT id FROM price_history 
                WHERE commodity_id = %s AND region_id = %s AND recorded_at = %s
            """, (commodity_id, region_id, row['Date']))
            
            if cur.fetchone() is None:
                cur.execute("""
                    INSERT INTO price_history (commodity_id, region_id, price, volume, source, recorded_at)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (commodity_id, region_id, row['Close'], row.get('Volume', 0), 'STOCK_MARKET', row['Date']))
                total_loaded += 1
            else:
                total_skipped += 1
            
            if (total_loaded + total_skipped) % 500 == 0:
                conn.commit()
                logger.info(f"Processed {total_loaded + total_skipped} stock records (Loaded: {total_loaded}, Skipped: {total_skipped})")
                
        except Exception as e:
            logger.error(f"Error processing stock row: {e}")
            conn.rollback()
            continue
    
    conn.commit()
    cur.close()
    conn.close()
    
    logger.info(f"✓ Stock data: {total_loaded} new records loaded, {total_skipped} duplicates skipped")
    return total_loaded

def main():
    """Main execution"""
    logger.info("=" * 60)
    logger.info("AI Market Pulse - Data Loader")
    logger.info("=" * 60)
    
    try:
        # Load all datasets
        commodity_count = load_commodity_prices()
        sales_count = load_sales_data()
        stock_count = load_stock_data()
        
        logger.info("=" * 60)
        logger.info("Data Loading Complete!")
        logger.info(f"Total Records Loaded:")
        logger.info(f"  - Commodity Prices: {commodity_count}")
        logger.info(f"  - Sales Data: {sales_count}")
        logger.info(f"  - Stock Data: {stock_count}")
        logger.info(f"  - TOTAL: {commodity_count + sales_count + stock_count}")
        logger.info("=" * 60)
        
    except Exception as e:
        logger.error(f"Error in main execution: {e}")
        raise

if __name__ == "__main__":
    main()
