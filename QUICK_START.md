# ⚡ Quick Start - AI Market Pulse

**Get your system running in 3 minutes!**

---

## 🚀 Start the System (3 Terminals)

### Terminal 1: Backend API
```bash
cd backend
RUN_BACKEND.bat
```
✅ Backend at: http://localhost:8000

### Terminal 2: ML Model API
```bash
cd backend
START_ML_API.bat
```
✅ ML API at: http://localhost:8001

### Terminal 3: Frontend
```bash
cd frontend
npm run dev
```
✅ Frontend at: http://localhost:3000

---

## 🎯 Access Points

| Service | URL | Documentation |
|---------|-----|---------------|
| Frontend Dashboard | http://localhost:3000 | User Interface |
| Backend API | http://localhost:8000 | http://localhost:8000/docs |
| ML Model API | http://localhost:8001 | http://localhost:8001/docs |

---

## ✅ What You Get

### Real-time Dashboard
- Live commodity prices
- Sentiment analysis
- Price forecasts
- Interactive charts
- Auto-refresh every 30 seconds

### ML Predictions
- 7-day price forecasts
- Confidence scores
- Model metrics (R²=0.8508)
- Feature importance

### Data
- 50+ Commodities
- 37 Regions
- 50,000+ Price records
- 2,500+ Sentiment records
- 2,500+ Forecasts

---

## 🧪 Quick Test

### 1. Test Backend
```bash
curl http://localhost:8000/api/v1/commodities
```

### 2. Test ML API
```bash
curl http://localhost:8001/health
```

### 3. Test Frontend
Open http://localhost:3000 in your browser

---

## 📚 Documentation

- **Complete Guide**: `COMPLETE_SYSTEM_STARTUP_GUIDE.md`
- **Integration Details**: `FRONTEND_INTEGRATION_COMPLETE.md`
- **Summary**: `INTEGRATION_SUMMARY.md`
- **Model Performance**: `MODEL_PERFORMANCE_REPORT.md`

---

## 🐛 Issues?

### Backend won't start
→ Check database connection in `backend/.env`

### ML API won't start
→ Run `backend/RUN_ALL_ML_STEPS.bat` to train model

### Frontend won't start
→ Run `npm install` in frontend directory

### Data not loading
→ Ensure all three services are running

---

## 🎉 You're Ready!

Your AI Market Pulse system is now running with:
- ✅ Real-time data
- ✅ ML predictions
- ✅ Interactive dashboard
- ✅ Production-ready model

**Start exploring at http://localhost:3000**

---

**Need help?** Check `COMPLETE_SYSTEM_STARTUP_GUIDE.md` for detailed instructions.
