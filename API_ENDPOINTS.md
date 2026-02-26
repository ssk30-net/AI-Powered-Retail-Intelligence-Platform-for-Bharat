# AI Market Pulse - Complete API Documentation

## Base URL
```
Development: http://localhost:8000/api/v1
Production: https://api.aimarketpulse.com/api/v1
```

## Authentication
All endpoints (except auth endpoints) require JWT token in header:
```
Authorization: Bearer <token>
```

---

## 1. Authentication Endpoints

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe",
  "company_name": "ABC Corp",
  "industry": "Retail"
}

Response 201:
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "email": "user@example.com",
    "token": "jwt_token",
    "refresh_token": "refresh_token"
  }
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response 200:
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "email": "user@example.com",
    "token": "jwt_token",
    "refresh_token": "refresh_token",
    "is_first_login": false
  }
}
```

### Refresh Token
```http
POST /auth/refresh-token
Content-Type: application/json

{
  "refresh_token": "refresh_token"
}

Response 200:
{
  "success": true,
  "data": {
    "token": "new_jwt_token",
    "refresh_token": "new_refresh_token"
  }
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "company_name": "ABC Corp",
    "is_first_login": false
  }
}
```

---

## 2. Data Upload Endpoints

### Upload File
```http
POST /data/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <binary>

Response 202:
{
  "success": true,
  "data": {
    "upload_id": "uuid",
    "filename": "prices.csv",
    "status": "processing",
    "message": "File uploaded successfully"
  }
}
```

### Get Upload Status
```http
GET /data/upload-status/{upload_id}
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "upload_id": "uuid",
    "status": "completed",
    "rows_processed": 1500,
    "progress": 100
  }
}
```

### Get Upload History
```http
GET /data/history?limit=10&offset=0
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "uploads": [
      {
        "upload_id": "uuid",
        "filename": "prices.csv",
        "status": "completed",
        "uploaded_at": "2026-02-25T10:00:00Z"
      }
    ],
    "total": 25
  }
}
```

---

## 3. Dashboard Endpoints

### Get Dashboard Overview
```http
GET /dashboard/overview?date_range=30d
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "kpis": {
      "price_change_percent": 5.2,
      "demand_index": 78,
      "sentiment_score": 0.65,
      "risk_level": "medium"
    },
    "top_commodities": [...],
    "recent_alerts": [...]
  }
}
```

### Get Price Trends
```http
GET /dashboard/price-trends?commodity_ids=1,2,3&days=30
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "trends": [
      {
        "commodity_id": 1,
        "commodity_name": "Wheat",
        "data_points": [
          {"date": "2026-02-01", "price": 2500},
          {"date": "2026-02-02", "price": 2520}
        ]
      }
    ]
  }
}
```

---

## 4. Forecast Endpoints

### Get Commodities List
```http
GET /forecasts/commodities
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "commodities": [
      {
        "id": 1,
        "name": "Wheat",
        "category": "Grains",
        "unit": "quintal"
      }
    ]
  }
}
```

### Get Forecast
```http
GET /forecasts/{commodity_id}?horizon=30&region_id=1
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "commodity_id": 1,
    "commodity_name": "Wheat",
    "historical": [
      {"date": "2026-01-25", "price": 2500}
    ],
    "forecast": [
      {
        "date": "2026-02-26",
        "predicted_price": 2650,
        "lower_bound": 2600,
        "upper_bound": 2700,
        "confidence": 0.85
      }
    ],
    "explanation": "AI-generated explanation...",
    "accuracy": 92.5
  }
}
```

### Generate Forecast
```http
POST /forecasts/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "commodity_id": 1,
  "horizon_days": 30,
  "region_id": 1
}

Response 202:
{
  "success": true,
  "message": "Forecast generation started",
  "data": {
    "job_id": "uuid"
  }
}
```

---

## 5. Price Sensitivity Endpoints

### Get Price Sensitivity
```http
GET /price-sensitivity/{commodity_id}?region_id=1
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "commodity_id": 1,
    "elasticity_coefficient": -1.2,
    "optimal_price": 2700,
    "current_price": 2500,
    "demand_at_optimal": 15000,
    "revenue_at_optimal": 40500000
  }
}
```

### Simulate Price Change
```http
POST /price-sensitivity/simulate
Authorization: Bearer <token>
Content-Type: application/json

{
  "commodity_id": 1,
  "price_adjustment_percent": 10,
  "region_id": 1
}

Response 200:
{
  "success": true,
  "data": {
    "new_price": 2750,
    "predicted_demand": 14200,
    "predicted_revenue": 39050000,
    "revenue_change_percent": -3.5,
    "risk_level": "medium"
  }
}
```

### Save Scenario
```http
POST /price-sensitivity/scenarios
Authorization: Bearer <token>
Content-Type: application/json

{
  "commodity_id": 1,
  "scenario_name": "10% Price Increase",
  "price_adjustment": 10,
  "notes": "Testing market response"
}

Response 201:
{
  "success": true,
  "data": {
    "scenario_id": "uuid",
    "message": "Scenario saved successfully"
  }
}
```

---

## 6. Sentiment Endpoints

### Get Sentiment Overview
```http
GET /sentiment/overview?days=30
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "overall_sentiment": 0.45,
    "sentiment_distribution": {
      "positive": 55,
      "neutral": 30,
      "negative": 15
    },
    "trending_topics": ["supply chain", "harvest season"]
  }
}
```

### Get Commodity Sentiment
```http
GET /sentiment/{commodity_id}?days=30
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "commodity_id": 1,
    "commodity_name": "Wheat",
    "current_sentiment": 0.65,
    "sentiment_trend": [
      {"date": "2026-02-01", "score": 0.5},
      {"date": "2026-02-02", "score": 0.55}
    ],
    "recent_news": [
      {
        "title": "Wheat prices expected to rise",
        "sentiment": 0.8,
        "source": "Economic Times",
        "published_at": "2026-02-25T08:00:00Z"
      }
    ]
  }
}
```

### Get Sentiment Correlation
```http
GET /sentiment/correlation?commodity_id=1&days=90
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "correlation_coefficient": 0.72,
    "data_points": [
      {
        "date": "2026-02-01",
        "sentiment": 0.5,
        "price": 2500,
        "price_change": 2.1
      }
    ]
  }
}
```

---

## 7. AI Copilot Endpoints

### Send Message
```http
POST /copilot/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "What will wheat prices be next week?",
  "context": {
    "commodity_id": 1,
    "region_id": 1
  }
}

Response 200:
{
  "success": true,
  "data": {
    "response": "Based on current trends and forecasts...",
    "confidence": 0.85,
    "sources": ["forecast_model", "sentiment_analysis"],
    "follow_up_suggestions": [
      "Show me the detailed forecast",
      "What factors are influencing this?"
    ]
  }
}
```

### Get Conversation History
```http
GET /copilot/history?limit=20
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "uuid",
        "message": "What will wheat prices be?",
        "response": "Based on...",
        "created_at": "2026-02-25T10:00:00Z"
      }
    ]
  }
}
```

---

## 8. Alerts Endpoints

### Get Alerts
```http
GET /alerts?status=unread&limit=20
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "alerts": [
      {
        "id": 123,
        "type": "price_spike",
        "severity": "high",
        "title": "Wheat price spike detected",
        "message": "Wheat prices increased by 15% in Mumbai",
        "commodity_id": 1,
        "is_read": false,
        "triggered_at": "2026-02-25T09:00:00Z"
      }
    ],
    "unread_count": 5
  }
}
```

### Acknowledge Alert
```http
POST /alerts/acknowledge
Authorization: Bearer <token>
Content-Type: application/json

{
  "alert_id": 123
}

Response 200:
{
  "success": true,
  "message": "Alert acknowledged"
}
```

### Create Alert Rule
```http
POST /alerts/rules
Authorization: Bearer <token>
Content-Type: application/json

{
  "commodity_id": 1,
  "rule_type": "price_threshold",
  "condition": {
    "operator": "gt",
    "value": 3000
  },
  "notification_channels": ["email", "in_app"]
}

Response 201:
{
  "success": true,
  "data": {
    "rule_id": 456,
    "message": "Alert rule created"
  }
}
```

---

## 9. Insights Endpoints

### Get Insights Overview
```http
GET /insights/overview
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "market_opportunities": [...],
    "top_recommendations": [...],
    "performance_summary": {...}
  }
}
```

### Get Market Opportunities
```http
GET /insights/opportunities?limit=10
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "opportunities": [
      {
        "type": "undervalued_commodity",
        "commodity_id": 3,
        "commodity_name": "Onion",
        "description": "Onion prices 20% below historical average",
        "potential_roi": 25,
        "risk_level": "low"
      }
    ]
  }
}
```

### Get Forecast Accuracy
```http
GET /insights/forecast-accuracy?days=30
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "overall_accuracy": 92.5,
    "by_commodity": [
      {
        "commodity_id": 1,
        "commodity_name": "Wheat",
        "accuracy": 94.2,
        "mape": 5.8
      }
    ]
  }
}
```

### Export Executive Summary
```http
POST /insights/export-pdf
Authorization: Bearer <token>
Content-Type: application/json

{
  "date_range": "30d",
  "include_sections": ["kpis", "forecasts", "recommendations"]
}

Response 200:
{
  "success": true,
  "data": {
    "download_url": "https://s3.../report.pdf",
    "expires_at": "2026-02-26T10:00:00Z"
  }
}
```

---

## 10. User Management Endpoints

### Get User Profile
```http
GET /user/profile
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "company_name": "ABC Corp",
    "industry": "Retail"
  }
}
```

### Update Profile
```http
PUT /user/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "full_name": "John Smith",
  "company_name": "XYZ Corp"
}

Response 200:
{
  "success": true,
  "message": "Profile updated successfully"
}
```

### Get Preferences
```http
GET /user/preferences
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "email_notifications": true,
    "default_commodities": [1, 2, 3],
    "theme": "light"
  }
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid/missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 422 | Validation Error - Invalid data format |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

## Rate Limiting

- Free tier: 60 requests/minute
- Paid tier: 300 requests/minute
- Headers returned:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`
