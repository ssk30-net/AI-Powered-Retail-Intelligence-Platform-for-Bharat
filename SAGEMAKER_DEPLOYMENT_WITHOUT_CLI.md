# 🚀 SageMaker Deployment Without AWS CLI

**Problem**: You don't have AWS CLI installed
**Solution**: Multiple deployment options without CLI

---

## Option 1: Deploy Using AWS Console (Easiest) ⭐⭐⭐

### Step 1: Upload Model to S3

**Via AWS Console**:
1. Go to https://console.aws.amazon.com/s3/
2. Create bucket: `ai-market-pulse-models`
3. Create folder: `models/commodity-price-predictor/`
4. Upload these files:
   - `backend/models/xgboost_price_predictor.pkl`
   - `backend/models/scaler.pkl`
   - `backend/models/feature_names.json`

**Package as tar.gz first**:
```bash
cd backend/models
tar -czf model.tar.gz xgboost_price_predictor.pkl scaler.pkl feature_names.json
# Upload model.tar.gz to S3
```

### Step 2: Create SageMaker Model

1. Go to https://console.aws.amazon.com/sagemaker/
2. Click "Models" → "Create model"
3. Fill in:
   - **Model name**: `commodity-price-predictor`
   - **IAM role**: Create new role or use existing
   - **Container**: Use XGBoost container
     ```
     763104351884.dkr.ecr.eu-north-1.amazonaws.com/xgboost-inference:latest
     ```
   - **Model artifacts**: S3 path to your model.tar.gz
     ```
     s3://ai-market-pulse-models/models/commodity-price-predictor/model.tar.gz
     ```
4. Click "Create model"

### Step 3: Create Endpoint Configuration

1. Click "Endpoint configurations" → "Create endpoint configuration"
2. Fill in:
   - **Name**: `commodity-price-predictor-config`
   - **Add model**: Select your model
   - **Instance type**: `ml.t2.medium` (cheapest)
   - **Instance count**: 1
3. Click "Create endpoint configuration"

### Step 4: Create Endpoint

1. Click "Endpoints" → "Create endpoint"
2. Fill in:
   - **Name**: `commodity-price-predictor-endpoint`
   - **Endpoint configuration**: Select your config
3. Click "Create endpoint"
4. Wait 5-10 minutes for deployment

### Step 5: Test Endpoint

Use the AWS Console or Python SDK (see Option 3)

---

## Option 2: Use Python SDK (boto3) ⭐⭐

**No AWS CLI needed!** Just Python with boto3.

### Install boto3
```bash
cd backend
venv\Scripts\activate
pip install boto3 sagemaker
```

### Configure AWS Credentials

**Option A: Environment Variables**
```bash
set AWS_ACCESS_KEY_ID=your_access_key
set AWS_SECRET_ACCESS_KEY=your_secret_key
set AWS_DEFAULT_REGION=eu-north-1
```

**Option B: Credentials File**
Create `~/.aws/credentials`:
```ini
[default]
aws_access_key_id = your_access_key
aws_secret_access_key = your_secret_key
region = eu-north-1
```

### Deploy Using Python

The existing script works without CLI!

```bash
cd backend
python deploy_sagemaker.py
```

**If you get errors**, edit `deploy_sagemaker.py`:

```python
# At the top, add:
import os
os.environ['AWS_ACCESS_KEY_ID'] = 'your_access_key'
os.environ['AWS_SECRET_ACCESS_KEY'] = 'your_secret_key'
os.environ['AWS_DEFAULT_REGION'] = 'eu-north-1'
```

---

## Option 3: Deploy Locally (No AWS Needed!) ⭐⭐⭐

**Best for development and testing**

### Create Local API Endpoint

Create `backend/serve_model.py`:

```python
"""
Local model serving API
No AWS needed - runs on your machine
"""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np
import json
from typing import List

app = FastAPI(title="Commodity Price Predictor API")

# Load model at startup
model = joblib.load('models/xgboost_price_predictor.pkl')
scaler = joblib.load('models/scaler.pkl')

with open('models/feature_names.json', 'r') as f:
    feature_names = json.load(f)

class PredictionRequest(BaseModel):
    features: dict

class PredictionResponse(BaseModel):
    predicted_price: float
    confidence: str

@app.get("/")
def root():
    return {
        "message": "Commodity Price Predictor API",
        "model": "XGBoost",
        "features": len(feature_names),
        "status": "ready"
    }

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    try:
        # Extract features in correct order
        feature_values = []
        for feature in feature_names:
            if feature in request.features:
                feature_values.append(request.features[feature])
            else:
                feature_values.append(0)  # Default value
        
        # Convert to numpy array
        X = np.array([feature_values])
        
        # Scale features
        X_scaled = scaler.transform(X)
        
        # Predict
        prediction = model.predict(X_scaled)[0]
        
        # Determine confidence (simple heuristic)
        confidence = "high" if prediction > 0 else "low"
        
        return {
            "predicted_price": float(prediction),
            "confidence": confidence
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/features")
def get_features():
    return {"features": feature_names}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
```

### Run Local API

```bash
cd backend
python serve_model.py
```

API will be available at: http://localhost:8001

### Test Local API

```bash
# Test health
curl http://localhost:8001/health

# Test prediction
curl -X POST http://localhost:8001/predict \
  -H "Content-Type: application/json" \
  -d '{"features": {"price_lag_1": 2500, "price_lag_7": 2480}}'
```

### Integrate with Frontend

Update `frontend/src/lib/api.ts`:

```typescript
const ML_API_URL = 'http://localhost:8001';

export async function predictPrice(features: Record<string, number>) {
  const response = await fetch(`${ML_API_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ features })
  });
  return response.json();
}
```

---

## Option 4: Deploy to Heroku (Free Alternative) ⭐⭐

### Step 1: Create Heroku Account
1. Go to https://heroku.com
2. Sign up for free account

### Step 2: Prepare for Deployment

Create `backend/Procfile`:
```
web: uvicorn serve_model:app --host 0.0.0.0 --port $PORT
```

Create `backend/requirements.txt`:
```
fastapi
uvicorn
joblib
scikit-learn
xgboost
numpy
```

### Step 3: Deploy

```bash
# Install Heroku CLI (or use web interface)
# https://devcenter.heroku.com/articles/heroku-cli

cd backend
heroku login
heroku create ai-market-pulse-ml
git add .
git commit -m "Deploy ML model"
git push heroku main
```

Your API will be at: `https://ai-market-pulse-ml.herokuapp.com`

---

## Option 5: Deploy to Railway (Easiest Cloud) ⭐⭐⭐

### Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub

### Step 2: Deploy
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Select your repository
4. Railway auto-detects and deploys!

**No configuration needed!**

---

## Option 6: Use AWS Lambda (Serverless) ⭐

### Benefits
- Pay per request (very cheap)
- No server management
- Auto-scaling

### Limitations
- 250MB deployment package limit
- 15-minute timeout
- Cold start latency

### Deploy Using AWS Console

1. Go to https://console.aws.amazon.com/lambda/
2. Create function: `commodity-price-predictor`
3. Upload deployment package (zip file with model + code)
4. Create API Gateway trigger
5. Test and deploy

---

## Comparison Table

| Option | Cost | Ease | Performance | Best For |
|--------|------|------|-------------|----------|
| AWS Console | $$ | Medium | High | Production |
| Python SDK | $$ | Easy | High | Production |
| Local API | Free | Very Easy | Medium | Development |
| Heroku | Free-$ | Easy | Medium | Small apps |
| Railway | Free-$ | Very Easy | Medium | Quick deploy |
| Lambda | $ | Medium | High | Serverless |

---

## Recommended Approach

### For Development (Now)
✅ **Use Option 3: Local API**
- No AWS needed
- Free
- Easy to test
- Fast iteration

### For Production (Later)
✅ **Use Option 2: Python SDK**
- Professional deployment
- Scalable
- Integrated with AWS
- No CLI needed

---

## Quick Start: Local Deployment

```bash
# 1. Create local API
cd backend
# Copy the serve_model.py code above

# 2. Run API
python serve_model.py

# 3. Test
curl http://localhost:8001/health

# 4. Integrate with frontend
# Update API URL in frontend code
```

**Done!** Your model is now deployed locally and ready to use.

---

## Getting AWS Credentials (If Needed)

### Step 1: Create IAM User
1. Go to https://console.aws.amazon.com/iam/
2. Click "Users" → "Add user"
3. Username: `sagemaker-deploy`
4. Access type: Programmatic access
5. Permissions: `AmazonSageMakerFullAccess`
6. Create user
7. **Save Access Key ID and Secret Access Key**

### Step 2: Use Credentials

**Option A: Environment Variables**
```bash
set AWS_ACCESS_KEY_ID=AKIA...
set AWS_SECRET_ACCESS_KEY=wJalr...
set AWS_DEFAULT_REGION=eu-north-1
```

**Option B: In Python**
```python
import boto3

session = boto3.Session(
    aws_access_key_id='AKIA...',
    aws_secret_access_key='wJalr...',
    region_name='eu-north-1'
)
```

---

## Troubleshooting

### "No AWS credentials found"
→ Set environment variables or create credentials file

### "Access Denied"
→ Check IAM permissions (need SageMaker access)

### "Model too large"
→ Use S3 for model storage, not inline

### "Endpoint creation failed"
→ Check CloudWatch logs in AWS Console

---

## Next Steps

1. **Start with Local API** (Option 3)
2. **Test thoroughly**
3. **When ready for production**, use Python SDK (Option 2)
4. **Monitor costs** in AWS Console

---

**Recommendation**: Use Local API for now, deploy to AWS later when you have credentials set up!
