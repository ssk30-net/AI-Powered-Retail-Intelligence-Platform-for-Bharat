# Rollback Failed - How to Fix

## What Happened

**Error:** "Rollback failed"

### The Sequence:
1. ❌ New deployment failed health checks (no curl installed)
2. 🔄 ECS tried to rollback to previous version
3. ❌ Previous version ALSO failed health checks (also no curl)
4. ⚠️ **Rollback failed** - stuck in failed state

## Why Rollback Failed

The rollback failed because:
- The previous Docker image also didn't have curl installed
- When ECS rolled back, it deployed the old image
- The old image also failed health checks
- ECS couldn't recover to a working state

## Current State

### Frontend Service:
- Status: **Rollback failed**
- Tasks: Stopped (failed health checks)
- Deployment: Stuck

### Backend Service:
- Status: Running but unhealthy
- Tasks: 1 running, 3 stopped
- Health checks: Failing

## The Solution

We've already fixed both issues:
1. ✅ Frontend Dockerfile - Added curl
2. ✅ Backend Dockerfile - Added curl
3. ✅ Backend task definition - Fixed health check path

**Now we need to deploy these fixes!**

## What You Need to Do

### Step 1: Commit and Push Fixes
```bash
# Stage all changes
git add frontend/Dockerfile
git add backend/Dockerfile
git add backend-task-def.json
git add frontend-task-def.json
git add *.md

# Commit
git commit -m "Fix health checks: Install curl and correct paths"

# Push to trigger new deployment
git push origin main
```

### Step 2: Wait for New Deployment
- **Time:** ~20 minutes
- **What happens:** GitHub Actions builds new images with curl installed
- **Result:** Health checks will pass

### Step 3: Monitor Progress

**GitHub Actions:**
1. Go to your repository
2. Click **Actions** tab
3. Watch "Deploy to AWS ECS" workflow
4. Both jobs should succeed (green checkmarks)

**ECS Console:**
1. Go to ECS → aimarketpulse-cluster
2. Watch both services:
   - frontend-service
   - backend-service
3. Wait for:
   - Deployment status: **PRIMARY** (not "Rollback failed")
   - Running tasks: **1**
   - Target health: **1 Healthy**

## How to Clear "Rollback Failed" State

The "Rollback failed" state will be cleared when:
1. You push the fixed code
2. GitHub Actions builds new images
3. ECS deploys the new images
4. Health checks pass
5. Deployment succeeds

**The new deployment will replace the failed one!**

## Expected Timeline

```
Now: Commit and push
  ↓
+2 min: GitHub Actions starts
  ↓
+8 min: Docker builds complete
  ↓
+12 min: Images pushed to ECR
  ↓
+16 min: ECS starts deploying
  ↓
+18 min: New tasks running
  ↓
+20 min: Health checks pass
  ↓
+22 min: Deployment complete! ✅
```

## What Will Change

### Before (Current State):
```
Frontend Service:
  Status: Rollback failed ❌
  Tasks: 0 running
  Health: 0 healthy
  
Backend Service:
  Status: Running but unhealthy ⚠️
  Tasks: 1 running, 3 stopped
  Health: 0 healthy
```

### After (Fixed State):
```
Frontend Service:
  Status: Active ✅
  Tasks: 1 running
  Health: 1 healthy
  
Backend Service:
  Status: Active ✅
  Tasks: 1 running
  Health: 1 healthy
```

## Verification Steps

### After Deployment Completes:

**1. Check ECS Services:**
```
ECS Console → aimarketpulse-cluster → Services

frontend-service:
  ✅ Status: ACTIVE
  ✅ Running tasks: 1
  ✅ Desired tasks: 1
  ✅ Deployment: PRIMARY (not "Rollback failed")

backend-service:
  ✅ Status: ACTIVE
  ✅ Running tasks: 1
  ✅ Desired tasks: 1
  ✅ No stopped tasks (or old stopped tasks)
```

**2. Check Target Groups:**
```
EC2 Console → Target Groups

frontend-tg:
  ✅ Healthy targets: 1
  ✅ Unhealthy targets: 0

backend-tg:
  ✅ Healthy targets: 1
  ✅ Unhealthy targets: 0
```

**3. Test Application:**
```bash
# Test frontend
curl http://aimarketpulse-alb-1387394868.eu-north-1.elb.amazonaws.com

# Test backend health
curl http://aimarketpulse-alb-1387394868.eu-north-1.elb.amazonaws.com/health

# Test backend API
curl http://aimarketpulse-alb-1387394868.eu-north-1.elb.amazonaws.com/api/v1
```

## Why This Will Work Now

### Previous Deployments (Failed):
```
Docker Image:
  ❌ No curl installed
  ↓
Health Check:
  ❌ curl: command not found
  ↓
Result:
  ❌ Health check failed
  ❌ Task stopped
  ❌ Rollback failed
```

### New Deployment (Will Succeed):
```
Docker Image:
  ✅ curl installed
  ✅ Correct health check paths
  ↓
Health Check:
  ✅ curl -f http://localhost:3000 (frontend)
  ✅ curl -f http://localhost:8000/health (backend)
  ↓
Result:
  ✅ Health check passed
  ✅ Task healthy
  ✅ Deployment successful
```

## Troubleshooting

### If deployment still fails:

**Check CloudWatch Logs:**
1. Go to CloudWatch Console
2. Log Groups:
   - `/ecs/aimarketpulse-frontend`
   - `/ecs/aimarketpulse-backend`
3. Look for errors

**Common Issues:**
- Database connection errors (backend)
- Port binding errors
- Application crashes
- Out of memory

**Check GitHub Actions:**
1. Go to Actions tab
2. Click on failed workflow
3. Check build logs for errors

## Force New Deployment (If Needed)

If the service is stuck, you can force a new deployment:

**Option 1: Via AWS Console**
1. Go to ECS → Cluster → Service
2. Click **Update service**
3. Check **Force new deployment**
4. Click **Update**

**Option 2: Via AWS CLI** (if installed)
```bash
aws ecs update-service \
  --cluster aimarketpulse-cluster \
  --service frontend-service \
  --force-new-deployment \
  --region eu-north-1

aws ecs update-service \
  --cluster aimarketpulse-cluster \
  --service backend-service \
  --force-new-deployment \
  --region eu-north-1
```

## Summary

**Problem:** Rollback failed because old version also had health check issues

**Solution:** Deploy new version with fixes

**Action Required:**
1. Commit all changes
2. Push to GitHub
3. Wait 20 minutes
4. Verify services are healthy

**Files to Commit:**
- frontend/Dockerfile (added curl)
- backend/Dockerfile (added curl)
- backend-task-def.json (fixed path)
- Documentation files

**Expected Result:**
- ✅ Both services healthy
- ✅ Application accessible
- ✅ No more rollback failures

**Next Step:** Run the git commands above to deploy the fixes!
