# Getting Started - AI Market Pulse

## ✅ Current Status

### Backend
- ✅ **Running** at http://localhost:8000
- ✅ Python 3.14.3 environment set up
- ✅ All dependencies installed
- ✅ API documentation at http://localhost:8000/docs

### Frontend
- ⏳ Not started yet

---

## 🚀 Start Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Visit: **http://localhost:3000**

Pages available:
- Landing page: http://localhost:3000/home
- Login: http://localhost:3000/login
- Register: http://localhost:3000/register
- Dashboard: http://localhost:3000/dashboard

---

## 🧪 Test Backend API

Visit: **http://localhost:8000/docs**

Try these endpoints (no database needed):
- `GET /api/v1/dashboard/overview` - Dashboard data
- `GET /api/v1/forecasts/commodities` - Commodity list
- `GET /api/v1/sentiment/overview` - Market sentiment
- `POST /api/v1/copilot/chat` - AI chat

---

## 🗄️ Optional: Setup Database

For user authentication (register/login), install PostgreSQL locally:

### Install PostgreSQL

**Download and Install:**
1. Visit: https://www.postgresql.org/download/windows/
2. Download PostgreSQL 16
3. Run installer (remember the password)
4. Default settings are fine

**Create Database:**
```bash
# Open Command Prompt
psql -U postgres

# Run these commands:
CREATE DATABASE aimarketpulse;
CREATE USER admin WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE aimarketpulse TO admin;
\q
```

**Initialize Database:**
```bash
cd backend
venv\Scripts\activate
python -m app.core.init_db
```

Backend will auto-reload and connect to database.

---

## 🐳 About Docker

**For Local Development:**
- ❌ Docker Desktop NOT needed
- ✅ PostgreSQL runs natively on Windows

**For AWS Deployment:**
- ✅ Docker images ARE needed
- ✅ GitHub Actions builds them (no local Docker needed)
- ✅ See `AWS_DEPLOYMENT.md` for details

---

## 📋 Common Commands

### Backend
```bash
# Start backend (if stopped)
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload

# Initialize database
python -m app.core.init_db

# Verify setup
python verify_setup.py
```

### Frontend
```bash
# Start frontend
cd frontend
npm run dev

# Build for production
npm run build

# Run linter
npm run lint
```

### Docker
```bash
# NOT NEEDED for local development
# Docker images are built by GitHub Actions for AWS deployment
# See AWS_DEPLOYMENT.md for deployment guide
```

---

## 📖 Documentation

- `README.md` - Project overview
- `SUCCESS_SUMMARY.md` - Setup success details
- `WORKING_FEATURES.md` - Feature status
- `API_ENDPOINTS.md` - API documentation
- `backend/README.md` - Backend documentation
- `backend/QUICK_START.md` - Backend quick start
- `frontend/README.md` - Frontend documentation

---

## 🎯 What's Working

### Backend (✅ Running)
- All API endpoints with mock data
- API documentation
- FastAPI application
- Python 3.14.3 environment

### Frontend (⏳ Ready to Start)
- Landing page
- Login/Register pages
- Dashboard UI
- API client configured

### Database (⏳ Optional)
- Not required for testing (mock data works)
- Needed for authentication (register/login)
- Install PostgreSQL locally

### Docker (For AWS Deployment Only)
- NOT needed for local development
- Images built by GitHub Actions
- See `AWS_DEPLOYMENT.md`

---

## 🛠️ Troubleshooting

### Backend won't start
```bash
cd backend
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend won't start
```bash
cd frontend
rm -rf node_modules .next
npm install
npm run dev
```

### Port already in use
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

---

**Next Step:** Start the frontend with `cd frontend && npm install && npm run dev`
