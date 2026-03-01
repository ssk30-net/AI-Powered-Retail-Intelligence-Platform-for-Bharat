"""
STEP 4: Train XGBoost Model
Train commodity price prediction model locally
"""

import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.preprocessing import StandardScaler
import joblib
import json
import os
import logging
from datetime import datetime
import matplotlib.pyplot as plt

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ModelTrainer:
    """Train XGBoost model for price prediction"""
    
    def __init__(self):
        self.model = None
        self.scaler = None
        self.feature_names = None
        self.model_dir = 'models'
        self.data_dir = 'ml_data'
        
        # Create directories
        os.makedirs(self.model_dir, exist_ok=True)
        
    def load_data(self):
        """Load training, validation, and test datasets"""
        logger.info("Loading datasets...")
        
        train_path = os.path.join(self.data_dir, 'training_data.csv')
        val_path = os.path.join(self.data_dir, 'validation_data.csv')
        test_path = os.path.join(self.data_dir, 'test_data.csv')
        feature_path = os.path.join(self.data_dir, 'feature_names.json')
        
        # Check if files exist
        if not os.path.exists(train_path):
            raise FileNotFoundError(f"Training data not found! Run STEP2_EXPORT_DATA.bat first")
        
        # Load datasets
        train_df = pd.read_csv(train_path)
        val_df = pd.read_csv(val_path)
        test_df = pd.read_csv(test_path)
        
        # Load feature names
        with open(feature_path, 'r') as f:
            self.feature_names = json.load(f)
        
        logger.info(f"Training set: {len(train_df):,} records")
        logger.info(f"Validation set: {len(val_df):,} records")
        logger.info(f"Test set: {len(test_df):,} records")
        logger.info(f"Features: {len(self.feature_names)}")
        
        return train_df, val_df, test_df
    
    def prepare_features(self, df):
        """Prepare features and target"""
        
        # Select only numeric features
        numeric_features = [f for f in self.feature_names if f in df.columns and df[f].dtype in ['int64', 'float64']]
        
        X = df[numeric_features].copy()
        y = df['target_price_7d'].copy()
        
        # Handle any remaining NaN or inf values
        X = X.replace([np.inf, -np.inf], np.nan)
        X = X.fillna(0)
        
        return X, y, numeric_features
    
    def train_model(self, X_train, y_train, X_val, y_val):
        """Train XGBoost model"""
        logger.info("\nTraining XGBoost model...")
        
        # Scale features
        logger.info("Scaling features...")
        self.scaler = StandardScaler()
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_val_scaled = self.scaler.transform(X_val)
        
        # XGBoost parameters
        params = {
            'objective': 'reg:squarederror',
            'max_depth': 6,
            'learning_rate': 0.1,
            'n_estimators': 100,
            'subsample': 0.8,
            'colsample_bytree': 0.8,
            'min_child_weight': 1,
            'gamma': 0,
            'reg_alpha': 0,
            'reg_lambda': 1,
            'random_state': 42,
            'n_jobs': -1
        }
        
        logger.info("Model parameters:")
        for key, value in params.items():
            logger.info(f"  {key}: {value}")
        
        # Train model
        self.model = xgb.XGBRegressor(**params)
        
        logger.info("\nTraining in progress...")
        self.model.fit(
            X_train_scaled, y_train,
            eval_set=[(X_train_scaled, y_train), (X_val_scaled, y_val)],
            eval_metric='rmse',
            verbose=False
        )
        
        logger.info("✓ Training complete!")
        
        return X_train_scaled, X_val_scaled
    
    def evaluate_model(self, X_train_scaled, y_train, X_val_scaled, y_val, X_test_scaled, y_test):
        """Evaluate model performance"""
        logger.info("\n" + "=" * 80)
        logger.info("MODEL EVALUATION")
        logger.info("=" * 80)
        
        # Predictions
        train_pred = self.model.predict(X_train_scaled)
        val_pred = self.model.predict(X_val_scaled)
        test_pred = self.model.predict(X_test_scaled)
        
        # Calculate metrics
        metrics = {}
        
        for name, y_true, y_pred in [
            ('Training', y_train, train_pred),
            ('Validation', y_val, val_pred),
            ('Test', y_test, test_pred)
        ]:
            rmse = np.sqrt(mean_squared_error(y_true, y_pred))
            mae = mean_absolute_error(y_true, y_pred)
            r2 = r2_score(y_true, y_pred)
            mape = np.mean(np.abs((y_true - y_pred) / y_true)) * 100
            
            metrics[name] = {
                'RMSE': rmse,
                'MAE': mae,
                'R²': r2,
                'MAPE': mape
            }
            
            logger.info(f"\n{name} Set:")
            logger.info(f"  RMSE: {rmse:.2f}")
            logger.info(f"  MAE:  {mae:.2f}")
            logger.info(f"  R²:   {r2:.4f}")
            logger.info(f"  MAPE: {mape:.2f}%")
        
        return metrics
    
    def plot_feature_importance(self, feature_names):
        """Plot feature importance"""
        logger.info("\nGenerating feature importance plot...")
        
        # Get feature importance
        importance = self.model.feature_importances_
        
        # Sort by importance
        indices = np.argsort(importance)[::-1][:20]  # Top 20
        
        # Plot
        plt.figure(figsize=(10, 8))
        plt.title('Top 20 Feature Importance')
        plt.barh(range(len(indices)), importance[indices])
        plt.yticks(range(len(indices)), [feature_names[i] for i in indices])
        plt.xlabel('Importance')
        plt.tight_layout()
        
        plot_path = os.path.join(self.model_dir, 'feature_importance.png')
        plt.savefig(plot_path)
        logger.info(f"✓ Feature importance plot saved: {plot_path}")
        
        # Print top 10
        logger.info("\nTop 10 Most Important Features:")
        for i, idx in enumerate(indices[:10], 1):
            logger.info(f"  {i}. {feature_names[idx]}: {importance[idx]:.4f}")
    
    def save_model(self, metrics, feature_names):
        """Save model and artifacts"""
        logger.info("\nSaving model artifacts...")
        
        # Save model
        model_path = os.path.join(self.model_dir, 'xgboost_price_predictor.pkl')
        joblib.dump(self.model, model_path)
        logger.info(f"✓ Model saved: {model_path}")
        
        # Save scaler
        scaler_path = os.path.join(self.model_dir, 'scaler.pkl')
        joblib.dump(self.scaler, scaler_path)
        logger.info(f"✓ Scaler saved: {scaler_path}")
        
        # Save feature names
        feature_path = os.path.join(self.model_dir, 'feature_names.json')
        with open(feature_path, 'w') as f:
            json.dump(feature_names, f, indent=2)
        logger.info(f"✓ Feature names saved: {feature_path}")
        
        # Save metrics
        metrics_path = os.path.join(self.model_dir, 'metrics.json')
        with open(metrics_path, 'w') as f:
            json.dump(metrics, f, indent=2)
        logger.info(f"✓ Metrics saved: {metrics_path}")
        
        # Save model info
        model_info = {
            'trained_at': datetime.now().isoformat(),
            'n_features': len(feature_names),
            'model_type': 'XGBoost',
            'target': 'price_7d_ahead',
            'metrics': metrics
        }
        
        info_path = os.path.join(self.model_dir, 'model_info.json')
        with open(info_path, 'w') as f:
            json.dump(model_info, f, indent=2)
        logger.info(f"✓ Model info saved: {info_path}")
    
    def generate_summary(self, metrics):
        """Generate training summary"""
        logger.info("\n" + "=" * 80)
        logger.info("TRAINING SUMMARY")
        logger.info("=" * 80)
        
        test_metrics = metrics['Test']
        
        logger.info(f"\nModel Performance (Test Set):")
        logger.info(f"  RMSE: {test_metrics['RMSE']:.2f}")
        logger.info(f"  MAE:  {test_metrics['MAE']:.2f}")
        logger.info(f"  R²:   {test_metrics['R²']:.4f}")
        logger.info(f"  MAPE: {test_metrics['MAPE']:.2f}%")
        
        # Interpretation
        logger.info(f"\nModel Quality:")
        if test_metrics['R²'] > 0.85:
            logger.info("  ✅ EXCELLENT - Model explains >85% of variance")
        elif test_metrics['R²'] > 0.70:
            logger.info("  ✅ GOOD - Model explains >70% of variance")
        elif test_metrics['R²'] > 0.50:
            logger.info("  ⚠️ FAIR - Model explains >50% of variance")
        else:
            logger.info("  ❌ POOR - Model needs improvement")
        
        if test_metrics['MAPE'] < 10:
            logger.info("  ✅ EXCELLENT - Average error <10%")
        elif test_metrics['MAPE'] < 20:
            logger.info("  ✅ GOOD - Average error <20%")
        else:
            logger.info("  ⚠️ FAIR - Average error >20%")
        
        logger.info(f"\nModel Files:")
        logger.info(f"  • models/xgboost_price_predictor.pkl")
        logger.info(f"  • models/scaler.pkl")
        logger.info(f"  • models/feature_names.json")
        logger.info(f"  • models/metrics.json")
        logger.info(f"  • models/model_info.json")
        logger.info(f"  • models/feature_importance.png")
        
        logger.info("\n" + "=" * 80)
        logger.info("✅ MODEL TRAINING COMPLETE!")
        logger.info("=" * 80)
        logger.info("\nNext Steps:")
        logger.info("  1. Review feature_importance.png")
        logger.info("  2. Test predictions with test_model.py")
        logger.info("  3. Deploy to SageMaker (STEP 5)")
        logger.info("=" * 80)

def main():
    """Main execution"""
    logger.info("=" * 80)
    logger.info("STEP 4: TRAIN XGBOOST MODEL")
    logger.info("=" * 80)
    
    trainer = ModelTrainer()
    
    try:
        # Load data
        train_df, val_df, test_df = trainer.load_data()
        
        # Prepare features
        X_train, y_train, feature_names = trainer.prepare_features(train_df)
        X_val, y_val, _ = trainer.prepare_features(val_df)
        X_test, y_test, _ = trainer.prepare_features(test_df)
        
        logger.info(f"\nUsing {len(feature_names)} features for training")
        
        # Train model
        X_train_scaled, X_val_scaled = trainer.train_model(X_train, y_train, X_val, y_val)
        
        # Scale test set
        X_test_scaled = trainer.scaler.transform(X_test)
        
        # Evaluate model
        metrics = trainer.evaluate_model(
            X_train_scaled, y_train,
            X_val_scaled, y_val,
            X_test_scaled, y_test
        )
        
        # Plot feature importance
        trainer.plot_feature_importance(feature_names)
        
        # Save model
        trainer.save_model(metrics, feature_names)
        
        # Generate summary
        trainer.generate_summary(metrics)
        
    except Exception as e:
        logger.error(f"Error during training: {e}")
        raise

if __name__ == "__main__":
    main()
