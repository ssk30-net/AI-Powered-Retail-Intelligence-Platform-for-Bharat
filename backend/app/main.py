from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, dashboard, forecasts, sentiment, price_sensitivity, copilot, alerts, insights, data_upload, commodities, regions
from app.core.config import settings

app = FastAPI(
    title="AI Market Pulse API",
    description="AI-powered market intelligence and price forecasting platform",
    version="0.1.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(commodities.router, prefix="/api/v1/commodities", tags=["Commodities"])
app.include_router(regions.router, prefix="/api/v1/regions", tags=["Regions"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["Dashboard"])
app.include_router(forecasts.router, prefix="/api/v1/forecasts", tags=["Forecasts"])
app.include_router(sentiment.router, prefix="/api/v1/sentiment", tags=["Sentiment"])
app.include_router(price_sensitivity.router, prefix="/api/v1/price-sensitivity", tags=["Price Sensitivity"])
app.include_router(copilot.router, prefix="/api/v1/copilot", tags=["AI Copilot"])
app.include_router(alerts.router, prefix="/api/v1/alerts", tags=["Alerts"])
app.include_router(insights.router, prefix="/api/v1/insights", tags=["Insights"])
app.include_router(data_upload.router, prefix="/api/v1/data", tags=["Data Upload"])

@app.get("/")
async def root():
    return {
        "message": "AI Market Pulse API",
        "version": "0.1.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
