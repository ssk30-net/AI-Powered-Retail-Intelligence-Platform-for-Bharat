# AI Market Pulse - Backend API

FastAPI backend for AI Market Pulse platform.

## Tech Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Authentication**: JWT (python-jose)
- **Password Hashing**: bcrypt (passlib)
- **Validation**: Pydantic

## Project Structure

```
backend/
├── app/
│   ├── routes/          # API route handlers
│   │   ├── auth.py
│   │   ├── dashboard.py
│   │   ├── forecasts.py
│   │   ├── sentiment.py
│   │   ├── price_sensitivity.py
│   │   ├── copilot.py
│   │   ├── alerts.py
│   │   ├── insights.py
│   │   └── data_upload.py
│   │
│   ├── core/            # Core functionality
│   │   ├── config.py
│   │   ├── database.py
│   │   └── security.py
│   │
│   ├── models/          # Database models
│   │   └── user.py
│   │
│   ├── schemas/         # Pydantic schemas
│   │   ├── user.py
│   │   └── response.py
│   │
│   └── main.py          # FastAPI application
│
├── .env.example
├── requirements.txt
└── README.md
```

## Getting Started

### Prerequisites

- Python 3.10+
- PostgreSQL 14+
- pip

### Installation

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create environment file:
```bash
copy .env.example .env
```

5. Update `.env` with your configuration

6. Create database:
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE aimarketpulse;
CREATE USER admin WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE aimarketpulse TO admin;
```

7. Run database migrations:
```bash
python -m app.core.init_db
```

### Running the Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: **http://localhost:8000**

API Documentation: **http://localhost:8000/docs**

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/logout` - Logout user

### Dashboard
- `GET /api/v1/dashboard/overview` - Get dashboard overview
- `GET /api/v1/dashboard/kpis` - Get KPIs
- `GET /api/v1/dashboard/price-trends` - Get price trends

### Forecasts
- `GET /api/v1/forecasts/commodities` - List commodities
- `GET /api/v1/forecasts/{commodity_id}` - Get forecast

### Sentiment
- `GET /api/v1/sentiment/overview` - Sentiment overview
- `GET /api/v1/sentiment/{commodity_id}` - Commodity sentiment

### Price Sensitivity
- `GET /api/v1/price-sensitivity/{commodity_id}` - Get sensitivity data
- `POST /api/v1/price-sensitivity/simulate` - Simulate price change

### AI Copilot
- `POST /api/v1/copilot/chat` - Chat with AI
- `GET /api/v1/copilot/history` - Get chat history

### Data Upload
- `POST /api/v1/data/upload` - Upload data file
- `GET /api/v1/data/upload-status/{upload_id}` - Check upload status

### Alerts
- `GET /api/v1/alerts` - Get alerts

### Insights
- `GET /api/v1/insights/overview` - Get insights overview

## Development

### Run with auto-reload
```bash
uvicorn app.main:app --reload
```

### Run tests
```bash
pytest
```

### Format code
```bash
black app/
isort app/
```

### Lint code
```bash
flake8 app/
mypy app/
```

## Deployment

### Using Docker
```bash
docker build -t ai-market-pulse-backend .
docker run -p 8000:8000 ai-market-pulse-backend
```

### Using AWS EC2
1. Set up EC2 instance
2. Install Python and dependencies
3. Configure environment variables
4. Run with gunicorn:
```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## Environment Variables

See `.env.example` for all required environment variables.

## License

MIT License
