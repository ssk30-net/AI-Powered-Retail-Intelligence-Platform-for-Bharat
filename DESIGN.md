# AI Market Pulse - System Design Document

**Version**: 2.0 (Updated with Current Implementation)  
**Date**: March 2, 2026  
**Status**: Production Ready

---

## 1. Executive Summary

AI Market Pulse is an AI-powered retail intelligence platform for the Indian market that provides real-time commodity price tracking, ML-powered forecasting, and sentiment analysis. This document outlines the implemented architecture, data flows, and technical specifications.

### Current Implementation Status

- ✅ Backend API (FastAPI + PostgreSQL)
- ✅ Frontend Dashboard (Next.js + React)
- ✅ ML Model (XGBoost, R²=0.8508)
- ✅ Local ML API (FastAPI serving model)
- ✅ Data Pipeline (50,000+ records)
- ✅ Sentiment Analysis (TextBlob + VADER)
- ✅ Real-time Updates (30s refresh)

---

## 2. System Architecture Overview

### 2.1 Current Implementation Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER BROWSER                               │
│                  http://localhost:3000                          │
│  - Dashboard (Dynamic with real data)                          │
│  - Forecasts (Dynamic with real data)                          │
│  - ML Predictions Interface                                    │
│  - Sentiment Analysis                                          │
│  - Markets & Insights                                          │
└────────────────────┬────────────────────────────────────────────┘
                     │ REST API (JWT Auth)
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Next.js 14 + React 18 + TypeScript                      │  │
│  │  ├── API Client (axios)                                  │  │
│  │  ├── React Hooks (useAPI.ts)                             │  │
│  │  ├── Real-time Updates (30s refresh)                     │  │
│  │  ├── State Management                                    │  │
│  │  └── Tailwind CSS + Recharts                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│  Port: 3000                                                     │
└────────┬──────────────────────────────────┬─────────────────────┘
         │ HTTP/REST                        │ HTTP/REST
         ▼                                  ▼
┌────────────────────────┐    ┌────────────────────────────────┐
│   BACKEND API          │    │     ML MODEL API               │
│  ┌──────────────────┐  │    │  ┌──────────────────────────┐  │
│  │  FastAPI 0.134   │  │    │  │  FastAPI + XGBoost       │  │
│  │  ├── Routes      │  │    │  │  ├── Model Loading       │  │
│  │  │   ├── auth    │  │    │  │  ├── Feature Scaling     │  │
│  │  │   ├── commod. │  │    │  │  ├── Predictions         │  │
│  │  │   ├── regions │  │    │  │  ├── Metrics             │  │
│  │  │   ├── sentim. │  │    │  │  └── Health Checks       │  │
│  │  │   └── forecas.│  │    │  └──────────────────────────┘  │
│  │  ├── Models      │  │    │  Model: xgboost_price_pred.pkl │
│  │  ├── Services    │  │    │  R² Score: 0.8508              │
│  │  └── Security    │  │    │  MAPE: 11.83%                  │
│  └──────────────────┘  │    │  Port: 8001                    │
│  Port: 8000            │    └────────────────────────────────┘
└────────┬───────────────┘
         │ SQLAlchemy ORM
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  PostgreSQL 15 (AWS RDS)                                 │  │
│  │  ├── commodities (50+)                                   │  │
│  │  ├── regions (37)                                        │  │
│  │  ├── price_history (50,000+)                             │  │
│  │  ├── sentiment_data (2,500+)                             │  │
│  │  ├── forecasts (2,500+)                                  │  │
│  │  └── users                                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│  Host: database-1.cjqose8cc9yh.eu-north-1.rds.amazonaws.com   │
│  Port: 5432                                                     │
│  Database: aimarketpulse                                        │
│  Region: eu-north-1 (Stockholm)                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack (Implemented)

### 3.1 Frontend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14 | React framework with SSR |
| React | 18 | UI library |
| TypeScript | 5+ | Type safety |
| Tailwind CSS | 3+ | Utility-first CSS |
| Recharts | 2+ | Data visualization |
| Axios | 1+ | HTTP client |
| Lucide React | - | Icon library |

### 3.2 Backend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.14 | Programming language |
| FastAPI | 0.134 | Modern web framework |
| SQLAlchemy | 2.0.47 | ORM for database |
| PostgreSQL | 15 | Relational database |
| Uvicorn | 0.41 | ASGI server |
| Pydantic | 2+ | Data validation |
| python-jose | 3+ | JWT implementation |
| passlib[bcrypt] | 1+ | Password hashing |
| psycopg2-binary | 2+ | PostgreSQL driver |

### 3.3 ML & Data Science Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| XGBoost | 2+ | Gradient boosting |
| scikit-learn | 1.8.0 | ML utilities |
| pandas | 3.0.1 | Data manipulation |
| numpy | 2.4.2 | Numerical computing |
| joblib | 1.5.3 | Model serialization |

### 3.4 NLP & Sentiment Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| TextBlob | 0.19.0 | Sentiment analysis |
| NLTK | 3.9.3 | NLP toolkit |
| VADER Sentiment | 3.3.2 | Social media sentiment |

### 3.5 Infrastructure

| Service | Purpose | Status |
|---------|---------|--------|
| AWS RDS | PostgreSQL hosting | ✅ Active |
| Local Server | Development | ✅ Active |
| AWS S3 | Model storage (optional) | 📋 Planned |
| AWS SageMaker | ML deployment (optional) | 📋 Planned |

---

## 4. Data Flow (Implemented)

### 4.1 Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATA SOURCES                                 │
│  ├── CSV Files (commodities, regions, prices)                  │
│  ├── Synthetic Data Generator (GBM for price history)          │
│  └── ML Training Data Generator (sentiment + forecasts)        │
└────────────────────────┬────────────────────────────────────────┘
                         │ data_loader.py
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  POSTGRESQL DATABASE                            │
│  ├── commodities (50+)                                          │
│  ├── regions (37)                                               │
│  ├── price_history (50,000+)                                    │
│  ├── sentiment_data (2,500+)                                    │
│  └── forecasts (2,500+)                                         │
└────────┬────────────────────────────────────┬─────────────────┘
         │                                    │
         │ export_training_data.py            │ API Queries
         ▼                                    ▼
┌────────────────────────┐    ┌────────────────────────────────┐
│   ML TRAINING          │    │     BACKEND API                │
│  ├── Feature Eng.      │    │  ├── GET /commodities          │
│  ├── train_model.py    │    │  ├── GET /sentiment            │
│  ├── XGBoost Training  │    │  ├── GET /forecasts            │
│  └── Model Artifacts   │    │  └── GET /regions              │
└────────┬───────────────┘    └────────┬───────────────────────┘
         │                              │
         ▼                              ▼
┌────────────────────────┐    ┌────────────────────────────────┐
│   ML MODEL API         │    │     FRONTEND                   │
│  serve_model.py        │    │  ├── Dashboard (Dynamic)       │
│  ├── Load Model        │    │  ├── Forecasts (Dynamic)       │
│  ├── POST /predict     │    │  ├── ML Predictions            │
│  └── GET /metrics      │    │  └── Sentiment Analysis        │
└────────────────────────┘    └────────────────────────────────┘
```

### 4.2 User Request Flow

```
1. User opens http://localhost:3000
2. User logs in → POST /api/v1/auth/login
3. Backend validates credentials → Returns JWT token
4. Frontend stores token in localStorage
5. User navigates to Dashboard
6. Dashboard component mounts
7. useDashboardStats() hook triggers
8. API calls with JWT token:
   - GET /api/v1/commodities
   - GET /api/v1/sentiment?limit=10
   - GET /api/v1/forecasts?limit=10
9. Backend queries PostgreSQL
10. Returns data in ApiResponse format
11. Frontend updates state
12. UI renders with real data
13. Auto-refresh every 30 seconds
```

### 4.3 ML Prediction Flow

```
1. User navigates to ML Predictions page
2. User fills in features (price_lag_1, price_lag_7, etc.)
3. User clicks "Predict Price"
4. useMLPrediction() hook triggers
5. POST /predict to ML API (port 8001)
6. ML API:
   - Loads XGBoost model
   - Scales features using scaler.pkl
   - Makes prediction
   - Calculates confidence
7. Returns prediction result
8. Frontend displays:
   - Predicted price
   - Confidence level
   - Model version
9. User sees result in < 1 second
```

---

## 5. Features (Implemented)

### 5.1 Core Features

**1. Real-time Dashboard** ✅
- Dynamic KPI cards with real data
- Market trend visualization
- Sector performance charts
- Sentiment indicators
- Recent insights
- Manual refresh button
- Auto-refresh (30s)
- Last updated timestamp

**2. Price Forecasting** ✅
- 7-day ahead predictions
- ML-powered (XGBoost)
- Confidence scores
- Historical vs predicted charts
- Commodity-specific forecasts
- Real-time updates

**3. Sentiment Analysis** ✅
- News headline analysis
- Sentiment scoring (-1 to +1)
- Positive/Negative/Neutral labels
- Commodity-specific sentiment
- Source tracking
- Time-series sentiment trends

**4. ML Predictions Interface** ✅
- Custom feature input
- Real-time predictions
- Confidence levels
- Model metrics display
- Feature list
- Quick fill for testing

**5. Authentication** ✅
- User registration
- Secure login (JWT)
- Password hashing
- Token management
- Protected routes
- Session handling

**6. Data Management** ✅
- Automated data loading
- Synthetic data generation
- ML training data creation
- Real-time data simulation
- Batch processing scripts

---

## 6. Database Models (Implemented)

### 6.1 Entity Relationship Diagram

```
users (1) ────────── (M) alerts
users (1) ────────── (1) preferences

commodities (1) ──── (M) price_history
commodities (1) ──── (M) sentiment_data
commodities (1) ──── (M) forecasts

regions (1) ───────── (M) price_history
regions (1) ───────── (M) forecasts

price_history (M) ── (1) commodity
price_history (M) ── (1) region

sentiment_data (M) ─ (1) commodity

forecasts (M) ────── (1) commodity
forecasts (M) ────── (1) region
```

### 6.2 Model Specifications

**Commodity Model** (`backend/app/models/commodity.py`)
```python
class Commodity(Base):
    __tablename__ = "commodities"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False, index=True)
    category = Column(String(100), index=True)
    unit = Column(String(50))
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime)
```

**Region Model** (`backend/app/models/region.py`)
```python
class Region(Base):
    __tablename__ = "regions"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False, index=True)
    state = Column(String(100), index=True)
    type = Column(String(50))
    country = Column(String(100), default='India')
    latitude = Column(Numeric(10, 8))
    longitude = Column(Numeric(11, 8))
    created_at = Column(DateTime)
```

**PriceHistory Model** (`backend/app/models/price_history.py`)
```python
class PriceHistory(Base):
    __tablename__ = "price_history"
    
    id = Column(BigInteger, primary_key=True)
    commodity_id = Column(Integer, ForeignKey('commodities.id'), index=True)
    region_id = Column(Integer, ForeignKey('regions.id'), index=True)
    price = Column(Numeric(12, 2), nullable=False)
    volume = Column(Numeric(15, 2))
    source = Column(String(100))
    recorded_at = Column(DateTime, nullable=False, index=True)
    created_at = Column(DateTime)
```

**SentimentData Model** (`backend/app/models/sentiment_data.py`)
```python
class SentimentData(Base):
    __tablename__ = "sentiment_data"
    
    id = Column(BigInteger, primary_key=True)
    commodity_id = Column(Integer, ForeignKey('commodities.id'), index=True)
    headline = Column(Text)
    sentiment_score = Column(Numeric(5, 4), index=True)  # -1 to 1
    sentiment_label = Column(String(20))  # positive/negative/neutral
    source = Column(String(100))
    published_at = Column(DateTime, index=True)
    processed_at = Column(DateTime)
```

**Forecast Model** (`backend/app/models/forecast.py`)
```python
class Forecast(Base):
    __tablename__ = "forecasts"
    
    id = Column(Integer, primary_key=True)
    commodity_id = Column(Integer, ForeignKey('commodities.id'), index=True)
    region_id = Column(Integer, ForeignKey('regions.id'))
    forecast_date = Column(Date, nullable=False, index=True)
    predicted_price = Column(Numeric(12, 2), nullable=False)
    confidence_score = Column(Numeric(5, 4))
    model_version = Column(String(50))
    created_at = Column(DateTime, index=True)
```

**User Model** (`backend/app/models/user.py`)
```python
class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID, primary_key=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime)
    last_login_at = Column(DateTime)
```

---

## 7. API Endpoints (Implemented)

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  (Web App - Amplify | Mobile App | API Clients)                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                    API Gateway + WAF                             │
│              (Authentication, Rate Limiting)                     │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                   Application Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Lambda     │  │   Lambda     │  │   Lambda     │          │
│  │  (API Logic) │  │ (Analytics)  │  │ (Forecasts)  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                     Data Layer                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  DynamoDB    │  │   RDS        │  │  S3 Data     │          │
│  │  (NoSQL)     │  │  (Postgres)  │  │   Lake       │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                   AI/ML Layer                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  SageMaker   │  │   Bedrock    │  │  Comprehend  │          │
│  │  (ML Models) │  │   (LLM)      │  │  (NLP)       │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                 Data Ingestion Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Kinesis    │  │  EventBridge │  │  AWS Glue    │          │
│  │  (Streaming) │  │  (Scheduler) │  │   (ETL)      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

## 3. AWS Services Architecture

### 3.1 Core Services

#### **Compute**
- **AWS Lambda**: Serverless API endpoints, data processing, ML inference
- **ECS Fargate**: Long-running data scraping and ETL jobs
- **EC2 (optional)**: Custom ML model training for specialized workloads

#### **Storage**
- **Amazon S3**: Data lake for raw data, processed datasets, ML artifacts
  - Buckets: `raw-data/`, `processed-data/`, `ml-models/`, `reports/`
  - Lifecycle policies for cost optimization
- **Amazon DynamoDB**: Real-time price data, user sessions, API cache
  - Tables: `Prices`, `Users`, `Subscriptions`, `APIKeys`
- **Amazon RDS (PostgreSQL)**: Relational data, historical trends, user management
  - Multi-AZ deployment for high availability

#### **AI/ML Services**
- **Amazon SageMaker**: 
  - Training: Time series forecasting models (DeepAR, Prophet)
  - Endpoints: Real-time price prediction inference
  - Feature Store: Centralized feature management
- **Amazon Bedrock**: 
  - Claude for market insight generation
  - Report summarization and natural language queries
- **Amazon Comprehend**: Sentiment analysis on news and social media
- **Amazon Forecast**: Automated time series forecasting
- **Amazon Personalize**: Personalized market recommendations

#### **Data Processing**
- **AWS Glue**: ETL pipelines, data cataloging, schema management
- **Amazon Kinesis Data Streams**: Real-time price feed ingestion
- **Amazon Kinesis Firehose**: Stream data to S3 and analytics services
- **AWS Step Functions**: Orchestrate complex data workflows

#### **API & Integration**
- **Amazon API Gateway**: RESTful API management, WebSocket for real-time updates
- **AWS AppSync**: GraphQL API for flexible data queries
- **Amazon EventBridge**: Event-driven architecture, scheduled data collection

#### **Analytics**
- **Amazon Athena**: SQL queries on S3 data lake
- **Amazon QuickSight**: Business intelligence dashboards
- **Amazon OpenSearch**: Full-text search, log analytics

#### **Security & Monitoring**
- **AWS WAF**: Web application firewall
- **Amazon Cognito**: User authentication and authorization
- **AWS Secrets Manager**: API keys and credentials management
- **Amazon CloudWatch**: Monitoring, logging, alerting
- **AWS X-Ray**: Distributed tracing

#### **Frontend Hosting**
- **AWS Amplify**: Hosting for React/Next.js frontend with CI/CD
- **Amazon CloudFront**: CDN for global content delivery

## 4. Data Architecture

### 4.1 Data Sources & Ingestion

```
External Sources → API Gateway/Lambda → Kinesis → S3 Raw → Glue ETL → S3 Processed
                                                                           ↓
                                                                    DynamoDB/RDS
```

**Data Sources:**
1. **Market APIs**: Commodity exchanges, stock markets
2. **E-commerce Scraping**: Amazon, Flipkart, regional platforms
3. **News APIs**: NewsAPI, RSS feeds
4. **Social Media**: Twitter API, Reddit
5. **Government Data**: Open data portals

**Ingestion Strategy:**
- Real-time: Kinesis Data Streams for price feeds
- Batch: EventBridge scheduled Lambda for daily scraping
- On-demand: API Gateway endpoints for manual data uploads

### 4.2 Data Lake Structure (S3)

```
s3://ai-market-pulse-data/
├── raw/
│   ├── prices/
│   │   ├── year=2026/month=02/day=13/
│   ├── news/
│   ├── social/
│   └── ecommerce/
├── processed/
│   ├── aggregated-prices/
│   ├── sentiment-scores/
│   └── features/
├── ml-models/
│   ├── forecasting/
│   └── sentiment/
└── reports/
    └── generated/
```

### 4.3 Database Schema

#### DynamoDB Tables

**Prices Table**
```
PK: COMMODITY#<commodity_id>
SK: TIMESTAMP#<iso_timestamp>
Attributes: price, region, source, volume
GSI: region-timestamp-index
```

**Users Table**
```
PK: USER#<user_id>
SK: METADATA
Attributes: email, subscription_tier, created_at
```

#### RDS Schema (PostgreSQL)

```sql
-- Commodities
CREATE TABLE commodities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    unit VARCHAR(50)
);

-- Historical Prices
CREATE TABLE price_history (
    id BIGSERIAL PRIMARY KEY,
    commodity_id INT REFERENCES commodities(id),
    price DECIMAL(10,2),
    region VARCHAR(100),
    timestamp TIMESTAMP,
    source VARCHAR(100)
);
CREATE INDEX idx_price_commodity_time ON price_history(commodity_id, timestamp);

-- Forecasts
CREATE TABLE forecasts (
    id SERIAL PRIMARY KEY,
    commodity_id INT REFERENCES commodities(id),
    forecast_date DATE,
    predicted_price DECIMAL(10,2),
    confidence_interval JSONB,
    model_version VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE,
    tier VARCHAR(50),
    status VARCHAR(50),
    valid_until TIMESTAMP
);
```

## 5. AI/ML Pipeline

### 5.1 Price Forecasting Pipeline

```
Historical Data (S3) → SageMaker Processing Job → Feature Engineering
                                                          ↓
                                                   SageMaker Training
                                                          ↓
                                                   Model Registry
                                                          ↓
                                                   SageMaker Endpoint
                                                          ↓
                                                   Lambda (Inference)
```

**Models:**
- **DeepAR**: Probabilistic forecasting for multiple time series
- **Prophet**: Trend and seasonality detection
- **LSTM**: Deep learning for complex patterns
- **XGBoost**: Feature-based regression for short-term predictions

**Training Schedule:**
- Daily: Update with latest data
- Weekly: Full retraining with hyperparameter tuning
- Monthly: Model evaluation and A/B testing

### 5.2 Sentiment Analysis Pipeline

```
News/Social Data → Comprehend (Sentiment) → Lambda (Aggregation) → DynamoDB
                                                                        ↓
                                                              QuickSight Dashboard
```

**Sentiment Scoring:**
- Extract entities (commodities, companies, regions)
- Compute sentiment scores (-1 to +1)
- Aggregate by time windows (hourly, daily, weekly)
- Correlate with price movements

### 5.3 LLM-Powered Insights

```
User Query → Lambda → Bedrock (Claude) → Generated Insights
                ↓
         Context Retrieval (Athena/OpenSearch)
```

**Use Cases:**
- Natural language market queries
- Automated report generation
- Trend explanation and causality analysis
- Personalized recommendations

## 6. API Design

### 6.1 RESTful API Endpoints

**Authentication**: JWT tokens via Cognito

```
POST   /auth/login
POST   /auth/register

GET    /api/v1/prices/{commodity}
GET    /api/v1/prices/{commodity}/forecast
GET    /api/v1/trends/regional
GET    /api/v1/sentiment/{commodity}
GET    /api/v1/insights/generate
POST   /api/v1/alerts/create

GET    /api/v1/reports/latest
POST   /api/v1/reports/generate
```

### 6.2 WebSocket API (Real-time Updates)

```
wss://api.aimarketpulse.com/realtime

Messages:
- subscribe: { type: "subscribe", commodities: ["wheat", "rice"] }
- price_update: { type: "price_update", commodity: "wheat", price: 2500 }
- alert: { type: "alert", message: "Price spike detected" }
```

### 6.3 GraphQL API (AppSync)

```graphql
type Query {
  getCommodity(id: ID!): Commodity
  getPriceHistory(commodityId: ID!, startDate: String!, endDate: String!): [Price]
  getForecast(commodityId: ID!, days: Int!): Forecast
  getMarketInsights(region: String): [Insight]
}

type Subscription {
  onPriceUpdate(commodityId: ID!): Price
}
```

## 7. Security Architecture

### 7.1 Authentication & Authorization

- **Amazon Cognito User Pools**: User management
- **Cognito Identity Pools**: Temporary AWS credentials
- **API Gateway Authorizers**: JWT validation
- **IAM Roles**: Service-to-service authentication

### 7.2 Data Security

- **Encryption at Rest**: S3 (SSE-S3), DynamoDB (KMS), RDS (KMS)
- **Encryption in Transit**: TLS 1.3 for all communications
- **Secrets Management**: AWS Secrets Manager for API keys
- **VPC**: Private subnets for databases and internal services
- **Security Groups**: Least privilege network access

### 7.3 Compliance

- **Data Residency**: India region (ap-south-1)
- **GDPR**: Data deletion workflows, consent management
- **Audit Logging**: CloudTrail for all API calls
- **Backup**: Automated snapshots for RDS and DynamoDB

## 8. Scalability & Performance

### 8.1 Auto-Scaling Strategy

- **Lambda**: Automatic concurrency scaling
- **DynamoDB**: On-demand capacity mode
- **RDS**: Read replicas for query distribution
- **SageMaker**: Auto-scaling endpoints based on invocations
- **CloudFront**: Edge caching for static content

### 8.2 Caching Strategy

- **API Gateway Cache**: 5-minute TTL for price queries
- **DynamoDB DAX**: Microsecond latency for hot data
- **ElastiCache (Redis)**: Session management, API rate limiting
- **CloudFront**: CDN caching for frontend assets

### 8.3 Performance Targets

- API Response Time: < 200ms (p95)
- Forecast Generation: < 5 seconds
- Real-time Price Updates: < 1 second latency
- Dashboard Load Time: < 2 seconds
- System Availability: 99.9% uptime

## 9. Monitoring & Observability

### 9.1 Metrics

**CloudWatch Metrics:**
- API request count, latency, error rates
- Lambda invocations, duration, errors
- DynamoDB read/write capacity, throttles
- SageMaker endpoint invocations, latency

**Custom Metrics:**
- Price update frequency per commodity
- Forecast accuracy (MAPE, RMSE)
- User engagement (queries per user)
- Subscription conversion rates

### 9.2 Logging

- **CloudWatch Logs**: Centralized logging for all services
- **Log Groups**: Organized by service (api/, ml/, etl/)
- **Log Insights**: Query and analyze logs
- **X-Ray**: Distributed tracing for request flows

### 9.3 Alerting

**CloudWatch Alarms:**
- API error rate > 5%
- Lambda function errors
- DynamoDB throttling events
- RDS CPU > 80%
- Forecast accuracy degradation

**SNS Topics**: Alert notifications to operations team

## 10. Cost Optimization

### 10.1 Strategies

- **S3 Intelligent-Tiering**: Automatic cost optimization
- **Lambda Reserved Concurrency**: For predictable workloads
- **Spot Instances**: For batch ML training
- **DynamoDB On-Demand**: Pay per request for variable traffic
- **CloudFront**: Reduce origin requests
- **Data Lifecycle Policies**: Archive old data to Glacier

### 10.2 Estimated Monthly Costs (Starter Tier)

- Lambda: $50 (1M requests)
- DynamoDB: $100 (25 GB, 10M reads)
- S3: $50 (500 GB storage)
- RDS: $150 (db.t3.medium)
- SageMaker: $200 (ml.m5.large endpoint)
- Bedrock: $100 (API calls)
- Other Services: $150

**Total**: ~$800/month for MVP

## 11. Deployment Strategy

### 11.1 Infrastructure as Code

**AWS CDK (TypeScript)**

```typescript
// Example stack structure
class AIMarketPulseStack extends Stack {
  constructor(scope: Construct, id: string) {
    // VPC
    const vpc = new ec2.Vpc(this, 'VPC');
    
    // DynamoDB
    const pricesTable = new dynamodb.Table(this, 'Prices', {
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST
    });
    
    // Lambda API
    const apiHandler = new lambda.Function(this, 'APIHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda')
    });
    
    // API Gateway
    const api = new apigateway.RestApi(this, 'API');
    // ... more resources
  }
}
```

### 11.2 CI/CD Pipeline

```
GitHub → CodePipeline → CodeBuild → Deploy to Dev → Tests → Deploy to Prod
```

**Stages:**
1. Source: GitHub webhook trigger
2. Build: CodeBuild compiles and tests
3. Deploy Dev: CDK deploy to dev environment
4. Integration Tests: Automated API tests
5. Manual Approval: Review before production
6. Deploy Prod: CDK deploy to production
7. Smoke Tests: Verify production deployment

### 11.3 Environment Strategy

- **Dev**: Development and testing
- **Staging**: Pre-production validation
- **Prod**: Production environment

## 12. Disaster Recovery

### 12.1 Backup Strategy

- **RDS**: Automated daily snapshots, 7-day retention
- **DynamoDB**: Point-in-time recovery enabled
- **S3**: Versioning enabled, cross-region replication
- **ML Models**: Versioned in S3 with lifecycle policies

### 12.2 Recovery Objectives

- **RTO (Recovery Time Objective)**: 4 hours
- **RPO (Recovery Point Objective)**: 1 hour

### 12.3 Disaster Recovery Plan

1. Multi-AZ deployment for RDS and critical services
2. Cross-region S3 replication for data lake
3. Infrastructure as Code for rapid environment recreation
4. Regular DR drills (quarterly)

## 13. Future Enhancements

### Phase 2 (Q3 2026)
- Mobile app (React Native)
- Advanced anomaly detection
- Automated trading signals
- Multi-language support

### Phase 3 (Q4 2026)
- International market expansion
- Blockchain integration for data provenance
- Advanced knowledge graphs (Neptune)
- Voice-based queries (Alexa integration)

### Phase 4 (2027)
- Predictive supply chain optimization
- AI-powered negotiation recommendations
- Collaborative market intelligence network
- Edge computing for ultra-low latency

## 14. Conclusion

AI Market Pulse leverages AWS's comprehensive suite of services to build a scalable, secure, and intelligent market intelligence platform. The architecture prioritizes:

- **Scalability**: Serverless and managed services
- **Cost-efficiency**: Pay-per-use pricing models
- **AI-first**: Deep integration with ML and LLM services
- **Security**: Enterprise-grade security controls
- **Observability**: Comprehensive monitoring and logging

This design provides a solid foundation for rapid development and iteration while maintaining production-grade reliability and performance.
