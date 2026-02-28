# Task Definition Registration Fix

## Root Cause

The health checks were still failing because the GitHub Actions workflow was NOT registering the updated task definitions. 

**What was happening:**
- We updated `backend-task-def.json` and `frontend-task-def.json` with correct health checks
- We pushed the Dockerfiles with curl installed
- BUT the workflow only ran `aws ecs update-service --force-new-deployment`
- This used the OLD task definitions stored in AWS (without health checks)
- The new JSON files were never registered with AWS

## The Fix

Updated `.github/workflows/deploy.yml` to register task definitions BEFORE updating services:

### Backend Deployment
```yaml
- name: Register backend task definition
  run: |
    aws ecs register-task-definition \
      --cli-input-json file://backend-task-def.json \
      --region $AWS_REGION
    echo "Backend task definition registered"

- name: Update ECS backend service
  run: |
    aws ecs update-service \
      --cluster $ECS_CLUSTER \
      --service $ECS_BACKEND_SERVICE \
      --force-new-deployment \
      --region $AWS_REGION
    echo "Backend service updated"
```

### Frontend Deployment
```yaml
- name: Register frontend task definition
  run: |
    aws ecs register-task-definition \
      --cli-input-json file://frontend-task-def.json \
      --region $AWS_REGION
    echo "Frontend task definition registered"

- name: Update ECS frontend service
  run: |
    aws ecs update-service \
      --cluster $ECS_CLUSTER \
      --service $ECS_FRONTEND_SERVICE \
      --force-new-deployment \
      --region $AWS_REGION
    echo "Frontend service updated"
```

## What This Does

1. **Registers new task definition revision** from the JSON file
   - Includes health check configuration
   - Includes environment variables
   - Includes all container settings

2. **Updates the service** to use the new task definition
   - Forces new deployment with updated configuration
   - Replaces old tasks with new ones

## Deployment Status

**Commit**: `c3e4734` - "Fix deployment workflow to register task definitions with health checks"

**What's Deploying:**
- Backend task definition with:
  - curl installed in Dockerfile
  - Health check: `curl -f http://localhost:8000/health`
  
- Frontend task definition with:
  - curl installed in Dockerfile  
  - Health check: `curl -f http://localhost:3000`

## Timeline

- **5-10 minutes**: GitHub Actions builds and pushes images
- **2-3 minutes**: Register task definitions
- **10-15 minutes**: ECS deploys new tasks and waits for health checks
- **Total**: ~20 minutes

## Monitoring

### GitHub Actions
```
https://github.com/ssk30-net/AI-Powered-Retail-Intelligence-Platform-for-Bharat/actions
```

Look for:
- ✅ Build, tag, and push backend image
- ✅ Register backend task definition (NEW STEP)
- ✅ Update ECS backend service
- ✅ Build, tag, and push frontend image
- ✅ Register frontend task definition (NEW STEP)
- ✅ Update ECS frontend service

### AWS ECS Console
1. Go to ECS → Clusters → aimarketpulse-cluster
2. Click on each service
3. Check "Deployments" tab - should see new deployment in progress
4. Check "Tasks" tab - should see new tasks starting

### AWS Target Groups
1. Go to EC2 → Target Groups
2. Check health status:
   - `backend-tg`: Should transition to "Healthy"
   - `frontend-tg`: Should transition to "Healthy"

## Why This Will Work Now

**Before:**
- Task definitions in AWS had NO health checks
- Services used old task definitions
- Containers started but ALB couldn't verify health

**After:**
- Task definitions registered with health checks
- Services use new task definitions
- Containers have curl installed
- Health checks can run successfully
- ALB sees healthy targets

## Testing After Deployment

### Frontend
```
http://aimarketpulse-alb-1387394868.eu-north-1.elb.amazonaws.com
```

### Backend Health
```
http://aimarketpulse-alb-1387394868.eu-north-1.elb.amazonaws.com/health
```

Expected: `{"status": "healthy"}`

### Backend API Docs
```
http://aimarketpulse-alb-1387394868.eu-north-1.elb.amazonaws.com/api/v1/docs
```

## If Still Failing

If health checks still fail after this deployment, check:

1. **CloudWatch Logs** - Look for application startup errors
   - `/ecs/aimarketpulse-backend`
   - `/ecs/aimarketpulse-frontend`

2. **Task Definition** - Verify it was registered
   ```bash
   aws ecs describe-task-definition --task-definition aimarketpulse-backend
   aws ecs describe-task-definition --task-definition aimarketpulse-frontend
   ```

3. **Security Groups** - Ensure containers can receive health check traffic
   - Container security group must allow inbound on ports 3000 and 8000

4. **ALB Target Group Settings** - Verify health check configuration matches
   - Path: `/` for frontend, `/health` for backend
   - Port: 3000 for frontend, 8000 for backend
   - Protocol: HTTP

## Files Modified

- `.github/workflows/deploy.yml` - Added task definition registration steps
- `backend-task-def.json` - Already had correct health check path
- `frontend-task-def.json` - Already had correct health check
- `backend/Dockerfile` - Already had curl installed
- `frontend/Dockerfile` - Already had curl installed
