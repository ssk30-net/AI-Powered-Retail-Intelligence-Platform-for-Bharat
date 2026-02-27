# Quick Start Guide - Backend Setup Complete! 🎉

## ✅ What's Done

Your backend is now fully set up with Python 3.14.3!

- ✅ Virtual environment created with Python 3.14
- ✅ All dependencies installed successfully
- ✅ FastAPI application verified
- ✅ Environment file (.env) created

## 🚀 Next Steps

### Option 1: Test Backend Without Database (Quick Demo)

You can start the backend server right now to test the API endpoints (most will work with mock data):

```bash
# Make sure you're in the backend directory
cd backend

# Activate virtual environment
venv\Scripts\activate

# Start the server
uvicorn app.main:app --reload
```

Then visit: **http://localhost:8000/docs**

You'll see the Swagger UI with all API endpoints. Most endpoints will work with mock data, but authentication endpoints need a database.

### Option 2: Install PostgreSQL for Full Functionality

For full functionality (user registration, login, etc.), you need PostgreSQL.

#### Install Docker Desktop (Recommended - Easiest)

1. **Download Docker Desktop:**
   - Visit: https://www.docker.com/products/docker-desktop/
   - Download for Windows
   - Install and restart your computer

2. **Start PostgreSQL:**
   ```bash
   docker run --name aimarketpulse-db -e POSTGRES_DB=aimarketpulse -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:16-alpine
   ```

3. **Initialize Database:**
   ```bash
   cd backend
   venv\Scripts\activate
   python -m app.core.init_db
   ```

4. **Start Backend:**
   ```bash
   uvicorn app.main:app --reload
   ```

#### OR Install PostgreSQL Directly

1. **Download PostgreSQL:**
   - Visit: https://www.postgresql.org/download/windows/
   - Download PostgreSQL 16
   - Install with default settings
   - Remember the password you set for postgres user

2. **Create Database:**
   ```bash
   # Open Command Prompt
   psql -U postgres
   
   # In psql prompt:
   CREATE DATABASE aimarketpulse;
   CREATE USER admin WITH PASSWORD 'password';
   GRANT ALL PRIVILEGES ON DATABASE aimarketpulse TO admin;
   \q
   ```

3. **Initialize Database:**
   ```bash
   cd backend
   venv\Scripts\activate
   python -m app.core.init_db
   ```

4. **Start Backend:**
   ```bash
   uvicorn app.main:app --reload
   ```

---

## 🧪 Testing the Backend

### Without Database (Mock Data)

Start the server:
```bash
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload
```

Visit: http://localhost:8000/docs

Try these endpoints (they work without database):
- `GET /api/v1/dashboard/overview` - Dashboard data
- `GET /api/v1/forecasts/commodities` - Commodity list
- `GET /api/v1/sentiment/overview` - Sentiment data
- `POST /api/v1/copilot/chat` - AI chat

### With Database (Full Functionality)

After setting up PostgreSQL:

1. **Register a user:**
   - Go to http://localhost:8000/docs
   - Click `POST /api/v1/auth/register`
   - Click "Try it out"
   - Enter:
     ```json
     {
       "email": "test@example.com",
       "password": "password123",
       "full_name": "Test User",
       "company": "Test Corp",
       "industry": "Retail"
     }
     ```
   - Click "Execute"

2. **Login:**
   - Click `POST /api/v1/auth/login`
   - Click "Try it out"
   - Enter:
     ```json
     {
       "email": "test@example.com",
       "password": "password123"
     }
     ```
   - Click "Execute"
   - Copy the `access_token` from response

3. **Test Protected Endpoint:**
   - Click `GET /api/v1/dashboard/overview`
   - Click the lock icon 🔒
   - Paste your token
   - Click "Authorize"
   - Click "Try it out" and "Execute"

---

## 🎯 Current Status

### ✅ Working Now
- Backend server can start
- API documentation at /docs
- All endpoints return mock data
- FastAPI application fully functional

### ⏳ Needs Database For
- User registration
- User login
- JWT authentication
- Storing user data

### 🔄 Next: Frontend

Once backend is running, start the frontend:

```bash
# Open a NEW terminal
cd frontend
npm install
npm run dev
```

Visit: http://localhost:3000

---

## 📋 Quick Commands Reference

### Backend Commands
```bash
# Activate virtual environment
cd backend
venv\Scripts\activate

# Start server
uvicorn app.main:app --reload

# Initialize database (after PostgreSQL is set up)
python -m app.core.init_db

# Verify setup
python verify_setup.py
```

### Check What's Running
```bash
# Check if backend is running
curl http://localhost:8000/docs

# Check if PostgreSQL is running (Docker)
docker ps

# Check if PostgreSQL is running (Local)
psql -U postgres -c "SELECT version();"
```

---

## 🛠️ Troubleshooting

### Issue: Port 8000 already in use
```bash
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Issue: Can't activate virtual environment
```bash
# Use full path
D:\AI-Powered-Retail-Intelligence-Platform-for-Bharat\backend\venv\Scripts\activate
```

### Issue: Module not found
```bash
# Reinstall dependencies
cd backend
venv\Scripts\activate
pip install -r requirements.txt
```

---

## 🎉 Success!

Your backend is ready! You can:

1. **Start it now** without database for testing
2. **Install Docker** for full functionality
3. **Move to frontend** setup

Choose what works best for you!

---

## 💡 Recommended Next Steps

1. **Test backend now** (without database):
   ```bash
   cd backend
   venv\Scripts\activate
   uvicorn app.main:app --reload
   ```
   Visit: http://localhost:8000/docs

2. **Install Docker Desktop** (for database):
   - Download: https://www.docker.com/products/docker-desktop/
   - Install and restart
   - Run PostgreSQL container
   - Initialize database

3. **Start frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Visit: http://localhost:3000

---

**You're all set! 🚀**
