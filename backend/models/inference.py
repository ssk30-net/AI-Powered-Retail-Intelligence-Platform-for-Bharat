import json
import os
import joblib
import numpy as np

def model_fn(model_dir):
    """Load the model and artifacts from the model directory."""
    model = joblib.load(os.path.join(model_dir, "xgboost_price_predictor.pkl"))
    scaler = joblib.load(os.path.join(model_dir, "scaler.pkl"))
    
    with open(os.path.join(model_dir, "feature_names.json"), "r") as f:
        feature_names = json.load(f)
    
    return {
        "model": model,
        "scaler": scaler,
        "feature_names": feature_names
    }


def input_fn(request_body, request_content_type):
    """Parse input data."""
    if request_content_type == "application/json":
        data = json.loads(request_body)
        return np.array(data["instances"])
    else:
        raise ValueError("Unsupported content type: {}".format(request_content_type))


def predict_fn(input_data, model_artifacts):
    """Make prediction."""
    model = model_artifacts["model"]
    scaler = model_artifacts["scaler"]

    scaled_data = scaler.transform(input_data)
    prediction = model.predict(scaled_data)

    return prediction


def output_fn(prediction, response_content_type):
    """Format output."""
    if response_content_type == "application/json":
        return json.dumps({"predictions": prediction.tolist()}), response_content_type
    else:
        raise ValueError("Unsupported response content type: {}".format(response_content_type))