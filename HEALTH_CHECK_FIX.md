# Health Check Failure Fix

## The Problem

Your ECS service shows:
- ✅ Tasks are running (1 running)
- ❌ Target health: **0 Healthy, 1 Unhealthy**
- ❌ **2 Failed tasks**
- ⚠️ Deployment status: **In progress**

This means the container is running but **failing the health check**, so the load balancer won't route traffic to it.

## Root Cause

The health check in the task definition uses `curl`:
```json
"healthCheck": {
  "command": ["CMD-SHELL", "curl -f http://localhost:3000 || exit 1"]
}
```

**Problem:** The `node:20-alpine` Docker image doesn't include `curl` by default!

When the health check runs:
1. ECS tries to execute: `curl -f http://localhost:3000`
2. Alpine Linux responds: `curl: command not found`
3. Health check fails
4. Target marked as unhealthy
5. Load balancer doesn't route traffic
6. Connection times out

## The Solution

### Fix 1: Install curl in Dockerfile ✅
Added curl installation to the production image:

```dockerfile
# Production image
FROM node:20-alpine

# Install curl for health checks
RUN apk add --no-cache curl

WORKDIR /app
```

This ensures curl is available when the health check runs.

## Files Modified

1. **frontend/Dockerfile** - Added curl installation
2. **frontend-task-def.json** - (No change needed, curl command will now work)

## Why This Happened

### Alpine Linux
- Alpine is a minimal Linux distribution
- Keeps image size small (~5MB base)
- Only includes essential tools
- `curl` is not included by default

### Health Check Flow
```
ECS Service
  ↓
Container Running
  ↓
Health Check: curl -f http://localhost:3000
  ↓
❌ curl: command not found
  ↓
Health Check Failed
  ↓
Target Unhealthy
  ↓
No Traffic Routed
  ↓
Connection Timeout
```

### After Fix
```
ECS Service
  ↓
Container Running (with curl installed)
  ↓
Health Check: curl -f http://localhost:3000
  ↓
✅ HTTP 200 OK
  ↓
Health Check Passed
  ↓
Target Healthy
  ↓
Traffic Routed
  ↓
Application Accessible!
```

## Alternative Solutions

### Option 1: Install curl (chosen) ✅
```dockerfile
RUN apk add --no-cache curl
```
**Pros:**
- Simple and reliable
- curl is standard for health checks
- Small size increase (~2MB)

**Cons:**
- Slightly larger image

### Option 2: Use wget (Alpine includes it)
```json
"command": ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1"]
```
**Pros:**
- No additional installation needed
- wget is included in Alpine

**Cons:**
- Less common for health checks
- More verbose command

### Option 3: Use Node.js for health check
```json
"command": ["CMD-SHELL", "node -e \"require('http').get('http://localhost:3000', (res) => process.exit(res.statusCode === 200 ? 0 : 1))\""]
```
**Pros:**
- No additional tools needed
- Uses existing Node.js

**Cons:**
- Complex command
- Harder to debug

## Health Check Configuration

### Current Settings
```json
{
  "command": ["CMD-SHELL", "curl -f http://localhost:3000 || exit 1"],
  "interval": 30,        // Check every 30 seconds
  "timeout": 5,          // Wait 5 seconds for response
  "retries": 3,          // Fail after 3 consecutive failures
  "startPeriod": 60      // Grace period: 60 seconds before first check
}
```

### What Each Parameter Means

**interval (30s):**
- How often to run the health check
- 30 seconds is standard

**timeout (5s):**
- How long to wait for response
- If no response in 5s, check fails

**retries (3):**
- How many failures before marking unhealthy
- 3 consecutive failures = unhealthy

**startPeriod (60s):**
- Grace period after container starts
- Allows app to initialize
- Health check failures during this period don't count

### Health Check Timeline
```
Container Start
  ↓
0-60s: Start Period (grace period)
  ↓
60s: First health check
  ↓
90s: Second health check (if first passed)
  ↓
120s: Third health check
  ↓
After 3 successful checks: HEALTHY
```

## Impact of Fix

### Before Fix
- ❌ Health check fails immediately
- ❌ Container marked unhealthy
- ❌ No traffic routed
- ❌ Connection timeout

### After Fix
- ✅ Health check succeeds
- ✅ Container marked healthy
- ✅ Traffic routed to container
- ✅ Application accessible

## Deployment Steps

1. **Commit the fix:**
```bash
git add frontend/Dockerfile
git commit -m "Fix health check: Install curl in Docker image"
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
- ECS Console → Watch task status
- Target Group → Wait for "Healthy" status

4. **Verify:**
- Target health should show: **1 Healthy, 0 Unhealthy**
- Try URL: http://aimarketpulse-alb-1387394868.eu-north-1.elb.amazonaws.com

## Verification

### Check Health Status
1. Go to ECS Console
2. Click on **frontend-service**
3. Click **Health and metrics** tab
4. Look for:
   - ✅ **0 Unhealthy**
   - ✅ **1 Healthy**

### Check Target Group
1. Go to EC2 Console → Target Groups
2. Find frontend target group
3. Click **Targets** tab
4. Status should show: **healthy**

### Check Application
1. Open: http://aimarketpulse-alb-1387394868.eu-north-1.elb.amazonaws.com
2. Should load the application
3. No more connection timeout!

## Troubleshooting

### If still unhealthy after fix:

**Check container logs:**
```
1. ECS Console → Cluster → Service → Tasks
2. Click on running task
3. Click "Logs" tab
4. Look for errors
```

**Common issues:**
- Application not starting
- Port 3000 not listening
- Application crashes
- Out of memory

**Check health check logs:**
```
Look for: "Health check failed" in CloudWatch logs
```

## Prevention

### For Future Projects:
1. Always test health checks locally
2. Use `docker exec` to verify commands work
3. Document required tools in Dockerfile
4. Test in staging before production

### Testing Health Check Locally:
```bash
# Build image
docker build -t test-frontend frontend/

# Run container
docker run -d -p 3000:3000 --name test test-frontend

# Test health check command
docker exec test curl -f http://localhost:3000

# Should return: HTTP 200 OK
```

## Summary

**Problem:** Health check failing because curl not installed
**Solution:** Install curl in Dockerfile
**Impact:** Container will be marked healthy, traffic will be routed
**Timeline:** 15-20 minutes after pushing fix

**Next Action:** Commit and push the Dockerfile change!
