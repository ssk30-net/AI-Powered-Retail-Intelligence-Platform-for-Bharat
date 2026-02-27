# Quick Fix Checklist - Connection Timeout

## The Problem
Your URL `http://aimarketpulse-alb-1387394868.eu-north-1.elb.amazonaws.com` is timing out.

## Most Likely Causes (in order)

### 1. ⚠️ Services Not Deployed Yet
**Check:** Did you commit and push the latest changes?

**Action:**
```bash
# Commit all changes
git add .
git commit -m "Deploy application with all fixes"
git push origin main
```

**Then wait 15-20 minutes for deployment to complete**

---

### 2. ⚠️ Security Group Blocking Traffic
**Check:** Is HTTP (port 80) allowed in the ALB security group?

**Action:**
1. Go to: https://eu-north-1.console.aws.amazon.com/ec2/#LoadBalancers:
2. Click on **aimarketpulse-alb**
3. Click **Security** tab
4. Click on the security group link
5. Click **Edit inbound rules**
6. Add rule:
   - Type: **HTTP**
   - Port: **80**
   - Source: **0.0.0.0/0** (Anywhere)
7. Click **Save rules**

---

### 3. ⚠️ ECS Services Not Running
**Check:** Are the ECS services active?

**Action:**
1. Go to: https://eu-north-1.console.aws.amazon.com/ecs/home?region=eu-north-1#/clusters/aimarketpulse-cluster
2. Click **Services** tab
3. Check:
   - **frontend-service** → Status: ACTIVE, Running: 1+
   - **backend-service** → Status: ACTIVE, Running: 1+

**If services are not running:**
- Check GitHub Actions for deployment errors
- Review CloudWatch logs for container errors

---

## Quick Diagnostic Steps

### Step 1: Check GitHub Actions (2 minutes)
1. Go to your GitHub repository
2. Click **Actions** tab
3. Look at the latest workflow run
4. ✅ Both jobs should be green (deploy-backend, deploy-frontend)
5. ❌ If red, click to see error and fix it

### Step 2: Check ECS Services (2 minutes)
1. Open: https://eu-north-1.console.aws.amazon.com/ecs/home?region=eu-north-1#/clusters/aimarketpulse-cluster
2. Click **Services** tab
3. Verify both services show:
   - Status: **ACTIVE**
   - Running tasks: **1** or more
   - Desired tasks: matches running

### Step 3: Check Security Group (2 minutes)
1. Open: https://eu-north-1.console.aws.amazon.com/ec2/#LoadBalancers:
2. Click **aimarketpulse-alb**
3. **Security** tab → Click security group
4. **Inbound rules** → Should have:
   ```
   Type: HTTP
   Port: 80
   Source: 0.0.0.0/0
   ```

---

## What to Do Right Now

### Option A: If you haven't pushed the latest changes
```bash
# 1. Commit everything
git add frontend/.dockerignore
git add frontend/Dockerfile
git add frontend/public/.gitkeep
git add *.md
git commit -m "Fix Docker build and add missing files"

# 2. Push to trigger deployment
git push origin main

# 3. Wait 15-20 minutes
# 4. Check GitHub Actions progress
# 5. Try URL again
```

### Option B: If you already pushed
1. Check GitHub Actions status (see Step 1 above)
2. If successful, check ECS services (see Step 2 above)
3. If services running, check security group (see Step 3 above)

---

## Expected Behavior

### After Successful Deployment:
1. ✅ GitHub Actions shows green checkmarks
2. ✅ ECS services show ACTIVE with running tasks
3. ✅ Target groups show healthy targets
4. ✅ URL loads the application

### Timeline:
- **Commit & Push:** Instant
- **GitHub Actions:** 5-10 minutes
- **ECS Deployment:** 5-10 minutes
- **Health Checks:** 1-2 minutes
- **Total:** ~15-20 minutes

---

## Still Not Working?

### Check CloudWatch Logs:
1. Go to: https://eu-north-1.console.aws.amazon.com/cloudwatch/home?region=eu-north-1#logsV2:log-groups
2. Look for:
   - `/ecs/frontend-service`
   - `/ecs/backend-service`
3. Check for errors

### Common Errors:
- **"Cannot find module"** → Dependencies not installed (fixed in latest commit)
- **"Port already in use"** → Container port conflict
- **"Health check failed"** → Container not responding
- **"Image not found"** → Docker image not pushed to ECR

---

## Contact Information

### AWS Resources:
- **Region:** eu-north-1
- **Cluster:** aimarketpulse-cluster
- **ALB:** aimarketpulse-alb-1387394868.eu-north-1.elb.amazonaws.com
- **Services:** frontend-service, backend-service

### Quick Links:
- **ECS Cluster:** https://eu-north-1.console.aws.amazon.com/ecs/home?region=eu-north-1#/clusters/aimarketpulse-cluster
- **Load Balancers:** https://eu-north-1.console.aws.amazon.com/ec2/#LoadBalancers:
- **CloudWatch:** https://eu-north-1.console.aws.amazon.com/cloudwatch/home?region=eu-north-1#logsV2:log-groups

---

## Summary

**Most likely issue:** Services haven't been deployed yet or security group is blocking traffic.

**Quick fix:**
1. Commit and push all changes
2. Wait 15-20 minutes
3. Check security group allows HTTP (port 80)
4. Try URL again

**Need more help?** Check TROUBLESHOOTING_CONNECTION_TIMEOUT.md for detailed steps.
