# Troubleshooting: Connection Timeout Error

## Error
```
This site can't be reached
aimarketpulse-alb-1387394868.eu-north-1.elb.amazonaws.com took too long to respond.
ERR_CONNECTION_TIMED_OUT
```

## Root Cause
The Application Load Balancer (ALB) is not accessible. This could be due to:
1. ❌ ECS services not running
2. ❌ Security group blocking traffic
3. ❌ No healthy targets in target group
4. ❌ Services not deployed yet

---

## Step-by-Step Troubleshooting

### Step 1: Check GitHub Actions Deployment Status

1. Go to your GitHub repository
2. Click on **Actions** tab
3. Check the latest "Deploy to AWS ECS" workflow
4. Verify both jobs completed successfully:
   - ✅ deploy-backend
   - ✅ deploy-frontend

**If workflow failed:**
- Click on the failed job to see error logs
- Fix the errors and push again

---

### Step 2: Check ECS Services Status

1. Go to AWS Console: https://eu-north-1.console.aws.amazon.com/ecs/
2. Click on **Clusters** → **aimarketpulse-cluster**
3. Click on **Services** tab
4. Check both services:

**frontend-service:**
- Status: Should be **ACTIVE**
- Running tasks: Should be **1** or more
- Desired tasks: Should match running tasks

**backend-service:**
- Status: Should be **ACTIVE**
- Running tasks: Should be **1** or more
- Desired tasks: Should match running tasks

**If tasks are 0/0:**
- Services haven't been deployed yet
- Need to push code to trigger GitHub Actions

**If tasks are 0/1 (desired but not running):**
- Click on the service → **Tasks** tab
- Check task status and logs
- Look for errors in **Stopped tasks**

---

### Step 3: Check Task Status

1. In ECS cluster → **frontend-service** → **Tasks** tab
2. Click on a running task
3. Check:
   - **Last status:** Should be **RUNNING**
   - **Health status:** Should be **HEALTHY**
   - **Container status:** Should be **RUNNING**

**If task is STOPPED:**
- Click on **Logs** tab to see why it stopped
- Common issues:
  - Docker image not found
  - Container crashed
  - Health check failed

---

### Step 4: Check Security Groups

1. Go to EC2 Console: https://eu-north-1.console.aws.amazon.com/ec2/
2. Click on **Load Balancers** (left sidebar)
3. Find **aimarketpulse-alb**
4. Click on **Security** tab
5. Click on the security group link

**Required Inbound Rules:**
```
Type: HTTP
Protocol: TCP
Port: 80
Source: 0.0.0.0/0 (Anywhere IPv4)
```

**If rule is missing:**
1. Click **Edit inbound rules**
2. Click **Add rule**
3. Type: HTTP
4. Source: Anywhere-IPv4 (0.0.0.0/0)
5. Click **Save rules**

---

### Step 5: Check Target Groups

1. In EC2 Console → **Target Groups** (left sidebar)
2. Find target groups for frontend and backend
3. Click on each target group
4. Check **Targets** tab

**Healthy targets should show:**
- Status: **healthy**
- Health status: **Healthy**

**If status is "unhealthy":**
- Check health check configuration
- Verify container is listening on correct port
- Check container logs

**If no targets registered:**
- ECS service hasn't registered tasks yet
- Check ECS service configuration

---

### Step 6: Check ALB Listener Rules

1. In EC2 Console → **Load Balancers**
2. Click on **aimarketpulse-alb**
3. Click on **Listeners** tab
4. Should have listener on **Port 80**

**Click on listener to check rules:**
- Default rule should forward to target group
- Path-based rules for /api → backend
- Default → frontend

---

### Step 7: Check CloudWatch Logs

1. Go to CloudWatch: https://eu-north-1.console.aws.amazon.com/cloudwatch/
2. Click on **Log groups** (left sidebar)
3. Find logs for:
   - `/ecs/frontend-service`
   - `/ecs/backend-service`

**Look for errors:**
- Container startup errors
- Application crashes
- Port binding issues

---

## Quick Fixes

### Fix 1: Services Not Running
```bash
# Trigger deployment by pushing code
git add .
git commit -m "Trigger deployment"
git push origin main
```

### Fix 2: Security Group Blocking
**Add inbound rule for HTTP (port 80):**
1. EC2 → Security Groups
2. Find ALB security group
3. Add inbound rule: HTTP, 0.0.0.0/0

### Fix 3: No Healthy Targets
**Check container health:**
1. ECS → Cluster → Service → Tasks
2. Click on task → Logs
3. Fix any container errors

### Fix 4: Wrong Port Configuration
**Verify task definition:**
- Container port: 3000 (frontend), 8000 (backend)
- Host port: 0 (dynamic)
- Target group port: 3000 (frontend), 8000 (backend)

---

## Common Issues & Solutions

### Issue 1: "No tasks running"
**Cause:** Services not deployed or deployment failed
**Solution:** 
1. Check GitHub Actions logs
2. Fix any build errors
3. Push code again

### Issue 2: "Tasks keep stopping"
**Cause:** Container crashes or health check fails
**Solution:**
1. Check CloudWatch logs
2. Fix application errors
3. Verify health check endpoint

### Issue 3: "Unhealthy targets"
**Cause:** Container not responding to health checks
**Solution:**
1. Verify container is listening on correct port
2. Check health check path (should be `/` or `/health`)
3. Increase health check timeout

### Issue 4: "Connection timeout"
**Cause:** Security group blocking traffic
**Solution:**
1. Add inbound rule for HTTP (port 80)
2. Source: 0.0.0.0/0

---

## Verification Checklist

Before the URL works, verify:

- [ ] GitHub Actions workflow completed successfully
- [ ] ECS services are ACTIVE
- [ ] Tasks are RUNNING (not STOPPED)
- [ ] Tasks are HEALTHY
- [ ] Security group allows HTTP (port 80)
- [ ] Target groups have healthy targets
- [ ] ALB listener is configured
- [ ] No errors in CloudWatch logs

---

## Expected Timeline

After pushing code:
1. **0-2 min:** GitHub Actions starts
2. **5-10 min:** Docker builds images
3. **2-5 min:** Images pushed to ECR
4. **3-5 min:** ECS deploys new tasks
5. **1-2 min:** Health checks pass
6. **Total: ~15-20 minutes**

---

## Next Steps

1. **Check GitHub Actions:**
   - Go to repository → Actions tab
   - Verify latest workflow succeeded

2. **Check ECS Services:**
   - Go to ECS Console
   - Verify services are running

3. **Check Security Groups:**
   - Go to EC2 → Load Balancers
   - Verify HTTP (port 80) is allowed

4. **If still not working:**
   - Check CloudWatch logs for errors
   - Review task stopped reasons
   - Verify target group health

---

## Contact Points

### AWS Console Links
- **ECS Cluster:** https://eu-north-1.console.aws.amazon.com/ecs/home?region=eu-north-1#/clusters/aimarketpulse-cluster
- **Load Balancers:** https://eu-north-1.console.aws.amazon.com/ec2/home?region=eu-north-1#LoadBalancers:
- **CloudWatch Logs:** https://eu-north-1.console.aws.amazon.com/cloudwatch/home?region=eu-north-1#logsV2:log-groups

### Your Resources
- **Cluster:** aimarketpulse-cluster
- **ALB:** aimarketpulse-alb-1387394868.eu-north-1.elb.amazonaws.com
- **Region:** eu-north-1
- **Services:** frontend-service, backend-service

---

## Most Likely Issue

Based on the error, the most likely issues are:

1. **Services haven't been deployed yet**
   - Solution: Commit and push code to trigger deployment

2. **Security group blocking traffic**
   - Solution: Add HTTP inbound rule to ALB security group

3. **No healthy targets**
   - Solution: Check ECS tasks are running and healthy

**Start with Step 1 (GitHub Actions) and work through each step!**
