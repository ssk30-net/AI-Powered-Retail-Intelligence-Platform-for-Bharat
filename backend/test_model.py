"""
Test Trained Model Locally
Test predictions with sample data before deployment
"""

import pandas as pd
import numpy as np
import joblib
import json
import os
import logging
from datetime import datetime, timedelta

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ModelTester:
    """Test trained model with sample predictions"""
    
    def __init__(self):
        self.model_dir = 'models'
        self.data_dir = 'ml_data'
        self.model = None
        self.scaler = None
        self.feature_names = None
        
    def load_model(self):
        """Load trained model and artifacts"""
        logger.info("Loading model artifacts...")
        
        model_path = os.path.join(self.model_dir, 'xgboost_price_predictor.pkl')
        scaler_path = os.path.join(self.model_dir, 'scaler.pkl')
        feature_path = os.path.join(self.model_dir, 'feature_names.json')
        
        if not os.path.exists(model_path):
            raise FileNotFoundError("Model not found! Run STEP4_TRAIN_MODEL.bat first")
        
        self.model = joblib.load(model_path)
        self.scaler = joblib.load(scaler_path)
        
        with open(feature_path, 'r') as f:
            self.feature_names = json.load(f)
        
        logger.info(f"✓ Model loaded: {len(self.feature_names)} features")
    
    def load_test_data(self):
        """Load test dataset"""
        logger.info("Loading test data...")
        
        test_path = os.path.join(self.data_dir, 'test_data.csv')
        df = pd.read_csv(test_path)
        
        logger.info(f"✓ Test data loaded: {len(df)} records")
        return df
    
    def prepare_features(self, df):
        """Prepare features for prediction"""
        
        # Select only numeric features that exist in both df and feature_names
        numeric_features = [f for f in self.feature_names if f in df.columns and df[f].dtype in ['int64', 'float64']]
        
        X = df[numeric_features].copy()
        
        # Handle NaN and inf
        X = X.replace([np.inf, -np.inf], np.nan)
        X = X.fillna(0)
        
        return X, numeric_features
    
    def make_predictions(self, X):
        """Make predictions"""
        logger.info("Making predictions...")
        
        # Scale features
        X_scaled = self.scaler.transform(X)
        
        # Predict
        predictions = self.model.predict(X_scaled)
        
        return predictions
    
    def evaluate_predictions(self, df, predictions):
        """Evaluate prediction quality"""
        logger.info("\n" + "=" * 80)
        logger.info("PREDICTION RESULTS")
        logger.info("=" * 80)
        
        # Add predictions to dataframe
        df['predicted_price'] = predictions
        df['actual_price'] = df['target_price_7d']
        df['error'] = df['actual_price'] - df['predicted_price']
        df['error_pct'] = (df['error'] / df['actual_price']) * 100
        
        # Calculate metrics
        rmse = np.sqrt(np.mean(df['error'] ** 2))
        mae = np.mean(np.abs(df['error']))
        mape = np.mean(np.abs(df['error_pct']))
        
        logger.info(f"\nOverall Metrics:")
        logger.info(f"  RMSE: {rmse:.2f}")
        logger.info(f"  MAE:  {mae:.2f}")
        logger.info(f"  MAPE: {mape:.2f}%")
        
        # Show sample predictions
        logger.info(f"\nSample Predictions (first 10):")
        logger.info("-" * 80)
        
        sample = df[['commodity_name', 'date', 'price', 'predicted_price', 'actual_price', 'error_pct']].head(10)
        
        for idx, row in sample.iterrows():
            logger.info(f"{row['commodity_name'][:20]:20} | Date: {str(row['date'])[:10]} | Current: {row['price']:.2f} | Predicted: {row['predicted_price']:.2f} | Actual: {row['actual_price']:.2f} | Error: {row['error_pct']:.1f}%")
        
        # Show best and worst predictions
        logger.info(f"\nBest Predictions (lowest error):")
        logger.info("-" * 80)
        best = df.nsmallest(5, 'error_pct')[['commodity_name', 'predicted_price', 'actual_price', 'error_pct']]
        for idx, row in best.iterrows():
            logger.info(f"{row['commodity_name'][:20]:20} | Predicted: {row['predicted_price']:.2f} | Actual: {row['actual_price']:.2f} | Error: {row['error_pct']:.1f}%")
        
        logger.info(f"\nWorst Predictions (highest error):")
        logger.info("-" * 80)
        worst = df.nlargest(5, 'error_pct')[['commodity_name', 'predicted_price', 'actual_price', 'error_pct']]
        for idx, row in worst.iterrows():
            logger.info(f"{row['commodity_name'][:20]:20} | Predicted: {row['predicted_price']:.2f} | Actual: {row['actual_price']:.2f} | Error: {row['error_pct']:.1f}%")
        
        return df
    
    def test_single_prediction(self):
        """Test single prediction with custom input"""
        logger.info("\n" + "=" * 80)
        logger.info("SINGLE PREDICTION TEST")
        logger.info("=" * 80)
        
        # Load a sample record
        test_df = self.load_test_data()
        sample = test_df.iloc[0]
        
        logger.info(f"\nSample Input:")
        logger.info(f"  Commodity: {sample['commodity_name']}")
        logger.info(f"  Current Price: {sample['price']:.2f}")
        logger.info(f"  Date: {sample['date']}")
        
        # Prepare features
        X, _ = self.prepare_features(test_df.iloc[[0]])
        
        # Make prediction
        prediction = self.make_predictions(X)[0]
        actual = sample['target_price_7d']
        
        logger.info(f"\nPrediction:")
        logger.info(f"  Predicted Price (7 days): {prediction:.2f}")
        logger.info(f"  Actual Price (7 days):    {actual:.2f}")
        logger.info(f"  Error: {abs(prediction - actual):.2f} ({abs((prediction - actual) / actual * 100):.1f}%)")
        
        # Show key features used
        logger.info(f"\nKey Features Used:")
        for feature in ['price_lag_1', 'price_lag_7', 'price_rolling_mean_7', 'avg_sentiment']:
            if feature in sample:
                logger.info(f"  {feature}: {sample[feature]:.2f}")
    
    def generate_summary(self):
        """Generate test summary"""
        logger.info("\n" + "=" * 80)
        logger.info("TEST SUMMARY")
        logger.info("=" * 80)
        
        logger.info("\n✅ Model testing complete!")
        logger.info("\nModel is ready for:")
        logger.info("  • Integration with backend API")
        logger.info("  • Deployment to SageMaker")
        logger.info("  • Production use")
        
        logger.info("\nNext steps:")
        logger.info("  1. Review prediction accuracy")
        logger.info("  2. Integrate with backend API")
        logger.info("  3. Deploy to SageMaker (optional)")
        logger.info("=" * 80)

def main():
    """Main execution"""
    logger.info("=" * 80)
    logger.info("TEST TRAINED MODEL")
    logger.info("=" * 80)
    
    tester = ModelTester()
    
    try:
        # Load model
        tester.load_model()
        
        # Load test data
        test_df = tester.load_test_data()
        
        # Prepare features
        X, feature_names = tester.prepare_features(test_df)
        
        # Make predictions
        predictions = tester.make_predictions(X)
        
        # Evaluate predictions
        results_df = tester.evaluate_predictions(test_df, predictions)
        
        # Test single prediction
        tester.test_single_prediction()
        
        # Generate summary
        tester.generate_summary()
        
        # Save results
        results_path = os.path.join(tester.model_dir, 'test_results.csv')
        results_df[['commodity_name', 'date', 'price', 'predicted_price', 'actual_price', 'error', 'error_pct']].to_csv(results_path, index=False)
        logger.info(f"\n✓ Test results saved: {results_path}")
        
    except Exception as e:
        logger.error(f"Error during testing: {e}")
        raise

if __name__ == "__main__":
    main()
