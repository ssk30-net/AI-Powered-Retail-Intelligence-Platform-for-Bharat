# Backend Health Check Fix

## The Problem

Backend service shows:
- ✅ 1 task running
- ❌ 3 tasks stopped with error: "Task failed ELB health checks"
- ⚠️ Service keeps restarting tasks

**Error Message:**
```
Task failed ELB health checks in (target-group arn:aws:elasticloadbalancing:eu-north-1:152641673729:targetgroup/backend-tg/7fef312bd1eebe84)
```

## Root Causes (2 Issues)

### Issue 1: curl Not Installed
The health check command uses `curl`:
```json
"command": ["CMD-SHELL", "curl -f http://localhost:8000/api/v1/health || exit 1"]
```

But the Dockerfile doesn't install `curl`!

### Issue 2: Wrong Health Check Path
The health check tries: `/api/v1/health`
But the actual endpoint is: `/health`

Looking at `backend/app/main.py`:
```python
@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

The health endpoint is at `/health`, not `/api/v1/health`!

## The Solution

### Fix 1: Install curl in Dockerfile ✅
```dockerfile
# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    curl \                    ← Added this
    && rm -rf /var/lib/apt/lists/*
```

### Fix 2: Correct Health Check Path ✅
```json
"healthCheck": {
  "command": ["CMD-SHELL", "curl -f http://localhost:8000/health || exit 1"],
  //                                                      ^^^^^^^ Fixed path
  "interval": 30,
  "timeout": 5,
  "retries": 3,
  "startPeriod": 60
}
```

## Files Modified

1. **backend/Dockerfile** - Added curl installation
2. **backend-task-def.json** - Fixed health check path from `/api/v1/health` to `/health`

## Why This Happened

### Health Check Flow (Before Fix)
```
ECS Service
  ↓
Container Running
  ↓
Health Check: curl -f http://localhost:8000/api/v1/health
  ↓
❌ curl: command not found
  OR
❌ 404 Not Found (wrong path)
  ↓
Health Check Failed
  ↓
Task Stopped
  ↓
ECS Starts New Task
  ↓
(Cycle repeats - 3 failed tasks)
```

### Health Check Flow (After Fix)
```
ECS Service
  ↓
Container Running (with curl installed)
  ↓
Health Check: curl -f http://localhost:8000/health
  ↓
✅ HTTP 200 OK {"status": "healthy"}
  ↓
Health Check Passed
  ↓
Target Healthy
  ↓
Traffic Routed
  ↓
Backend API Accessible!
```

## Backend Endpoints

### Available Endpoints:
- **Root:** `GET /` - API info
- **Health:** `GET /health` - Health check ✅
- **Docs:** `GET /docs` - Swagger UI
- **API:** `GET /api/v1/*` - All API endpoints

### Health Check Response:
```json
{
  "status": "healthy"
}
```

## Health Check Configuration

### Current Settings:
```json
{
  "command": ["CMD-SHELL", "curl -f http://localhost:8000/health || exit 1"],
  "interval": 30,        // Check every 30 seconds
  "timeout": 5,          // Wait 5 seconds for response
  "retries": 3,          // Fail after 3 consecutive failures
  "startPeriod": 60      // Grace period: 60 seconds
}
```

### What Happens:
1. **0-60s:** Start period (grace period for app initialization)
2. **60s:** First health check
3. **90s:** Second health check
4. **120s:** Third health check
5. **After 3 successful checks:** Container marked HEALTHY

## Deployment Steps

1. **Commit the fixes:**
```bash
git add backend/Dockerfile
git add backend-task-def.json
git add BACKEND_HEALTH_CHECK_FIX.md
git commit -m "Fix backend health check: Install curl and correct path"
git push origin main
```

2. **Wait for deployment:**
- GitHub Actions: ~5-10 minutes
- Docker build: ~5 minutes
- ECS deployment: ~5 minutes
- Health checks: ~2 minutes
- **Total: ~15-20 minutes**

3. **Monitor progress:**
- GitHub Actions → Check workflow status
- ECS Console → Watch backend-service
- Target Group → Wait for "Healthy" status

4. **Verify:**
- Backend target health: **1 Healthy, 0 Unhealthy**
- No more stopped tasks
- API accessible at: http://aimarketpulse-alb-1387394868.eu-north-1.elb.amazonaws.com/api/v1

## Verification

### Check Backend Service:
1. Go to ECS Console
2. Click on **backend-service**
3. Click **Health and metrics** tab
4. Should show:
   - ✅ **1 Running task**
   - ✅ **0 Stopped tasks** (or old stopped tasks)
   - ✅ **Target health: 1 Healthy**

### Test Health Endpoint:
Once deployed, test:
```bash
curl http://aimarketpulse-alb-1387394868.eu-north-1.elb.amazonaws.com/health
```

Expected response:
```json
{"status":"healthy"}
```

### Test API Root:
```bash
curl http://aimarketpulse-alb-1387394868.eu-north-1.elb.amazonaws.com/api/v1
```

Or visit in browser:
```
http://aimarketpulse-alb-1387394868.eu-north-1.elb.amazonaws.com/docs
```

## Common Issues

### Issue: Tasks still failing after fix
**Check:**
1. Did you push the changes?
2. Did GitHub Actions complete successfully?
3. Is the new image deployed?

**Solution:**
- Check CloudWatch logs for errors
- Verify database connection
- Check environment variables

### Issue: Database connection errors
**Check:**
- RDS security group allows ECS tasks
- Database credentials are correct
- Database is running

**Solution:**
- Update RDS security group
- Verify DATABASE_URL in task definition

### Issue: Port conflicts
**Check:**
- Container port: 8000
- Target group port: 8000
- Health check port: 8000

**Solution:**
- Ensure all ports match

## Both Services Fixed

### Frontend Fix:
- ✅ Install curl in Dockerfile
- ✅ Health check: `curl -f http://localhost:3000`

### Backend Fix:
- ✅ Install curl in Dockerfile
- ✅ Health check: `curl -f http://localhost:8000/health` (corrected path)

## Expected Result

After deploying both fixes:

### Frontend Service:
- ✅ 1 Running task
- ✅ 1 Healthy target
- ✅ Application accessible

### Backend Service:
- ✅ 1 Running task
- ✅ 1 Healthy target
- ✅ API accessible

### Application:
- ✅ Frontend loads
- ✅ Backend API responds
- ✅ Full application functional

## Timeline

**After pushing both fixes:**
1. **0-5 min:** GitHub Actions starts
2. **5-10 min:** Docker builds images
3. **10-15 min:** Images pushed to ECR
4. **15-20 min:** ECS deploys new tasks
5. **20-22 min:** Health checks pass
6. **22+ min:** Application fully accessible!

## Summary

**Problems:**
1. Backend health check using curl (not installed)
2. Backend health check using wrong path (/api/v1/health instead of /health)

**Solutions:**
1. Install curl in backend Dockerfile
2. Fix health check path to /health

**Impact:**
- Backend tasks will stay running
- Health checks will pass
- API will be accessible
- No more task restarts

**Next Action:** Commit and push both frontend and backend fixes!
