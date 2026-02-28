# Complete AWS Configuration Guide

## Your Current AWS Setup

**Region**: `eu-north-1` (Stockholm)  
**Account ID**: `152641673729`  
**ALB DNS**: `aimarketpulse-alb-1387394868.eu-north-1.elb.amazonaws.com`  
**RDS Endpoint**: `database-1.cjqose8cc9yh.eu-north-1.rds.amazonaws.com:5432`  
**ECS Cluster**: `aimarketpulse-cluster`

---

## 1. Backend Configuration

### Backend Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

### Backend Task Definition (backend-task-def.json)
```json
{
  "family": "aimarketpul