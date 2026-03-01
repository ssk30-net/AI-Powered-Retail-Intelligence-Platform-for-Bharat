# 🚀 AI Market Pulse - Complete Setup Guide

## Quick Start (5 Minutes)

### 1. Start Backend Server
```bash
cd backend
RUN_BACKEND.bat
```
Wait for: `✓ Backend server running on http://localhost:8000`

### 2. Start Frontend
```bash
cd frontend
npm run dev
```
Wait for: `✓ Frontend running on http://localhost:3000`

### 3. Open Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/docs

---

## Complete Data & ML Pipeline (25 Minutes)

### Step 1: Load All Data (10 minutes)
```bash
cd backend
LOAD_ALL_DATA.bat
```

This loads:
- ✅ Commodities (50+ items)
- ✅ Regions (37 states)
- ✅ Price History (50,000+ records)
- ✅ Sentiment Data (2,500+ records)
- ✅ Forecasts (2,500+ records)

### Step 2: Run ML Pipeline (15 minutes)
```bash
cd backend
RUN_ALL_ML_STEPS.bat
```

This creates:
- ✅ Training/validation/test datasets
- ✅ 45+ engineered features
- ✅ Trained XGBoost model
- ✅ Performance metrics & visualizations

---

## What You Get

### Backend Features
- ✅ User authentication (JWT)
- ✅ Commodity price tracking
- ✅ Sentiment analysis
- ✅ Price forecasting
- ✅ Regional market data
- ✅ RESTful API with Swagger docs

### Frontend Features
- ✅ Modern dashboard UI
- ✅ Interactive charts (Recharts)
- ✅ Real-time data visualization
- ✅ AI assistant chat
- ✅ Market sentiment indicators
- ✅ KPI cards with trends

### ML Pipeline
- ✅ Data verification
- ✅ Feature engineering (45+ features)
- ✅ XGBoost model training
- ✅ Model evaluation & metrics
- ✅ Feature importance analysis
- ✅ SageMaker deployment (optional)

---

## Project Structure

```
AI-Powered-Retail-Intelligence-Platform-for-Bharat/
├── backend/
│   ├── app/                    # FastAPI application
│   ├── ml_data/                # Training datasets (generated)
│   ├── models/                 # Trained models (generated)
│   ├── venv/                   # Python virtual environment
│   ├── RUN_BACKEND.bat         # Start backend server
│   ├── LOAD_ALL_DATA.bat       # Load all data
│   └── RUN_ALL_ML_STEPS.bat    # Complete ML pipeline
├── frontend/
│   ├── src/                    # Next.js application
│   ├── public/                 # Static assets
│   └── package.json            # Dependencies
└── Documentation/
    ├── START_HERE.md           # This file
    ├── ML_PIPELINE_READY.txt   # ML pipeline guide
    └── ML_COMPLETE_PIPELINE_GUIDE.md  # Detailed ML docs
```

---

## Database Schema

### Tables
1. **commodities** - Commodity master data
2. **regions** - Indian states/regions
3. **price_history** - Historical price records
4. **sentiment_data** - Market sentiment analysis
5. **forecasts** - Price predictions
6. **users** - User accounts

### Connection
- **Host**: database-1.cjqose8cc9yh.eu-north-1.rds.amazonaws.com
- **Database**: aimarketpulse
- **Port**: 5432
- **SSL**: Required

---

## Available Scripts

### Backend Scripts
```bash
# Server Management
RUN_BACKEND.bat              # Start backend server
START_BACKEND.bat            # Alternative start script
INIT_DATABASE.bat            # Initialize database

# Data Loading
LOAD_ALL_DATA.bat            # Load all data (complete workflow)
GENERATE_ML_DATA.bat         # Generate ML training data only
START_REALTIME_SIMULATOR.bat # Real-time data simulation

# ML Pipeline
RUN_ALL_ML_STEPS.bat         # Complete ML pipeline (Steps 1-4)
STEP1_VERIFY_DATA.bat        # Verify data quality
STEP2_EXPORT_DATA.bat        # Export training data
STEP4_TRAIN_MODEL.bat        # Train XGBoost model
TEST_MODEL.bat               # Test trained model
STEP5_DEPLOY_SAGEMAKER.bat   # Deploy to AWS SageMaker

# Utilities
INSTALL_PACKAGES.bat         # Install Python packages
```

### Frontend Scripts
```bash
npm run dev                  # Start development server
npm run build                # Build for production
npm run start                # Start production server
```

---

## ML Pipeline Details

### Features Generated (45+)

**Lag Features**
- price_lag_1, price_lag_7, price_lag_14, price_lag_30
- volume_lag_1, volume_lag_7, volume_lag_14, volume_lag_30

**Rolling Features**
- price_rolling_mean_7/14/30
- price_rolling_std_7/14/30 (volatility)
- price_rolling_min_7/14/30
- price_rolling_max_7/14/30

**Price Change Features**
- price_change_1d, price_change_7d, price_change_30d
- price_momentum_7d

**Sentiment Features**
- avg_sentiment, sentiment_count
- positive_count, negative_count, neutral_count

**Time Features**
- day_of_week, day, month, year, quarter, is_weekend

**Target**
- target_price_7d (price 7 days ahead)

### Model Performance Targets
- **R² Score**: > 0.70 (Good), > 0.85 (Excellent)
- **MAPE**: < 20% (Good), < 10% (Excellent)
- **RMSE**: Lower is better
- **MAE**: Lower is better

---

## Deployment Options

### Option A: Local Development
1. Run backend locally (port 8000)
2. Run frontend locally (port 3000)
3. Use trained model for predictions
4. Test with sample data

### Option B: AWS SageMaker
1. Run `STEP5_DEPLOY_SAGEMAKER.bat`
2. Model deployed to SageMaker endpoint
3. Scalable inference
4. Production-ready

### Option C: Full AWS Deployment
1. Backend on AWS ECS/Fargate
2. Frontend on Vercel/AWS Amplify
3. Model on SageMaker
4. Database on RDS (already configured)

---

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user

### Commodities
- `GET /api/v1/commodities` - List all commodities
- `GET /api/v1/commodities/{id}` - Get commodity details
- `GET /api/v1/commodities/{id}/prices` - Get price history

### Regions
- `GET /api/v1/regions` - List all regions
- `GET /api/v1/regions/{id}` - Get region details

### Sentiment
- `GET /api/v1/sentiment` - Get sentiment data
- `GET /api/v1/sentiment/commodity/{id}` - Commodity sentiment

### Forecasts
- `GET /api/v1/forecasts` - Get all forecasts
- `GET /api/v1/forecasts/commodity/{id}` - Commodity forecasts

### Predictions (ML)
- `POST /api/v1/predictions/price` - Predict price
- `POST /api/v1/predictions/batch` - Batch predictions

---

## Troubleshooting

### Backend Won't Start
```bash
# Check if port 8000 is in use
netstat -ano | findstr :8000

# Reinstall packages
cd backend
INSTALL_PACKAGES.bat
```

### Frontend Won't Start
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Database Connection Failed
- Check RDS security group allows your IP
- Verify credentials in `backend/.env`
- Test connection: `psql -h database-1.cjqose8cc9yh.eu-north-1.rds.amazonaws.com -U postgres -d aimarketpulse`

### ML Pipeline Fails
```bash
# Verify data first
cd backend
STEP1_VERIFY_DATA.bat

# If data missing, load it
LOAD_ALL_DATA.bat
```

### Model Training Fails
- Check if `ml_data/` folder exists
- Verify training data exported: `STEP2_EXPORT_DATA.bat`
- Check Python packages: `pip install xgboost scikit-learn`

---

## Next Steps

### Immediate (Today)
1. ✅ Start backend and frontend
2. ✅ Load data with `LOAD_ALL_DATA.bat`
3. ✅ Train model with `RUN_ALL_ML_STEPS.bat`
4. ✅ Test predictions

### Short Term (This Week)
1. Review model performance metrics
2. Test API endpoints with Swagger docs
3. Explore frontend dashboard
4. Test real-time data simulator

### Medium Term (This Month)
1. Deploy to AWS SageMaker
2. Integrate ML predictions with API
3. Add more features to frontend
4. Implement automated retraining

### Long Term (Next Quarter)
1. Multi-region deployment
2. Advanced ML models (LSTM, Transformers)
3. Real-time streaming predictions
4. Mobile app development

---

## Documentation Files

- `START_HERE.md` - This file (quick start)
- `ML_PIPELINE_READY.txt` - ML pipeline overview
- `ML_COMPLETE_PIPELINE_GUIDE.md` - Detailed ML guide
- `UNIFIED_DATA_LOADING_GUIDE.md` - Data loading guide
- `REALTIME_DATA_SIMULATOR_GUIDE.md` - Real-time simulator
- `ML_IMPLEMENTATION_ROADMAP.md` - Complete roadmap

---

## Support & Resources

### API Documentation
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### AWS Resources
- RDS Dashboard: AWS Console > RDS
- SageMaker: AWS Console > SageMaker
- S3 Buckets: AWS Console > S3

### Development Tools
- Backend: FastAPI, SQLAlchemy, XGBoost
- Frontend: Next.js, React, Recharts, Tailwind CSS
- Database: PostgreSQL (AWS RDS)
- ML: XGBoost, scikit-learn, pandas, numpy

---

## Success Checklist

### Backend Setup
- [ ] Backend server running on port 8000
- [ ] Database connection successful
- [ ] API docs accessible at /docs
- [ ] User registration/login working

### Data Loading
- [ ] Commodities loaded (50+)
- [ ] Regions loaded (37)
- [ ] Price history loaded (50,000+)
- [ ] Sentiment data loaded (2,500+)
- [ ] Forecasts loaded (2,500+)

### ML Pipeline
- [ ] Data verification passed
- [ ] Training data exported
- [ ] Model trained successfully
- [ ] Model metrics acceptable (R² > 0.70)
- [ ] Feature importance plot generated

### Frontend Setup
- [ ] Frontend running on port 3000
- [ ] Dashboard displays data
- [ ] Charts rendering correctly
- [ ] AI assistant functional
- [ ] Navigation working

---

## Quick Commands Reference

```bash
# Start Everything
cd backend && RUN_BACKEND.bat
cd frontend && npm run dev

# Load Data
cd backend && LOAD_ALL_DATA.bat

# Train Model
cd backend && RUN_ALL_ML_STEPS.bat

# Test Model
cd backend && TEST_MODEL.bat

# Deploy to SageMaker
cd backend && STEP5_DEPLOY_SAGEMAKER.bat

# Real-time Simulation
cd backend && START_REALTIME_SIMULATOR.bat
```

---

**Status**: ✅ Complete System Ready
**Last Updated**: March 1, 2026
**Version**: 1.0.0

🎉 **You're all set! Start with the Quick Start section above.**
