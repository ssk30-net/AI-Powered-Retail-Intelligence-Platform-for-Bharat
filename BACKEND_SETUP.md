# Backend Setup Guide - AI Market Pulse

## Quick Start

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Create Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Setup Environment Variables
```bash
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

Edit `.env` file with your configuration.

### 5. Setup Database

**Option 1: Using Docker (Recommended)**
```bash
docker run --name aimarketpulse-db \
  -e POSTGRES_DB=aimarketpulse \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:16-alpine
```

**Option 2: Local PostgreSQL**
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE aimarketpulse;
CREATE USER admin WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE aimarketpulse TO admin;
\q
```

### 6. Initialize Database Tables
```bash
python -m app.core.init_db
```

### 7. Run Development Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: **http://localhost:8000**

API Documentation: **http://localhost:8000/docs**

---

## Project Structure

```
backend/
├── app/
│   ├── routes/              # API endpoints
│   │   ├── auth.py         # Authentication
│   │   ├── dashboard.py    # Dashboard data
│   │   ├── forecasts.py    # Price forecasting
│   │   ├── sentiment.py    # Sentiment analysis
│   │   ├── price_sensitivity.py  # Price simulation
│   │   ├── copilot.py      # AI Copilot
│   │   ├── alerts.py       # Alerts system
│   │   ├── insights.py     # Insights
│   │   └── data_upload.py  # Data upload
│   │
│   ├── core/               # Core functionality
│   │   ├── config.py       # Configuration
│   │   ├── database.py     # Database connection
│   │   ├── security.py     # JWT & password hashing
│   │   └── init_db.py      # Database initialization
│   │
│   ├── models/             # SQLAlchemy models
│   │   └── user.py         # User model
│   │
│   ├── schemas/            # Pydantic schemas
│   │   ├── user.py         # User schemas
│   │   └── response.py     # API response schemas
│   │
│   └── main.py             # FastAPI application
│
├── .env.example            # Environment variables template
├── .gitignore             # Git ignore rules
├── requirements.txt       # Python dependencies
└── README.md              # Documentation
```

---

## Available Commands

### Development
```bash
uvicorn app.main:app --reload    # Start with auto-reload
```

### Production
```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Database
```bash
python -m app.core.init_db       # Initialize database tables
```

### Code Quality
```bash
black app/                       # Format code
isort app/                       # Sort imports
flake8 app/                      # Lint code
mypy app/                        # Type checking
```

---

## API Endpoints

### Authentication (`/api/v1/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `POST /refresh-token` - Refresh access token
- `GET /me` - Get current user info
- `POST /logout` - Logout user

### Dashboard (`/api/v1/dashboard`)
- `GET /overview` - Dashboard overview with KPIs
- `GET /kpis` - Key performance indicators
- `GET /price-trends` - Price trend data

### Forecasts (`/api/v1/forecasts`)
- `GET /commodities` - List all commodities
- `GET /{commodity_id}` - Get price forecast

### Sentiment (`/api/v1/sentiment`)
- `GET /overview` - Overall market sentiment
- `GET /{commodity_id}` - Commodity-specific sentiment

### Price Sensitivity (`/api/v1/price-sensitivity`)
- `GET /{commodity_id}` - Get price sensitivity data
- `POST /simulate` - Simulate price changes

### AI Copilot (`/api/v1/copilot`)
- `POST /chat` - Chat with AI assistant
- `GET /history` - Get conversation history

### Data Upload (`/api/v1/data`)
- `POST /upload` - Upload data file
- `GET /upload-status/{upload_id}` - Check upload status

### Alerts (`/api/v1/alerts`)
- `GET /` - Get user alerts

### Insights (`/api/v1/insights`)
- `GET /overview` - Get insights overview

---

## Testing the API

### Using Swagger UI
Visit: **http://localhost:8000/docs**

### Using cURL

**Register User:**
```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User"
  }'
```

**Login:**
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Get Dashboard (with token):**
```bash
curl -X GET "http://localhost:8000/api/v1/dashboard/overview" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

### Database Connection Error
1. Check PostgreSQL is running
2. Verify DATABASE_URL in `.env`
3. Ensure database exists
4. Check user permissions

### Module Not Found
```bash
pip install -r requirements.txt
```

### Import Errors
Make sure you're in the backend directory and virtual environment is activated.

---

## Deployment

### Docker
```dockerfile
FROM python:3.10-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t ai-market-pulse-backend .
docker run -p 8000:8000 ai-market-pulse-backend
```

### AWS EC2
1. Launch EC2 instance (Ubuntu 22.04)
2. Install Python and PostgreSQL
3. Clone repository
4. Install dependencies
5. Configure environment variables
6. Run with gunicorn

---

## Security Notes

- Change `SECRET_KEY` in production
- Use strong passwords
- Enable HTTPS in production
- Set up firewall rules
- Regular security updates
- Use environment variables for secrets

---

## Next Steps

1. ✅ Backend setup complete
2. 🔨 Test API endpoints
3. 🔗 Connect frontend to backend
4. 📊 Implement ML models
5. 🚀 Deploy to production

---

**Happy Coding! 🚀**
