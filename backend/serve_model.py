"""
ML Model Serving API
Uses AWS SageMaker endpoint when configured; falls back to local trained model.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import xgboost as xgb
import numpy as np
import json
import logging
import os
from typing import Dict, List, Optional, Tuple
from pathlib import Path

# Optional: boto3 for SageMaker (fallback to local if unavailable)
try:
    import boto3
    SAGEMAKER_AVAILABLE = True
except ImportError:
    SAGEMAKER_AVAILABLE = False

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="AI Market Pulse - ML Prediction API",
    description="Local ML model serving for commodity price predictions",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model paths (prefer native XGBoost JSON when present)
MODEL_DIR = Path(__file__).parent / "models"
MODEL_JSON_PATH = MODEL_DIR / "model.json"
MODEL_PKL_PATH = MODEL_DIR / "xgboost_price_predictor.pkl"
SCALER_PATH = MODEL_DIR / "scaler.pkl"
FEATURE_NAMES_PATH = MODEL_DIR / "feature_names.json"
METRICS_PATH = MODEL_DIR / "metrics.json"

# SageMaker: endpoint name from env (e.g. sagemaker-xgboost-2026-03-02-14-22-10-065)
SAGEMAKER_ENDPOINT_NAME = os.environ.get("SAGEMAKER_ENDPOINT_NAME", "sagemaker-xgboost-2026-03-02-14-22-10-065")
SAGEMAKER_REGION = os.environ.get("SAGEMAKER_REGION", "us-east-1")

# Global variables for model artifacts
model = None
scaler = None
feature_names = []
metrics = {}

# Request/Response models
class PredictionRequest(BaseModel):
    features: Dict[str, float]
    
    class Config:
        json_schema_extra = {
            "example": {
                "features": {
                    "price_lag_1": 2500.0,
                    "price_lag_7": 2480.0,
                    "price_rolling_mean_7": 2490.0,
                    "avg_sentiment": 0.5
                }
            }
        }

class PredictionResponse(BaseModel):
    predicted_price: float
    confidence: str
    model_version: str
    features_used: int

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    features_count: int
    model_metrics: Dict

class FeaturesResponse(BaseModel):
    features: List[str]
    count: int

@app.on_event("startup")
async def load_model():
    """Load model artifacts on startup"""
    global model, scaler, feature_names, metrics
    
    try:
        logger.info("Loading model artifacts...")
        
        # Check if model files exist (native JSON or pkl)
        if not MODEL_JSON_PATH.exists() and not MODEL_PKL_PATH.exists():
            logger.error(f"Model file not found: {MODEL_JSON_PATH} or {MODEL_PKL_PATH}")
            raise FileNotFoundError(f"Model file not found. Please train the model first using RUN_ALL_ML_STEPS.bat")
        
        if not SCALER_PATH.exists():
            logger.error(f"Scaler file not found: {SCALER_PATH}")
            raise FileNotFoundError(f"Scaler file not found. Please train the model first.")
        
        if not FEATURE_NAMES_PATH.exists():
            logger.error(f"Feature names file not found: {FEATURE_NAMES_PATH}")
            raise FileNotFoundError(f"Feature names file not found. Please train the model first.")
        
        # Load model (prefer native model.json, fallback to .pkl)
        if MODEL_JSON_PATH.exists():
            model = xgb.XGBRegressor()
            model.load_model(str(MODEL_JSON_PATH))
            logger.info(f"✓ Model loaded from {MODEL_JSON_PATH}")
        else:
            model = joblib.load(MODEL_PKL_PATH)
            logger.info(f"✓ Model loaded from {MODEL_PKL_PATH}")
        
        # Load scaler
        scaler = joblib.load(SCALER_PATH)
        logger.info(f"✓ Scaler loaded from {SCALER_PATH}")
        
        # Load feature names
        with open(FEATURE_NAMES_PATH, 'r') as f:
            feature_names = json.load(f)
        logger.info(f"✓ Feature names loaded: {len(feature_names)} features")
        
        # Load metrics if available
        if METRICS_PATH.exists():
            with open(METRICS_PATH, 'r') as f:
                metrics = json.load(f)
            logger.info(f"✓ Model metrics loaded")
        
        logger.info("=" * 60)
        logger.info("ML MODEL API READY")
        logger.info(f"Model: XGBoost Price Predictor")
        logger.info(f"Features: {len(feature_names)}")
        if metrics:
            logger.info(f"R² Score: {metrics.get('r2_score', 'N/A')}")
            logger.info(f"MAPE: {metrics.get('mape', 'N/A')}%")
        logger.info("=" * 60)
        
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        raise

@app.get("/", response_model=Dict)
def root():
    """Root endpoint with API information"""
    return {
        "message": "AI Market Pulse - ML Prediction API",
        "version": "1.0.0",
        "model": "XGBoost Regressor",
        "status": "ready" if model is not None else "not_ready",
        "endpoints": {
            "health": "/health",
            "predict": "/predict",
            "features": "/features",
            "docs": "/docs"
        }
    }

@app.get("/health", response_model=HealthResponse)
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy" if model is not None else "unhealthy",
        "model_loaded": model is not None,
        "features_count": len(feature_names),
        "model_metrics": metrics
    }

@app.get("/features", response_model=FeaturesResponse)
def get_features():
    """Get list of required features"""
    return {
        "features": feature_names,
        "count": len(feature_names)
    }


def _try_sagemaker_predict(feature_values: list) -> Optional[Tuple[float, str]]:
    """Try SageMaker endpoint; return (predicted_price, 'sagemaker') or None on failure."""
    if not SAGEMAKER_AVAILABLE or not SAGEMAKER_ENDPOINT_NAME:
        return None
    try:
        runtime = boto3.client("sagemaker-runtime", region_name=SAGEMAKER_REGION)
        body = json.dumps({"instances": [feature_values]})
        response = runtime.invoke_endpoint(
            EndpointName=SAGEMAKER_ENDPOINT_NAME,
            ContentType="application/json",
            Accept="application/json",
            Body=body,
        )
        result = json.loads(response["Body"].read().decode())
        predictions = result.get("predictions", result.get("prediction", []))
        if isinstance(predictions, (int, float)):
            pred = float(predictions)
        else:
            pred = float(predictions[0]) if predictions else None
        if pred is not None:
            return (pred, "sagemaker")
    except Exception as e:
        logger.warning(f"SageMaker endpoint failed, using local model: {e}")
    return None


@app.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    """
    Make price prediction using the trained model
    
    Args:
        request: PredictionRequest with features dictionary
        
    Returns:
        PredictionResponse with predicted price and confidence
    """
    try:
        # Extract features in correct order (needed for both SageMaker and local)
        feature_values = []
        missing_features = []
        
        for feature in feature_names:
            if feature in request.features:
                feature_values.append(request.features[feature])
            else:
                # Use 0 as default for missing features
                feature_values.append(0.0)
                missing_features.append(feature)
        
        if missing_features:
            logger.warning(f"Missing features (using 0 as default): {missing_features[:5]}...")
        
        # Try SageMaker first; fall back to local model on failure
        prediction = None
        model_source = "local"
        sagemaker_result = _try_sagemaker_predict(feature_values)
        if sagemaker_result is not None:
            prediction, model_source = sagemaker_result
            logger.info(f"Prediction from SageMaker: ₹{prediction:.2f}")
        
        if prediction is None and model is not None and scaler is not None:
            X = np.array([feature_values])
            X_scaled = scaler.transform(X)
            prediction = model.predict(X_scaled)[0]
            logger.info(f"Prediction from local model: ₹{prediction:.2f}")
        
        if prediction is None:
            raise HTTPException(
                status_code=503,
                detail="Prediction failed (SageMaker unavailable and local model not loaded)."
            )
        
        # Determine confidence based on model metrics
        # High confidence if R² > 0.8, Medium if > 0.6, Low otherwise
        r2_score = metrics.get('r2_score', 0)
        if r2_score > 0.8:
            confidence = "high"
        elif r2_score > 0.6:
            confidence = "medium"
        else:
            confidence = "low"
        
        logger.info(f"Prediction made: ₹{prediction:.2f} (confidence: {confidence}, source: {model_source})")
        
        return {
            "predicted_price": float(prediction),
            "confidence": confidence,
            "model_version": f"1.0.0 ({model_source})",
            "features_used": len([f for f in request.features if f in feature_names])
        }
    
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.get("/metrics")
def get_metrics():
    """Get model performance metrics"""
    if not metrics:
        raise HTTPException(status_code=404, detail="Metrics not available")
    return metrics

if __name__ == "__main__":
    import uvicorn
    
    print("=" * 60)
    print("Starting ML Model API Server")
    print("=" * 60)
    print("API will be available at: http://localhost:8001")
    print("API Documentation: http://localhost:8001/docs")
    print("=" * 60)
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8001,
        log_level="info"
    )
