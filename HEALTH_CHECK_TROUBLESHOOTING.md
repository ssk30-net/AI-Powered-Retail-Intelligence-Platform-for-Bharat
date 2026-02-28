# Health Check Troubleshooting Guide

## Your Current Setup

**Region**: eu-north-1  
**ALB DNS**: aimarketpulse-alb-1387394868.eu-north-1.elb.amazonaws.com  
**RDS Endpoint**: database-1.cjqose8cc9yh.eu-north-1.rds.amazonaws.com  
**Cluster**: aimarketpulse-cluster  

## Common Health Check Failure Causes

### 1. ALB Target Group Health Check Settings

The ALB target group health checks are SEPARATE from container health checks. Both must be configured correctly.

#### Check Your Target Group Settings (AWS Console)

**For Backend Target Group (backend-tg):**
1. Go to: EC2 → Target Groups → backend-tg → Health checks tab
2. Verify these settings:

```
Protocol: HTTP
Path: /health
Port: traffic port (8000)
Healthy threshold: 2
Unhealthy threshold: 2
Timeout: 5 seconds
Interval: 30 seconds
Success codes: 200
```

**For Frontend Target Group (frontend-tg):**
```
Protocol: HTTP
Path: /
Port: traffic port (3000)
Healthy threshold: 2
Unhealthy threshold: 2
Timeout: 5 seconds
Interval: 30 seconds
Success codes: 200
```

#### How to Fix in AWS Console

1. Go to: EC2 → Target Groups
2. Select target group → Health checks tab → Edit
3. Update the settings above
4. Save changes
5. Wait 1-2 minutes for health checks to run

---

### 2. Security Group Configuration

Your containers must allow inbound traffic from the ALB.

#### Check Security Groups (AWS Console)

**ECS Task Security Group:**
1. Go to: ECS → Clusters → aimarketpulse-cluster → Services
2. Click backend-service → Networking tab
3. Note the Security Group ID (e.g., sg-xxxxx)
4. Go to: EC2 → Security Groups → Find that SG
5. Check Inbound Rules:

**Required Rules:**
```
Type: Custom TCP
Port: 8000
Source: ALB Security Group (sg-yyyyy) or 0.0.0.0/0
Description: Allow ALB health checks

Type: Custom TCP
Port: 3000
Source: ALB Security Group (sg-yyyyy) or 0.0.0.0/0
Description: Allow frontend traffic
```

#### How to Fix

1. EC2 → Security Groups → Select ECS task SG
2. Inbound rules → Edit inbound rules
3. Add rule:
   - Type: Custom TCP
   - Port: 8000
   - Source: Custom → Select ALB security group OR 0.0.0.0/0
4. Add rule:
   - Type: Custom TCP
   - Port: 3000
   - Source: Custom → Select ALB security group OR 0.0.0.0/0
5. Save rules

---

### 3. Container Not Starting

If containers are crashing before health checks can run:

#### Check CloudWatch Logs (AWS Console)

1. Go to: CloudWatch → Log groups
2. Find: `/ecs/aimarketpulse-backend`
3. Click latest log stream
4. Look for errors:

**Common Errors:**
```
❌ Database connection failed
❌ Port already in use
❌ Module not found
❌ Environment variable missing
```

#### Check ECS Task Events

1. Go to: ECS → Clusters → aimarketpulse-cluster
2. Click backend-service → Tasks tab
3. Click a STOPPED task
4. Check "Stopped reason"

**Common Reasons:**
- Essential container exited
- Health check failed
- Task failed to start

---

### 4. Database Connection Issues

Backend might be failing to connect to RDS.

#### Verify RDS Security Group

1. Go to: RDS → Databases → database-1
2. Click on it → Connectivity & security tab
3. Note the Security Group
4. Go to: EC2 → Security Groups → Find RDS SG
5. Check Inbound Rules:

**Required Rule:**
```
Type: PostgreSQL
Port: 5432
Source: ECS Task Security Group OR VPC CIDR (e.g., 172.31.0.0/16)
Description: Allow ECS tasks to connect
```

#### How to Fix

1. EC2 → Security Groups → Select RDS SG
2. Inbound rules → Edit inbound rules
3. Add rule:
   - Type: PostgreSQL
   - Port: 5432
   - Source: Custom → Select ECS task security group OR VPC CIDR
4. Save rules

---

### 5. Task Definition Issues

The task definition might not have the correct health check configuration.

#### Verify Task Definition (AWS Console)

1. Go to: ECS → Task Definitions
2. Find: aimarketpulse-backend (latest revision)
3. Click on it → JSON tab
4. Check for `healthCheck` section:

**Should have:**
```json
"healthCheck": {
  "command": ["CMD-SHELL", "curl -f http://localhost:8000/health || exit 1"],
  "interval": 30,
  "timeout": 5,
  "retries": 3,
  "startPeriod": 60
}
```

If missing, the task definition wasn't registered from our JSON files.

---

## Step-by-Step Fix Process

### Option A: Quick Fix via AWS Console (Recommended)

#### Step 1: Fix Target Group Health Checks

1. **Backend Target Group:**
   - EC2 → Target Groups → backend-tg
   - Health checks → Edit
   - Path: `/health`
   - Port: traffic port
   - Save

2. **Frontend Target Group:**
   - EC2 → Target Groups → frontend-tg
   - Health checks → Edit
   - Path: `/`
   - Port: traffic port
   - Save

#### Step 2: Fix Security Groups

1. **Find ECS Task Security Group:**
   - ECS → Clusters → aimarketpulse-cluster → backend-service
   - Networking tab → Note Security Group ID

2. **Add Inbound Rules:**
   - EC2 → Security Groups → Select ECS task SG
   - Inbound rules → Edit
   - Add: Custom TCP, Port 8000, Source: 0.0.0.0/0
   - Add: Custom TCP, Port 3000, Source: 0.0.0.0/0
   - Save

3. **Fix RDS Security Group:**
   - RDS → database-1 → Connectivity & security → Note SG
   - EC2 → Security Groups → Select RDS SG
   - Inbound rules → Edit
   - Add: PostgreSQL, Port 5432, Source: ECS task SG
   - Save

#### Step 3: Update Task Definitions

Since GitHub Actions now registers task definitions, just wait for the current deployment to complete (~20 minutes from last push).

Or manually update:

1. **Backend Task Definition:**
   - ECS → Task Definitions → aimarketpulse-backend
   - Create new revision → JSON
   - Paste content from `backend-task-def.json`
   - Create

2. **Frontend Task Definition:**
   - ECS → Task Definitions → aimarketpulse-frontend
   - Create new revision → JSON
   - Paste content from `frontend-task-def.json`
   - Create

3. **Update Services:**
   - ECS → Clusters → aimarketpulse-cluster
   - backend-service → Update service
   - Force new deployment → Update
   - Repeat for frontend-service

#### Step 4: Monitor Deployment

1. **Check Service Status:**
   - ECS → Clusters → aimarketpulse-cluster
   - Both services should show "ACTIVE"
   - Deployments tab should show "PRIMARY" deployment

2. **Check Target Health:**
   - EC2 → Target Groups
   - backend-tg → Targets tab
   - Should show "healthy" status
   - Repeat for frontend-tg

3. **Check Logs:**
   - CloudWatch → Log groups
   - `/ecs/aimarketpulse-backend`
   - Look for successful startup messages

---

### Option B: Wait for GitHub Actions (Current Deployment)

The deployment from commit `c3e4734` is currently running. It will:

1. ✅ Build images with curl installed
2. ✅ Register task definitions with health checks
3. ✅ Deploy new tasks
4. ⏳ Wait for health checks to pass

**Timeline**: ~20 minutes from push (around 2:00 PM if pushed at 1:40 PM)

**Monitor at**: https://github.com/ssk30-net/AI-Powered-Retail-Intelligence-Platform-for-Bharat/actions

---

## Verification Checklist

After fixes, verify:

### 1. Target Groups
- [ ] backend-tg health check path is `/health`
- [ ] frontend-tg health check path is `/`
- [ ] Both show healthy targets

### 2. Security Groups
- [ ] ECS task SG allows inbound 8000 and 3000
- [ ] RDS SG allows inbound 5432 from ECS tasks
- [ ] ALB SG allows inbound 80 from internet

### 3. Services
- [ ] backend-service shows ACTIVE status
- [ ] frontend-service shows ACTIVE status
- [ ] No stopped tasks with errors

### 4. Application
- [ ] Frontend loads: http://aimarketpulse-alb-1387394868.eu-north-1.elb.amazonaws.com
- [ ] Backend health: http://aimarketpulse-alb-1387394868.eu-north-1.elb.amazonaws.com/health
- [ ] API docs: http://aimarketpulse-alb-1387394868.eu-north-1.elb.amazonaws.com/api/v1/docs

---

## Most Likely Issue

Based on your setup, the most likely issue is:

**ALB Target Group health check path is wrong**

- Backend target group is probably checking `/api/v1/health` (doesn't exist)
- Should be checking `/health` (exists in backend/app/main.py)

**Quick Fix:**
1. EC2 → Target Groups → backend-tg → Health checks → Edit
2. Change path from `/api/v1/health` to `/health`
3. Save
4. Wait 1-2 minutes

This should immediately fix the backend health checks!

---

## Need More Help?

If still failing after these fixes, provide:
1. Screenshot of target group health check settings
2. Screenshot of ECS service events (last 5 events)
3. CloudWatch logs (last 20 lines from backend)
4. Security group inbound rules

I'll help diagnose the specific issue!
