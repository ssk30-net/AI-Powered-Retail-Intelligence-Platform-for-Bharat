# Machine Learning Implementation Roadmap
## Commodity Price Prediction System

---

## Overview

This document outlines the complete ML pipeline for predicting commodity prices using XGBoost and AWS SageMaker. The system will use historical price data, sentiment analysis, and market indicators to forecast future commodity prices.

---

## STEP 1: Verify Your Data Structure

### Objective
Ensure all required data is present and properly structured in RDS for ML training.

### Tasks

#### 1.1 Check Data Availability
```sql
-- Verify tables have data
SELECT 'commodities' as table_name, COUNT(*) as count FROM commodities
UNION ALL
SELECT 'regions', COUNT(*) FROM regions
UNION ALL
SELECT 'price_history', COUNT(*) FROM price_history
UNION ALL
SELECT 'sentiment_data', COUNT(*) FROM sentiment_data
UNION ALL
SELECT 'forecasts', COUNT(*) FROM forecasts;
```

#### 1.2 Verify Data Quality
```sql
-- Check for NULL values in critical columns
SELECT 
    COUNT(*) as total_records,
    COUNT(price) as price_count,
    COUNT(recorded_at) as date_count,
    COUNT(*) - COUNT(price) as missing_prices
FROM price_history;

-- Check date ranges
SELECT 
    MIN(recorded_at) as earliest_date,
    MAX(recorded_at) as latest_date,
    COUNT(DISTINCT commodity_id) as unique_commodities
FROM price_history;
```

#### 1.3 Validate Data Distribution
```sql
-- Check price distribution per commodity
SELECT 
    c.name,
    COUNT(*) as record_count,
    AVG(ph.price) as avg_price,
    MIN(ph.price) as min_price,
    MAX(ph.price) as max_price,
    STDDEV(ph.price) as price_volatility
FROM price_history ph
JOIN commodities c ON ph.commodity_id = c.id
GROUP BY c.name
ORDER BY record_count DESC;
```

#### 1.4 Create Verification Script
**File**: `backend/verify_data.py`

---

## STEP 2: Export Training Dataset From RDS

### Objective
Extract and prepare data from PostgreSQL RDS for ML model training.

### Tasks

#### 2.1 Create Data Export Script
**File**: `backend/export_training_data.py`

**Features to Export**:
- Historical prices (time series)
- Commodity metadata (category, unit)
- Regional information (state, country)
- Sentiment scores (aggregated)
- Volume data
- Date/time features (day, month, year, day_of_week)

#### 2.2 Export Format
- **Format**: CSV or Parquet
- **Location**: `backend/ml_data/training_data.csv`
- **Time Range**: Last 2 years of data
- **Frequency**: Daily aggregated data

#### 2.3 Data Schema
```
commodity_id, commodity_name, region_id, date, price, volume,
sentiment_score, day_of_week, month, year, quarter,
price_lag_1, price_lag_7, price_lag_30,
rolling_avg_7, rolling_avg_30, volatility_7, volatility_30
```

---

## STEP 3: Feature Engineering

### Objective
Create meaningful features from raw data to improve model performance.

### 3.1 Time-Based Features

- Day of week (1-7)
- Month (1-12)
- Quarter (1-4)
- Year
- Is weekend (boolean)
- Is month start/end (boolean)
- Days since last record

### 3.2 Lag Features (Historical Prices)
- Price 1 day ago
- Price 7 days ago (1 week)
- Price 30 days ago (1 month)
- Price 90 days ago (1 quarter)
- Price 365 days ago (1 year)

### 3.3 Rolling Window Features
- 7-day moving average
- 30-day moving average
- 90-day moving average
- 7-day price volatility (std dev)
- 30-day price volatility
- 7-day volume average
- 30-day volume average

### 3.4 Price Change Features
- Daily price change (%)
- Weekly price change (%)
- Monthly price change (%)
- Price momentum (7-day trend)

### 3.5 Sentiment Features
- Average sentiment score (last 7 days)
- Average sentiment score (last 30 days)
- Sentiment trend (increasing/decreasing)
- Positive sentiment count
- Negative sentiment count

### 3.6 Seasonal Features
- Seasonality index (commodity-specific)
- Holiday indicator
- Agricultural season indicator

### 3.7 Regional Features
- Region average price
- Region price rank
- Price difference from regional average

**File**: `backend/feature_engineering.py`

---

## STEP 4: Train XGBoost Model

### Objective
Build and train XGBoost regression model for price prediction.

### 4.1 Model Configuration

```python
# XGBoost Parameters
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
    'reg_lambda': 1
}
```

### 4.2 Train-Test Split
- **Training Set**: 80% (oldest data)
- **Validation Set**: 10%
- **Test Set**: 10% (most recent data)
- **Split Method**: Time-based (not random)

### 4.3 Model Training Steps
1. Load preprocessed data
2. Split into train/validation/test
3. Train XGBoost model
4. Hyperparameter tuning (GridSearch/RandomSearch)
5. Evaluate on validation set
6. Final evaluation on test set

### 4.4 Evaluation Metrics
- **RMSE** (Root Mean Squared Error)
- **MAE** (Mean Absolute Error)
- **MAPE** (Mean Absolute Percentage Error)
- **R² Score**
- **Feature Importance Analysis**

### 4.5 Model Persistence
- Save trained model: `backend/models/xgboost_price_predictor.pkl`
- Save feature names: `backend/models/feature_names.json`
- Save scaler: `backend/models/scaler.pkl`

**File**: `backend/train_model.py`

---

## STEP 5: Move To SageMaker

### Objective
Deploy the trained model to AWS SageMaker for scalable inference.

### 5.1 Prepare SageMaker Environment

#### 5.1.1 Create S3 Buckets
```bash
# Training data bucket
aws s3 mb s3://ai-market-pulse-training-data

# Model artifacts bucket
aws s3 mb s3://ai-market-pulse-models
```

#### 5.1.2 Upload Training Data
```bash
aws s3 cp backend/ml_data/training_data.csv s3://ai-market-pulse-training-data/
```

### 5.2 Create SageMaker Training Script

**File**: `backend/sagemaker/train.py`

Requirements:
- Load data from S3
- Perform feature engineering
- Train XGBoost model
- Save model artifacts to S3

### 5.3 Create SageMaker Inference Script
**File**: `backend/sagemaker/inference.py`

Functions:
- `model_fn()` - Load model
- `input_fn()` - Parse input data
- `predict_fn()` - Make predictions
- `output_fn()` - Format output

### 5.4 Create Docker Container (Optional)
**File**: `backend/sagemaker/Dockerfile`

Or use AWS pre-built XGBoost container:
```
763104351884.dkr.ecr.us-east-1.amazonaws.com/xgboost-training:latest
```

### 5.5 Deploy SageMaker Training Job
**File**: `backend/sagemaker/deploy_training.py`

```python
import sagemaker
from sagemaker.xgboost import XGBoost

# Create estimator
xgb_estimator = XGBoost(
    entry_point='train.py',
    role='SageMakerExecutionRole',
    instance_count=1,
    instance_type='ml.m5.xlarge',
    framework_version='1.5-1',
    output_path='s3://ai-market-pulse-models/'
)

# Start training
xgb_estimator.fit({'train': 's3://ai-market-pulse-training-data/'})
```

### 5.6 Deploy SageMaker Endpoint
**File**: `backend/sagemaker/deploy_endpoint.py`

```python
# Deploy model to endpoint
predictor = xgb_estimator.deploy(
    initial_instance_count=1,
    instance_type='ml.t2.medium',
    endpoint_name='commodity-price-predictor'
)
```

### 5.7 Create Prediction API
**File**: `backend/app/api/v1/endpoints/predictions.py`

Endpoints:
- `POST /api/v1/predictions/price` - Predict single commodity price
- `POST /api/v1/predictions/batch` - Batch predictions
- `GET /api/v1/predictions/forecast/{commodity_id}` - Get 30-day forecast

---

## STEP 6: Integration & Automation (Bonus)

### 6.1 Automated Retraining Pipeline
- Schedule: Weekly/Monthly
- Trigger: New data availability
- Tool: AWS Lambda + EventBridge

### 6.2 Model Monitoring
- Track prediction accuracy
- Monitor data drift
- Alert on performance degradation
- Tool: SageMaker Model Monitor

### 6.3 A/B Testing
- Deploy multiple model versions
- Compare performance
- Gradual rollout

### 6.4 CI/CD Pipeline
- Automated testing
- Model versioning
- Deployment automation
- Tool: GitHub Actions + AWS CodePipeline

---

## File Structure


```
backend/
├── ml_data/
│   ├── training_data.csv
│   ├── test_data.csv
│   └── feature_metadata.json
├── models/
│   ├── xgboost_price_predictor.pkl
│   ├── scaler.pkl
│   └── feature_names.json
├── sagemaker/
│   ├── train.py
│   ├── inference.py
│   ├── deploy_training.py
│   ├── deploy_endpoint.py
│   ├── requirements.txt
│   └── Dockerfile (optional)
├── verify_data.py
├── export_training_data.py
├── feature_engineering.py
├── train_model.py
└── app/api/v1/endpoints/
    └── predictions.py
```

---

## Implementation Timeline

### Week 1: Data Preparation
- ✅ Day 1-2: Verify data structure (STEP 1)
- ✅ Day 3-4: Export training dataset (STEP 2)
- ✅ Day 5-7: Feature engineering (STEP 3)

### Week 2: Model Development
- 🔄 Day 1-3: Train local XGBoost model (STEP 4)
- 🔄 Day 4-5: Model evaluation and tuning
- 🔄 Day 6-7: Model validation and testing

### Week 3: SageMaker Deployment
- 🔄 Day 1-2: Prepare SageMaker environment (STEP 5.1)
- 🔄 Day 3-4: Create training/inference scripts (STEP 5.2-5.3)
- 🔄 Day 5-6: Deploy training job (STEP 5.4-5.5)
- 🔄 Day 7: Deploy endpoint (STEP 5.6)

### Week 4: Integration & Testing
- 🔄 Day 1-3: Create prediction API (STEP 5.7)
- 🔄 Day 4-5: Frontend integration
- 🔄 Day 6-7: End-to-end testing

---

## Required AWS Services

1. **Amazon RDS** (PostgreSQL) - Data storage ✅
2. **Amazon S3** - Training data and model artifacts
3. **Amazon SageMaker** - Model training and deployment
4. **AWS Lambda** (Optional) - Automated retraining
5. **Amazon EventBridge** (Optional) - Scheduling
6. **AWS IAM** - Permissions and roles

---

## Required Python Packages

```txt
# Data Processing
pandas>=1.5.0
numpy>=1.23.0
scikit-learn>=1.2.0

# Machine Learning
xgboost>=1.7.0
lightgbm>=3.3.0 (alternative)

# AWS Integration
boto3>=1.26.0
sagemaker>=2.100.0

# Database
psycopg2-binary>=2.9.0
sqlalchemy>=2.0.0

# Utilities
python-dotenv>=0.21.0
joblib>=1.2.0
```

---

## Success Metrics

### Model Performance
- RMSE < 5% of average price
- MAPE < 10%
- R² Score > 0.85

### System Performance
- Prediction latency < 200ms
- Endpoint availability > 99.9%
- Training time < 30 minutes

### Business Impact
- Forecast accuracy improvement
- Reduced inventory costs
- Better pricing decisions

---

## Next Steps

1. **Start with STEP 1**: Run `backend/verify_data.py` to check data quality
2. **Proceed to STEP 2**: Export training dataset
3. **Continue sequentially** through all steps
4. **Test thoroughly** at each stage
5. **Document learnings** and model performance

---

## Additional Features (Future Enhancements)

### Advanced ML Features
- Multi-commodity correlation analysis
- External data integration (weather, news, economic indicators)
- Deep learning models (LSTM, Transformer)
- Ensemble methods (XGBoost + LightGBM + Neural Networks)

### Advanced Deployment
- Multi-region deployment
- Auto-scaling based on demand
- Model versioning and rollback
- Real-time streaming predictions

### Advanced Monitoring
- Prediction confidence intervals
- Anomaly detection
- Data quality monitoring
- Model explainability (SHAP values)

---

**Status**: 📋 Documentation Complete - Ready for Implementation
**Last Updated**: March 1, 2026
