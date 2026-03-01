"""
STEP 2: Export Training Dataset
Extract and prepare data from RDS for ML training
"""

import psycopg2
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
DATABASE_URL = os.getenv('DATABASE_URL')

class TrainingDataExporter:
    """Export training data from RDS"""
    
    def __init__(self):
        self.conn = psycopg2.connect(DATABASE_URL)
        self.output_dir = 'ml_data'
        
        # Create output directory
        os.makedirs(self.output_dir, exist_ok=True)
        
    def close(self):
        """Close database connection"""
        self.conn.close()
    
    def export_price_data(self):
        """Export price history with basic features"""
        logger.info("Exporting price history data...")
        
        query = """
        SELECT 
            ph.id,
            ph.commodity_id,
            c.name as commodity_name,
            c.category as commodity_category,
            ph.region_id,
            r.name as region_name,
            r.state as region_state,
            r.country as region_country,
            ph.recorded_at as date,
            ph.price,
            ph.volume,
            ph.source,
            EXTRACT(DOW FROM ph.recorded_at) as day_of_week,
            EXTRACT(DAY FROM ph.recorded_at) as day,
            EXTRACT(MONTH FROM ph.recorded_at) as month,
            EXTRACT(YEAR FROM ph.recorded_at) as year,
            EXTRACT(QUARTER FROM ph.recorded_at) as quarter,
            CASE WHEN EXTRACT(DOW FROM ph.recorded_at) IN (0, 6) THEN 1 ELSE 0 END as is_weekend
        FROM price_history ph
        JOIN commodities c ON ph.commodity_id = c.id
        JOIN regions r ON ph.region_id = r.id
        ORDER BY ph.commodity_id, ph.region_id, ph.recorded_at
        """
        
        df = pd.read_sql_query(query, self.conn)
        logger.info(f"Extracted {len(df)} price records")
        
        # Log date range if data exists
        if len(df) > 0:
            logger.info(f"Date range: {df['date'].min()} to {df['date'].max()}")
        
        return df
    
    def export_sentiment_data(self):
        """Export sentiment data"""
        logger.info("Exporting sentiment data...")
        
        query = """
        SELECT 
            commodity_id,
            DATE(published_at) as date,
            AVG(sentiment_score) as avg_sentiment,
            COUNT(*) as sentiment_count,
            SUM(CASE WHEN sentiment_label = 'positive' THEN 1 ELSE 0 END) as positive_count,
            SUM(CASE WHEN sentiment_label = 'negative' THEN 1 ELSE 0 END) as negative_count,
            SUM(CASE WHEN sentiment_label = 'neutral' THEN 1 ELSE 0 END) as neutral_count
        FROM sentiment_data
        GROUP BY commodity_id, DATE(published_at)
        """
        
        df = pd.read_sql_query(query, self.conn)
        logger.info(f"Extracted {len(df)} sentiment records")
        
        # Log date range if data exists
        if len(df) > 0:
            logger.info(f"Date range: {df['date'].min()} to {df['date'].max()}")
        
        return df
    
    def merge_datasets(self, price_df, sentiment_df):
        """Merge price and sentiment data"""
        logger.info("Merging datasets...")
        
        # Convert date columns to date type
        price_df['date'] = pd.to_datetime(price_df['date']).dt.date
        sentiment_df['date'] = pd.to_datetime(sentiment_df['date']).dt.date
        
        # Merge on commodity_id and date
        merged_df = price_df.merge(
            sentiment_df,
            on=['commodity_id', 'date'],
            how='left'
        )
        
        # Fill missing sentiment values with 0
        sentiment_cols = ['avg_sentiment', 'sentiment_count', 'positive_count', 'negative_count', 'neutral_count']
        merged_df[sentiment_cols] = merged_df[sentiment_cols].fillna(0)
        
        logger.info(f"Merged dataset: {len(merged_df)} records")
        
        return merged_df
    
    def create_lag_features(self, df):
        """Create lag features (historical prices)"""
        logger.info("Creating lag features...")
        
        # Sort by commodity, region, and date
        df = df.sort_values(['commodity_id', 'region_id', 'date'])
        
        # Create lag features for different time periods
        lag_periods = [1, 7, 14, 30]
        
        for lag in lag_periods:
            df[f'price_lag_{lag}'] = df.groupby(['commodity_id', 'region_id'])['price'].shift(lag)
            
            if 'volume' in df.columns:
                df[f'volume_lag_{lag}'] = df.groupby(['commodity_id', 'region_id'])['volume'].shift(lag)
        
        logger.info(f"Created lag features for periods: {lag_periods}")
        
        return df
    
    def create_rolling_features(self, df):
        """Create rolling window features"""
        logger.info("Creating rolling window features...")
        
        # Rolling windows
        windows = [7, 14, 30]
        
        for window in windows:
            # Rolling mean
            df[f'price_rolling_mean_{window}'] = df.groupby(['commodity_id', 'region_id'])['price'].transform(
                lambda x: x.rolling(window=window, min_periods=1).mean()
            )
            
            # Rolling std (volatility)
            df[f'price_rolling_std_{window}'] = df.groupby(['commodity_id', 'region_id'])['price'].transform(
                lambda x: x.rolling(window=window, min_periods=1).std()
            )
            
            # Rolling min/max
            df[f'price_rolling_min_{window}'] = df.groupby(['commodity_id', 'region_id'])['price'].transform(
                lambda x: x.rolling(window=window, min_periods=1).min()
            )
            
            df[f'price_rolling_max_{window}'] = df.groupby(['commodity_id', 'region_id'])['price'].transform(
                lambda x: x.rolling(window=window, min_periods=1).max()
            )
        
        logger.info(f"Created rolling features for windows: {windows}")
        
        return df
    
    def create_price_change_features(self, df):
        """Create price change features"""
        logger.info("Creating price change features...")
        
        # Sort by commodity, region, and date
        df = df.sort_values(['commodity_id', 'region_id', 'date'])
        
        # Price changes
        df['price_change_1d'] = df.groupby(['commodity_id', 'region_id'])['price'].pct_change()
        df['price_change_7d'] = df.groupby(['commodity_id', 'region_id'])['price'].pct_change(periods=7)
        df['price_change_30d'] = df.groupby(['commodity_id', 'region_id'])['price'].pct_change(periods=30)
        
        # Price momentum (7-day trend)
        df['price_momentum_7d'] = df.groupby(['commodity_id', 'region_id'])['price_change_1d'].transform(
            lambda x: x.rolling(window=7, min_periods=1).mean()
        )
        
        logger.info("Created price change features")
        
        return df
    
    def create_target_variable(self, df):
        """Create target variable (future price)"""
        logger.info("Creating target variable...")
        
        # Target: price 7 days in the future
        df['target_price_7d'] = df.groupby(['commodity_id', 'region_id'])['price'].shift(-7)
        
        # Target: price change 7 days in the future
        df['target_price_change_7d'] = (df['target_price_7d'] - df['price']) / df['price']
        
        logger.info("Created target variables")
        
        return df
    
    def clean_data(self, df):
        """Clean and prepare final dataset"""
        logger.info("Cleaning data...")
        
        # Remove rows with NaN in target variable
        initial_count = len(df)
        df = df.dropna(subset=['target_price_7d'])
        logger.info(f"Removed {initial_count - len(df)} rows with missing target")
        
        # Fill remaining NaN values with forward fill then backward fill
        # Using pandas 2.0+ syntax
        df = df.ffill().bfill()
        
        # Replace any remaining NaN with 0
        df = df.fillna(0)
        
        # Remove infinite values
        df = df.replace([np.inf, -np.inf], 0)
        
        logger.info(f"Final dataset: {len(df)} records")
        
        return df
    
    def save_datasets(self, df):
        """Save training, validation, and test datasets"""
        logger.info("Saving datasets...")
        
        # Sort by date
        df = df.sort_values('date')
        
        # Split by time (80% train, 10% validation, 10% test)
        train_size = int(len(df) * 0.8)
        val_size = int(len(df) * 0.9)
        
        train_df = df[:train_size]
        val_df = df[train_size:val_size]
        test_df = df[val_size:]
        
        # Save to CSV
        train_path = os.path.join(self.output_dir, 'training_data.csv')
        val_path = os.path.join(self.output_dir, 'validation_data.csv')
        test_path = os.path.join(self.output_dir, 'test_data.csv')
        full_path = os.path.join(self.output_dir, 'full_dataset.csv')
        
        train_df.to_csv(train_path, index=False)
        val_df.to_csv(val_path, index=False)
        test_df.to_csv(test_path, index=False)
        df.to_csv(full_path, index=False)
        
        logger.info(f"✓ Training data saved: {train_path} ({len(train_df)} records)")
        logger.info(f"✓ Validation data saved: {val_path} ({len(val_df)} records)")
        logger.info(f"✓ Test data saved: {test_path} ({len(test_df)} records)")
        logger.info(f"✓ Full dataset saved: {full_path} ({len(df)} records)")
        
        # Save feature names
        feature_cols = [col for col in df.columns if col not in ['id', 'date', 'target_price_7d', 'target_price_change_7d']]
        
        import json
        feature_path = os.path.join(self.output_dir, 'feature_names.json')
        with open(feature_path, 'w') as f:
            json.dump(feature_cols, f, indent=2)
        
        logger.info(f"✓ Feature names saved: {feature_path} ({len(feature_cols)} features)")
        
        return {
            'train': train_path,
            'validation': val_path,
            'test': test_path,
            'full': full_path,
            'features': feature_path
        }
    
    def generate_summary(self, df, paths):
        """Generate summary statistics"""
        logger.info("\n" + "=" * 80)
        logger.info("EXPORT SUMMARY")
        logger.info("=" * 80)
        
        # Check if dataframe is empty
        if len(df) == 0:
            logger.error("No data to summarize - dataframe is empty!")
            logger.error("Please check:")
            logger.error("  1. Database has data (run LOAD_ALL_DATA.bat)")
            logger.error("  2. Database connection is working")
            logger.error("  3. Check logs above for errors")
            return
        
        print(f"\nDataset Statistics:")
        print(f"  Total Records: {len(df):,}")
        print(f"  Date Range: {df['date'].min()} to {df['date'].max()}")
        print(f"  Unique Commodities: {df['commodity_id'].nunique()}")
        print(f"  Unique Regions: {df['region_id'].nunique()}")
        print(f"  Features: {len([col for col in df.columns if col not in ['id', 'date', 'target_price_7d', 'target_price_change_7d']])}")
        
        print(f"\nDataset Splits:")
        train_df = pd.read_csv(paths['train'])
        val_df = pd.read_csv(paths['validation'])
        test_df = pd.read_csv(paths['test'])
        
        print(f"  Training:   {len(train_df):,} records ({len(train_df)/len(df)*100:.1f}%)")
        print(f"  Validation: {len(val_df):,} records ({len(val_df)/len(df)*100:.1f}%)")
        print(f"  Test:       {len(test_df):,} records ({len(test_df)/len(df)*100:.1f}%)")
        
        print(f"\nOutput Files:")
        for key, path in paths.items():
            print(f"  {key}: {path}")
        
        print("\n" + "=" * 80)
        print("✅ DATA EXPORT COMPLETE!")
        print("=" * 80)
        print("\nNext Step: STEP 3 - Feature Engineering (optional)")
        print("Or proceed to: STEP 4 - Train Model")
        print("\n" + "=" * 80)

def main():
    """Main execution"""
    logger.info("=" * 80)
    logger.info("STEP 2: EXPORT TRAINING DATASET")
    logger.info("=" * 80)
    
    exporter = TrainingDataExporter()
    
    try:
        # Export data
        price_df = exporter.export_price_data()
        
        # Check if we have data
        if len(price_df) == 0:
            logger.error("=" * 80)
            logger.error("NO DATA FOUND IN DATABASE!")
            logger.error("=" * 80)
            logger.error("\nPlease run LOAD_ALL_DATA.bat first to load data:")
            logger.error("  1. cd backend")
            logger.error("  2. LOAD_ALL_DATA.bat")
            logger.error("  3. Wait for data loading to complete")
            logger.error("  4. Then run this script again")
            logger.error("=" * 80)
            return
        
        sentiment_df = exporter.export_sentiment_data()
        
        # Merge datasets
        df = exporter.merge_datasets(price_df, sentiment_df)
        
        # Check merged data
        if len(df) == 0:
            logger.error("=" * 80)
            logger.error("NO DATA AFTER MERGE!")
            logger.error("=" * 80)
            logger.error(f"Price records: {len(price_df)}")
            logger.error(f"Sentiment records: {len(sentiment_df)}")
            logger.error("This might be a date mismatch issue.")
            logger.error("=" * 80)
            return
        
        # Create features
        df = exporter.create_lag_features(df)
        df = exporter.create_rolling_features(df)
        df = exporter.create_price_change_features(df)
        
        # Create target variable
        df = exporter.create_target_variable(df)
        
        # Clean data
        df = exporter.clean_data(df)
        
        # Save datasets
        paths = exporter.save_datasets(df)
        
        # Generate summary
        exporter.generate_summary(df, paths)
        
    except Exception as e:
        logger.error(f"Error during export: {e}")
        raise
    finally:
        exporter.close()

if __name__ == "__main__":
    main()
