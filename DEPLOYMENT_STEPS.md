# Deployment Steps - AI Market Pulse

Your AWS resources are already created! Follow these steps to deploy.

## ✅ AWS Resources (Already Created)

### Database (RDS)
- **Endpoint**: `database-1.cjqose8cc9yh.eu-north-1.rds.amazonaws.com`
- **Port**: 5432
- **Username**: postgres
- **Password**: ai-market-pulse
- **Database**: aimarketpulse

### Container Registry (ECR)
- **Backend**: `152641673729.dkr.ecr.eu-north-1.amazonaws.com/aimarketpulse-backend`
- **Frontend**: `152641673729.dkr.ecr.eu-north-1.amazonaws.com/aimarketpulse-frontend`

### ECS Cluster
- **Name**: aimarketpulse-cluster

### Load Balancer
- **DNS**: `aimarketpulse-alb-1387394868.eu-north-1.elb.amazonaws.com`
- **Backend Target Group**: `arn:aws:elasticloadbalancing:eu-north-1:152641673729:targetgroup/backend-tg/7fef312bd1eebe84`
- **Frontend Target Group**: `arn:aws:elasticloadbalancing:eu-north-1:152641673729:targetgroup/frontend-tg/dae63585b277fef9`

### Network
- **VPC**: vpc-05e647d25380973bf
- **Subnet 1**: subnet-01972bde1dfdfe51c
- **Subnet 2**: subnet-01f2173246be06bb9
- **Security Group**: sg-022f3cb929d96795c

---

## 🚀 Deployment Steps

### Step 1: Initialize Database

**Connect to RDS and create tables:**

```bash
# Install psql if not already installed
# Windows: Download from postgresql.org

# Connect to RDS
psql -h database-1.cjqose8cc9yh.eu-north-1.rds.amazonaws.com -U postgres -d aimarketpulse

# Enter password: ai-market-pulse

# Check if connected
\conninfo

# Exit
\q
```

**Or initialize from backend:**

```bash
cd backend
venv\Scripts\activate

# Update .env with RDS endpoint (already done!)
# DATABASE_URL=postgresql://postgres:ai-market-pulse@database-1.cjqose8cc9yh.eu-north-1.rds.amazonaws.com:5432/aimarketpulse

# Initialize database
python -m app.core.init_db
```

---

### Step 2: Register Task Definitions

**Register backend task definition:**

```bash
aws ecs register-task-definition \
    --cli-input-json file://backend-task-def.json \
    --region eu-north-1
```

**Register frontend task definition:**

```bash
aws ecs register-task-definition \
    --cli-input-json file://frontend-task-def.json \
    --region eu-north-1
```

---

### Step 3: Create ECS Services

**Create backend service:**

```bash
aws ecs create-service \
    --cluster aimarketpulse-cluster \
    --service-name backend-service \
    --task-definition aimarketpulse-backend \
    --desired-count 2 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[subnet-01972bde1dfdfe51c,subnet-01f2173246be06bb9],securityGroups=[sg-022f3cb929d96795c],assignPublicIp=ENABLED}" \
    --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:eu-north-1:152641673729:targetgroup/backend-tg/7fef312bd1eebe84,containerName=backend,containerPort=8000" \
    --region eu-north-1
```

**Create frontend service:**

```bash
aws ecs create-service \
    --cluster aimarketpulse-cluster \
    --service-name frontend-service \
    --task-definition aimarketpulse-frontend \
    --desired-count 2 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[subnet-01972bde1dfdfe51c,subnet-01f2173246be06bb9],securityGroups=[sg-022f3cb929d96795c],assignPublicIp=ENABLED}" \
    --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:eu-north-1:152641673729:targetgroup/frontend-tg/dae63585b277fef9,containerName=frontend,containerPort=3000" \
    --region eu-north-1
```

---

### Step 4: Setup GitHub Secrets

**Add secrets to your GitHub repository:**

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these secrets:

**AWS_ACCESS_KEY_ID:**
```
AKIASHCRHDIARDSLHROT
```

**AWS_SECRET_ACCESS_KEY:**
```
dTRALrZYYLO60enreoyk2yfdwDbTL9p0OsxqY8bO
```

---

### Step 5: Push to GitHub (Automatic Deployment)

**Commit and push your code:**

```bash
git add .
git commit -m "Add AWS deployment configuration"
git push origin main
```

**GitHub Actions will automatically:**
1. Build Docker images
2. Push to ECR
3. Update ECS services
4. Deploy new containers

**Monitor deployment:**
- Go to GitHub → Actions tab
- Watch the deployment progress

---

### Step 6: Configure Load Balancer Listeners

**Check ALB listeners:**

```bash
aws elbv2 describe-listeners \
    --load-balancer-arn $(aws elbv2 describe-load-balancers --names aimarketpulse-alb --query 'LoadBalancers[0].LoadBalancerArn' --output text --region eu-north-1) \
    --region eu-north-1
```

**If no listeners exist, create them:**

**Backend listener (port 8000):**
```bash
aws elbv2 create-listener \
    --load-balancer-arn $(aws elbv2 describe-load-balancers --names aimarketpulse-alb --query 'LoadBalancers[0].LoadBalancerArn' --output text --region eu-north-1) \
    --protocol HTTP \
    --port 8000 \
    --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:eu-north-1:152641673729:targetgroup/backend-tg/7fef312bd1eebe84 \
    --region eu-north-1
```

**Frontend listener (port 80):**
```bash
aws elbv2 create-listener \
    --load-balancer-arn $(aws elbv2 describe-load-balancers --names aimarketpulse-alb --query 'LoadBalancers[0].LoadBalancerArn' --output text --region eu-north-1) \
    --protocol HTTP \
    --port 80 \
    --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:eu-north-1:152641673729:targetgroup/frontend-tg/dae63585b277fef9 \
    --region eu-north-1
```

---

## 🧪 Testing Deployment

### Check ECS Services

```bash
# Check backend service
aws ecs describe-services \
    --cluster aimarketpulse-cluster \
    --services backend-service \
    --region eu-north-1

# Check frontend service
aws ecs describe-services \
    --cluster aimarketpulse-cluster \
    --services frontend-service \
    --region eu-north-1
```

### Check Running Tasks

```bash
# List tasks
aws ecs list-tasks \
    --cluster aimarketpulse-cluster \
    --region eu-north-1

# Describe a task
aws ecs describe-tasks \
    --cluster aimarketpulse-cluster \
    --tasks <task-arn> \
    --region eu-north-1
```

### Test Backend API

```bash
# Health check
curl http://aimarketpulse-alb-1387394868.eu-north-1.elb.amazonaws.com:8000/health

# API root
curl http://aimarketpulse-alb-1387394868.eu-north-1.elb.amazonaws.com:8000/

# API docs
curl http://aimarketpulse-alb-1387394868.eu-north-1.elb.amazonaws.com:8000/docs
```

### Test Frontend

```bash
# Open in browser
http://aimarketpulse-alb-1387394868.eu-north-1.elb.amazonaws.com
```

---

## 📊 Monitoring

### View Logs

**Backend logs:**
```bash
aws logs tail /ecs/aimarketpulse-backend --follow --region eu-north-1
```

**Frontend logs:**
```bash
aws logs tail /ecs/aimarketpulse-frontend --follow --region eu-north-1
```

### Check Target Health

```bash
# Backend target health
aws elbv2 describe-target-health \
    --target-group-arn arn:aws:elasticloadbalancing:eu-north-1:152641673729:targetgroup/backend-tg/7fef312bd1eebe84 \
    --region eu-north-1

# Frontend target health
aws elbv2 describe-target-health \
    --target-group-arn arn:aws:elasticloadbalancing:eu-north-1:152641673729:targetgroup/frontend-tg/dae63585b277fef9 \
    --region eu-north-1
```

---

## 🔄 Update Deployment

**To deploy new changes:**

1. Make code changes
2. Commit and push to GitHub
3. GitHub Actions automatically builds and deploys

**Or manually update:**

```bash
# Update backend
aws ecs update-service \
    --cluster aimarketpulse-cluster \
    --service backend-service \
    --force-new-deployment \
    --region eu-north-1

# Update frontend
aws ecs update-service \
    --cluster aimarketpulse-cluster \
    --service frontend-service \
    --force-new-deployment \
    --region eu-north-1
```

---

## 🎯 Access Your Application

### Backend API
- **Health**: http://aimarketpulse-alb-1387394868.eu-north-1.elb.amazonaws.com:8000/health
- **API Docs**: http://aimarketpulse-alb-1387394868.eu-north-1.elb.amazonaws.com:8000/docs
- **API Root**: http://aimarketpulse-alb-1387394868.eu-north-1.elb.amazonaws.com:8000/api/v1

### Frontend
- **URL**: http://aimarketpulse-alb-1387394868.eu-north-1.elb.amazonaws.com

---

## 🛠️ Troubleshooting

### Service won't start
```bash
# Check service events
aws ecs describe-services \
    --cluster aimarketpulse-cluster \
    --services backend-service \
    --region eu-north-1 \
    --query 'services[0].events[0:5]'
```

### Container keeps restarting
```bash
# Check logs
aws logs tail /ecs/aimarketpulse-backend --follow --region eu-north-1
```

### Target unhealthy
- Check security group allows traffic on ports 8000 and 3000
- Check health check endpoint is responding
- Check container logs for errors

### Database connection error
- Verify RDS security group allows traffic from ECS security group
- Check DATABASE_URL in task definition
- Verify RDS is publicly accessible or in same VPC

---

## ✅ Deployment Checklist

- [ ] Database initialized with tables
- [ ] Task definitions registered
- [ ] ECS services created
- [ ] GitHub secrets added
- [ ] Code pushed to GitHub
- [ ] GitHub Actions completed successfully
- [ ] ALB listeners configured
- [ ] Backend health check passing
- [ ] Frontend accessible
- [ ] API endpoints working

---

**Your application should now be live at:**
- Frontend: http://aimarketpulse-alb-1387394868.eu-north-1.elb.amazonaws.com
- Backend API: http://aimarketpulse-alb-1387394868.eu-north-1.elb.amazonaws.com:8000/docs
