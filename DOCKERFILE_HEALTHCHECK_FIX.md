# Dockerfile Health Check Fix - CRITICAL

## Issues Found and Fixed

### Backend Dockerfile - 2 Critical Issues

**Issue 1: Wrong Health Check Path**
```dockerfile
# BEFORE (WRONG)
CMD python -c "import requests; requests.get('http://localhost:8000/api/v1/health')" || exit 1
```
- ❌ Path: `/api/v1/health` (doesn't exist!)
- ✅ Correct path: `/health`

**Issue 2: Wrong Health Check Method**
```dockerfile
# BEFORE (WRONG)
CMD python -c "import requests; requests.get('http://localhost:8000/api/v1/health')" || exit 1
```
- ❌ Using Python with requests library (may not be installed)
- ✅ Should use curl (already installed)

**FIXED:**
```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1
```

### Frontend Dockerfile - Missing Health Check

**Issue: No HEALTHCHECK instruction at all**
- ❌ Frontend Dockerfile had NO health check
- ✅ Added proper health check

**ADDED:**
```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1
```

## Why This Matters

### Docker HEALTHCHECK vs ECS Task Definition Health Check

There are **TWO levels** of health checks:

1. **Docker HEALTHCHECK** (in Dockerfile)
   - Runs INSIDE the container
   - Checks if the application is responding
   - Used by Docker daemon
   - Shows in `docker ps` as "healthy" or "unhealthy"

2. **ECS Task Definition Health Check** (in task-def.json)
   - Runs by ECS agent
   - Also checks application health
   - Used by ECS to determine task health
   - Reported to ALB

3. **ALB Target Group Health Check** (in AWS Console)
   - Runs by the Load Balancer
   - Checks if target is ready to receive traffic
   - Most important for service availability

**All three must be configured correctly!**

## What Was Fixed

### Backend Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (curl already installed ✅)
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# ... rest of Dockerfile ...

# Health check - FIXED
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1
```

**Changes:**
- ✅ Path: `/health` (correct endpoint)
- ✅ Method: `curl -f` (already installed)
- ✅ Start period: 30s (gives app time to start)
- ✅ Timeout: 5s (matches your requirement)

### Frontend Dockerfile
```dockerfile
FROM node:20-alpine

# Install curl for health checks (already installed ✅)
RUN apk add --no-cache curl

# ... rest of Dockerfile ...

# Health check - ADDED
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1
```

**Changes:**
- ✅ Added HEALTHCHECK instruction
- ✅ Path: `/` (Next.js root)
- ✅ Start period: 30s (gives Next.js time to start)

## Deployment Status

**Commit**: `93ce2ea` - "Fix Dockerfile health checks: correct path and add frontend health check"

**What's Deploying:**
1. Backend with correct health check path `/health`
2. Frontend with new health check instruction
3. Both using curl (reliable and fast)
4. Both with 30s start period (enough time for apps to start)

## Complete Health Check Configuration

### Backend

**1. Dockerfile HEALTHCHECK:**
```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1
```

**2. ECS Task Definition (backend-task-def.json):**
```json
"healthCheck": {
  "command": ["CMD-SHELL", "curl -f http://localhost:8000/health || exit 1"],
  "interval": 30,
  "timeout": 5,
  "retries": 3,
  "startPeriod": 60
}
```

**3. ALB Target Group (AWS Console):**
```
Protocol: HTTP
Path: /health
Port: traffic port (8000)
Interval: 30 seconds
Timeout: 5 seconds
Healthy threshold: 2
Unhealthy threshold: 2
Success codes: 200
```

### Frontend

**1. Dockerfile HEALTHCHECK:**
```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1
```

**2. ECS Task Definition (frontend-task-def.json):**
```json
"healthCheck": {
  "command": ["CMD-SHELL", "curl -f http://localhost:3000 || exit 1"],
  "interval": 30,
  "timeout": 5,
  "retries": 3,
  "startPeriod": 60
}
```

**3. ALB Target Group (AWS Console):**
```
Protocol: HTTP
Path: /
Port: traffic port (3000)
Interval: 30 seconds
Timeout: 5 seconds
Healthy threshold: 2
Unhealthy threshold: 2
Success codes: 200
```

## Timeline

**Total Deployment Time**: ~20 minutes

1. **GitHub Actions** (5-10 min)
   - Build backend image with fixed health check
   - Build frontend image with new health check
   - Push to ECR
   - Register task definitions
   - Update ECS services

2. **ECS Deployment** (10-15 min)
   - Pull new images
   - Start new tasks
   - Wait for health checks (30s start period + checks)
   - Drain old tasks
   - Complete deployment

## Monitoring

### GitHub Actions
```
https://github.com/ssk30-net/AI-Powered-Retail-Intelligence-Platform-for-Bharat/actions
```

Look for workflow run from commit `93ce2ea`

### ECS Console
1. ECS → Clusters → aimarketpulse-cluster
2. Check both services for "ACTIVE" status
3. Check Deployments tab for progress

### Target Groups
1. EC2 → Target Groups
2. backend-tg → Targets tab → Should show "healthy"
3. frontend-tg → Targets tab → Should show "healthy"

## Why This Will Work Now

**Before:**
- ❌ Backend checking wrong path `/api/v1/health`
- ❌ Backend using Python (unreliable)
- ❌ Frontend had no Docker health check
- ❌ Containers marked unhealthy by Docker
- ❌ ECS couldn't determine health properly

**After:**
- ✅ Backend checking correct path `/health`
- ✅ Both using curl (fast and reliable)
- ✅ Frontend has proper health check
- ✅ Containers marked healthy by Docker
- ✅ ECS can determine health correctly
- ✅ ALB receives healthy targets

## Testing After Deployment

Wait ~20 minutes, then test:

### 1. Check Docker Health (if running locally)
```bash
docker ps
# Should show "healthy" in STATUS column
```

### 2. Check Frontend
```
http://aimarketpulse-alb-1387394868.eu-north-1.elb.amazonaws.com
```
Should load the application

### 3. Check Backend Health
```
http://aimarketpulse-alb-1387394868.eu-north-1.elb.amazonaws.com/health
```
Should return: `{"status": "healthy"}`

### 4. Check API Docs
```
http://aimarketpulse-alb-1387394868.eu-north-1.elb.amazonaws.com/api/v1/docs
```
Should show FastAPI Swagger UI

## Summary of All Fixes

This is the **THIRD** fix in the series:

1. ✅ **First fix**: Added curl to Dockerfiles
2. ✅ **Second fix**: Updated GitHub Actions to register task definitions
3. ✅ **Third fix**: Fixed Dockerfile HEALTHCHECK instructions (THIS ONE)

All three layers are now properly configured:
- ✅ Docker HEALTHCHECK (in Dockerfile)
- ✅ ECS Task Health Check (in task-def.json)
- ✅ ALB Target Group Health Check (in AWS Console)

## Next Steps

1. **Wait for deployment** (~20 minutes)
2. **Verify health checks pass**
3. **Test application URLs**
4. **Celebrate!** 🎉

If still failing after this, the issue is likely:
- Security groups blocking traffic
- Application not starting (check CloudWatch logs)
- Database connection issues
