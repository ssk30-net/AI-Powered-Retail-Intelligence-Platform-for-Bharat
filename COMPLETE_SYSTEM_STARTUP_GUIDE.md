# 🚀 Complete System Startup Guide

**AI Market Pulse - Full Stack Application**

This guide will help you start the complete system: Backend API + ML Model API + Frontend Dashboard

---

## 📋 Prerequisites

Before starting, ensure you have:

- ✅ Python 3.14 installed
- ✅ Node.js and npm installed
- ✅ Virtual environment created (`backend/venv`)
- ✅ All Python packages installed
- ✅ Data loaded into database
- ✅ ML model trained

If you haven't done these steps, see the [Quick Setup](#quick-setup) section below.

---

## 🎯 Quick Start (3 Terminals)

### Terminal 1: Backend API

```bash
cd backend
RUN_BACKEND.bat
```

**Backend will start at:** http://localhost:8000
**API Documentation:** http://localhost:8000/docs

### Terminal 2: ML Model API

```bash
cd backend
START_ML_API.bat
```

**ML API will start at:** http://localhost:8001
**ML API Documentation:** http://localhost:8001/docs

### Terminal 3: Frontend Dashboard

```bash
cd frontend
npm run dev
```

**Frontend will start at:** http://localhost:3000

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     USER BROWSER                            │
│                  http://localhost:3000                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  FRONTEND (Next.js)                         │
│  - Dashboard with real-time data                           │
│  - Interactive charts                                       │
│  - ML predictions interface                                │
└────────┬──────────────────────────────────┬─────────────────┘
         │                                  │
         ▼                                  ▼
┌────────────────────────┐    ┌────────────────────────────┐
│  BACKEND API (FastAPI) │    │  ML MODEL API (FastAPI)    │
│  http://localhost:8000 │    │  http://localhost:8001     │
│                        │    │                            │
│  - Authentication      │    │  - Price predictions       │
│  - Commodities data    │    │  - XGBoost model           │
│  - Sentiment data      │    │  - Feature engineering     │
│  - Forecasts           │    │  - Model metrics           │
│  - Regions             │    │                            │
└────────┬───────────────┘    └────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL Database (AWS RDS)                  │
│  database-1.cjqose8cc9yh.eu-north-1.rds.amazonaws.com     │
│                                                             │
│  - 50+ Commodities                                         │
│  - 37 Regions                                              │
│  - 50,000+ Price records                                   │
│  - 2,500+ Sentiment records                                │
│  - 2,500+ Forecasts                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Detailed Startup Instructions

### Step 1: Start Backend API

The backend API provides all the data endpoints for commodities, sentiment, forecasts, etc.

```bash
cd backend
RUN_BACKEND.bat
```

**What it does:**
- Activates Python virtual environment
- Starts FastAPI server on port 8000
- Connects to PostgreSQL database
- Enables CORS for frontend access

**Verify it's working:**
- Open http://localhost:8000/docs
- You should see Swagger API documentation
- Try the `/api/v1/commodities` endpoint

**Common issues:**
- **Port 8000 already in use**: Stop other services or change port in `app/main.py`
- **Database connection error**: Check `.env` file has correct RDS credentials
- **Module not found**: Run `INSTALL_PACKAGES.bat` to install dependencies

### Step 2: Start ML Model API

The ML API serves the trained XGBoost model for price predictions.

```bash
cd backend
START_ML_API.bat
```

**What it does:**
- Activates Python virtual environment
- Loads trained model from `models/` directory
- Starts FastAPI server on port 8001
- Provides prediction endpoint

**Verify it's working:**
- Open http://localhost:8001/docs
- You should see ML API documentation
- Try the `/health` endpoint
- Check model metrics at `/metrics`

**Common issues:**
- **Model not found**: Run `RUN_ALL_ML_STEPS.bat` to train the model first
- **Port 8001 already in use**: Change port in `serve_model.py`
- **Import errors**: Ensure all ML packages are installed (xgboost, scikit-learn)

### Step 3: Start Frontend Dashboard

The frontend provides the user interface for the application.

```bash
cd frontend
npm run dev
```

**What it does:**
- Starts Next.js development server
- Connects to backend API (port 8000)
- Connects to ML API (port 8001)
- Hot-reloads on code changes

**Verify it's working:**
- Open http://localhost:3000
- You should see the landing page
- Navigate to dashboard
- Check if data is loading

**Common issues:**
- **npm not found**: Install Node.js from https://nodejs.org
- **Dependencies missing**: Run `npm install` in frontend directory
- **API connection errors**: Ensure backend and ML API are running
- **CORS errors**: Check backend CORS settings in `app/main.py`

---

## 🧪 Testing the Complete System

### 1. Test Backend API

```bash
# Get all commodities
curl http://localhost:8000/api/v1/commodities

# Get sentiment data
curl http://localhost:8000/api/v1/sentiment?limit=10

# Get forecasts
curl http://localhost:8000/api/v1/forecasts?limit=10
```

### 2. Test ML API

```bash
# Health check
curl http://localhost:8001/health

# Get model metrics
curl http://localhost:8001/metrics

# Make prediction
curl -X POST http://localhost:8001/predict \
  -H "Content-Type: application/json" \
  -d "{\"features\": {\"price_lag_1\": 2500, \"price_lag_7\": 2480}}"
```

### 3. Test Frontend

1. Open http://localhost:3000
2. Navigate to Dashboard
3. Check if KPI cards show real data
4. Verify charts are displaying
5. Test ML predictions page
6. Check real-time updates (data refreshes every 30 seconds)

---

## 📱 Application Features

### Dashboard Page
- **KPI Cards**: Total commodities, average sentiment, active forecasts
- **Sentiment Indicator**: Visual representation of market sentiment
- **Trend Charts**: Historical sentiment and price trends
- **Commodity List**: Browse all tracked commodities

### Markets Page
- **Price History**: View historical prices for each commodity
- **Regional Data**: Compare prices across different regions
- **Volume Analysis**: Track trading volumes

### Sentiment Page
- **Sentiment Analysis**: View sentiment scores and trends
- **News Headlines**: Recent news affecting commodity prices
- **Sentiment Distribution**: Positive, negative, neutral breakdown

### Forecasts Page
- **Price Predictions**: 7-day ahead price forecasts
- **Confidence Scores**: Model confidence for each prediction
- **Historical Accuracy**: Compare predictions vs actual prices

### ML Predictions Page (NEW!)
- **Custom Predictions**: Input features and get price predictions
- **Feature Selection**: Choose which features to use
- **Confidence Levels**: High/Medium/Low confidence indicators
- **Model Metrics**: View model performance statistics

---

## 🔄 Real-time Updates

The frontend automatically refreshes data every 30 seconds:

- Dashboard statistics
- Sentiment data
- Forecasts
- Price history

You can customize the refresh interval in the component code.

---

## 🛑 Stopping the System

### Stop Backend API
- Press `Ctrl+C` in Terminal 1

### Stop ML API
- Press `Ctrl+C` in Terminal 2

### Stop Frontend
- Press `Ctrl+C` in Terminal 3

---

## 📦 Quick Setup (First Time)

If you haven't set up the system yet, follow these steps:

### 1. Install Python Packages

```bash
cd backend
INSTALL_PACKAGES.bat
```

### 2. Load Data into Database

```bash
cd backend
LOAD_ALL_DATA.bat
```

This will:
- Load commodity data
- Load region data
- Generate price history
- Generate sentiment data
- Generate forecasts

**Time**: ~10 minutes

### 3. Train ML Model

```bash
cd backend
RUN_ALL_ML_STEPS.bat
```

This will:
- Verify data structure
- Export training data
- Engineer features
- Train XGBoost model
- Save model artifacts

**Time**: ~15 minutes

### 4. Install Frontend Dependencies

```bash
cd frontend
npm install
```

**Time**: ~5 minutes

### 5. Start the System

Follow the [Quick Start](#quick-start-3-terminals) instructions above.

---

## 🔐 Authentication

### Default Test User

If you need to test authentication:

1. Register a new user via API:
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"test@example.com\", \"password\": \"test123\", \"full_name\": \"Test User\"}"
```

2. Login via frontend:
- Email: test@example.com
- Password: test123

---

## 📊 Model Performance

Your trained model has excellent performance:

- **R² Score**: 0.8508 (EXCELLENT)
- **MAPE**: 11.83% (GOOD)
- **Accuracy (±10%)**: 58.81% (GOOD)
- **Status**: ✅ PRODUCTION READY

See `MODEL_PERFORMANCE_REPORT.md` for detailed analysis.

---

## 🐛 Troubleshooting

### Backend won't start
- Check if port 8000 is available
- Verify database connection in `.env`
- Check Python virtual environment is activated

### ML API won't start
- Ensure model is trained (`models/xgboost_price_predictor.pkl` exists)
- Check if port 8001 is available
- Verify all ML packages are installed

### Frontend won't start
- Run `npm install` to install dependencies
- Check if ports 8000 and 8001 are accessible
- Verify `.env.local` has correct API URLs

### Data not loading in frontend
- Check browser console for errors
- Verify backend API is running
- Check CORS settings in backend
- Ensure database has data

### Predictions not working
- Verify ML API is running
- Check model is loaded (visit `/health` endpoint)
- Ensure all required features are provided

---

## 📚 Additional Resources

- **API Documentation**: http://localhost:8000/docs
- **ML API Documentation**: http://localhost:8001/docs
- **Project Status**: See `PROJECT_STATUS.md`
- **ML Implementation**: See `ML_IMPLEMENTATION_ROADMAP.md`
- **Model Performance**: See `MODEL_PERFORMANCE_REPORT.md`
- **Frontend Integration**: See `FRONTEND_DYNAMIC_INTEGRATION.md`

---

## 🎉 Success Checklist

- [ ] Backend API running on port 8000
- [ ] ML API running on port 8001
- [ ] Frontend running on port 3000
- [ ] Can access API documentation
- [ ] Dashboard shows real data
- [ ] Charts are displaying correctly
- [ ] ML predictions are working
- [ ] Real-time updates are functioning

---

## 🚀 Next Steps

Once everything is running:

1. **Explore the Dashboard**: Navigate through all pages
2. **Test ML Predictions**: Try different feature combinations
3. **Monitor Performance**: Check model metrics and accuracy
4. **Customize Frontend**: Modify components to your needs
5. **Deploy to Production**: Follow AWS deployment guides

---

## 💡 Tips

- **Development Mode**: All three servers support hot-reload
- **API Testing**: Use Swagger UI for easy API testing
- **Model Updates**: Retrain model periodically with new data
- **Performance**: Monitor API response times in browser DevTools
- **Logs**: Check terminal output for errors and warnings

---

**Status**: ✅ System is production-ready and fully functional!

**Last Updated**: March 2, 2026

---

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the logs in each terminal
3. Verify all prerequisites are met
4. Check the relevant documentation files

---

**Happy coding! 🎉**
