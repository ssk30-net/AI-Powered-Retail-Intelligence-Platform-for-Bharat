# ML Quick Start Guide
## Commodity Price Prediction - Fast Track

---

## 🚀 Quick Implementation Steps

### STEP 1: Verify Data (5 minutes)
```bash
cd backend
python verify_data.py
```
**Expected Output**: Data counts, quality metrics, date ranges

---

### STEP 2: Export Training Data (10 minutes)
```bash
python export_training_data.py
```
**Output**: `ml_data/training_data.csv` with all features

---

### STEP 3: Feature Engineering (15 minutes)
```bash
python feature_engineering.py
```
**Creates**: Lag features, rolling averages, sentiment scores

STEP2_EXPORT_DATA.bat
---

### STEP 4: Train Model (20 minutes)
```bash
python train_model.py
```
**Output**: 
- `models/xgboost_price_predictor.pkl`
- Model evaluation metrics
- Feature importance chart

---

### STEP 5: Deploy to SageMaker (30 minutes)

#### 5.1 Setup AWS
```bash
# Configure AWS credentials
aws configure

# Create S3 buckets
aws s3 mb s3://ai-market-pulse-training-data
aws s3 mb s3://ai-market-pulse-models
```

#### 5.2 Upload Data
```bash
aws s3 cp ml_data/training_data.csv s3://ai-market-pulse-training-data/
```

#### 5.3 Deploy Training Job
```bash
cd sagemaker
python deploy_training.py
```

#### 5.4 Deploy Endpoint
```bash
python deploy_endpoint.py
```

#### 5.5 Test Prediction
```bash
python test_prediction.py
```

---

## 📊 Expected Results

### Model Metrics
- **RMSE**: < 5% of average price
- **MAPE**: < 10%
- **R² Score**: > 0.85

### Prediction Example
```json
{
  "commodity_id": 1,
  "commodity_name": "Rice",
  "current_price": 2500,
  "predicted_price_7d": 2550,
  "predicted_price_30d": 2600,
  "confidence": 0.92
}
```

---

## 🛠️ Files You'll Create

1. `backend/verify_data.py` - Data validation
2. `backend/export_training_data.py` - Data export
3. `backend/feature_engineering.py` - Feature creation
4. `backend/train_model.py` - Model training
5. `backend/sagemaker/train.py` - SageMaker training
6. `backend/sagemaker/inference.py` - SageMaker inference
7. `backend/sagemaker/deploy_training.py` - Deploy training
8. `backend/sagemaker/deploy_endpoint.py` - Deploy endpoint
9. `backend/app/api/v1/endpoints/predictions.py` - API endpoint

---

## 📦 Install ML Packages

```bash
cd backend
pip install xgboost scikit-learn boto3 sagemaker joblib
```

---

## 🎯 Total Time: ~2 hours for complete setup

See `ML_IMPLEMENTATION_ROADMAP.md` for detailed documentation.
