# AWS Deployment Guide - AI Market Pulse

Complete guide for deploying to AWS using Docker containers.

## 🎯 Understanding Docker for AWS

**Important Clarification:**
- ✅ **Docker Images**: YES, needed for AWS ECS/ECR deployment
- ❌ **Docker Desktop locally**: NO, not needed (use GitHub Actions to build)
- ✅ **Build Images**: GitHub Actions or AWS CodeBuild
- ✅ **Run Containers**: AWS ECS/Fargate

**You don't need Docker Desktop running locally - GitHub Actions builds the images for you!**

---

## 🏗️ AWS Architecture

```
┌──────────────────────────────────────────────────────┐
│                   AWS Cloud                           │
├──────────────────────────────────────────────────────┤
│                                                       │
│  Frontend Container                                   │
│  ├─ ECR (Docker Registry)                            │
│  ├─ ECS Fargate (Runs container)                     │
│  └─ CloudFront (CDN)                                 │
│                                                       │
│  Backend Container                                    │
│  ├─ ECR (Docker Registry)                            │
│  ├─ ECS Fargate (Runs container)                     │
│  └─ Application Load Balancer                        │
│                                                       │
│  Database                                            │
│  └─ RDS PostgreSQL (Managed)                         │
│                                                       │
└──────────────────────────────────────────────────────┘
```

---

## 🚀 Deployment Steps

### Step 1: Create AWS Resources

**1. Create RDS Database:**
```bash
aws rds create-db-instance \
    --db-instance-identifier aimarketpulse-db \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --engine-version 16.1 \
    --master-username admin \
    --master-user-password YourStrongPassword123! \
    --allocated-storage 20 \
    --db-name aimarketpulse
```

**2. Create ECR Repositories:**
```bash
# Backend repository
aws ecr create-repository --repository-name aimarketpulse-backend

# Frontend repository
aws ecr create-repository --repository-name aimarketpulse-frontend
```

Note the repository URIs (e.g., `123456789.dkr.ecr.us-east-1.amazonaws.com/aimarketpulse-backend`)

**3. Create ECS Cluster:**
```bash
aws ecs create-cluster \
    --cluster-name aimarketpulse-cluster \
    --capacity-providers FARGATE
```

---

### Step 2: Setup GitHub Actions (Automated Deployment)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS ECS

on:
  push:
    branches: [main]

env:
  AWS_REGION: us-east-1
  ECR_BACKEND_REPO: aimarketpulse-backend
  ECR_FRONTEND_REPO: aimarketpulse-frontend
  ECS_CLUSTER: aimarketpulse-cluster
  ECS_BACKEND_SERVICE: backend-service
  ECS_FRONTEND_SERVICE: frontend-service

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1

      - name: Build, tag, and push backend image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          cd backend
          docker build -t $ECR_REGISTRY/$ECR_BACKEND_REPO:$IMAGE_TAG .
          docker tag $ECR_REGISTRY/$ECR_BACKEND_REPO:$IMAGE_TAG $ECR_REGISTRY/$ECR_BACKEND_REPO:latest
          docker push $ECR_REGISTRY/$ECR_BACKEND_REPO:$IMAGE_TAG
          docker push $ECR_REGISTRY/$ECR_BACKEND_REPO:latest

      - name: Update ECS service
        run: |
          aws ecs update-service \
            --cluster $ECS_CLUSTER \
            --service $ECS_BACKEND_SERVICE \
            --force-new-deployment

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1

      - name: Build, tag, and push frontend image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          cd frontend
          docker build -t $ECR_REGISTRY/$ECR_FRONTEND_REPO:$IMAGE_TAG .
          docker tag $ECR_REGISTRY/$ECR_FRONTEND_REPO:$IMAGE_TAG $ECR_REGISTRY/$ECR_FRONTEND_REPO:latest
          docker push $ECR_REGISTRY/$ECR_FRONTEND_REPO:$IMAGE_TAG
          docker push $ECR_REGISTRY/$ECR_FRONTEND_REPO:latest

      - name: Update ECS service
        run: |
          aws ecs update-service \
            --cluster $ECS_CLUSTER \
            --service $ECS_FRONTEND_SERVICE \
            --force-new-deployment
```

**Add secrets to GitHub:**
1. Go to your repo → Settings → Secrets and variables → Actions
2. Add `AWS_ACCESS_KEY_ID`
3. Add `AWS_SECRET_ACCESS_KEY`

---

### Step 3: Create ECS Task Definitions

**Backend Task Definition** (`backend-task-def.json`):
```json
{
  "family": "aimarketpulse-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::YOUR_ACCOUNT:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/aimarketpulse-backend:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "DATABASE_URL",
          "value": "postgresql://admin:password@your-rds-endpoint:5432/aimarketpulse"
        },
        {
          "name": "SECRET_KEY",
          "value": "your-secret-key-here"
        },
        {
          "name": "CORS_ORIGINS",
          "value": "[\"https://your-frontend-url.com\"]"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/aimarketpulse-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs",
          "awslogs-create-group": "true"
        }
      }
    }
  ]
}
```

**Register task definition:**
```bash
aws ecs register-task-definition --cli-input-json file://backend-task-def.json
```

**Frontend Task Definition** (`frontend-task-def.json`):
```json
{
  "family": "aimarketpulse-frontend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::YOUR_ACCOUNT:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "frontend",
      "image": "YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/aimarketpulse-frontend:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NEXT_PUBLIC_API_URL",
          "value": "https://api.yourdomain.com"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/aimarketpulse-frontend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs",
          "awslogs-create-group": "true"
        }
      }
    }
  ]
}
```

```bash
aws ecs register-task-definition --cli-input-json file://frontend-task-def.json
```

---

### Step 4: Create Application Load Balancer

```bash
# Create ALB
aws elbv2 create-load-balancer \
    --name aimarketpulse-alb \
    --subnets subnet-xxxxx subnet-yyyyy \
    --security-groups sg-xxxxx \
    --scheme internet-facing

# Create target groups
aws elbv2 create-target-group \
    --name backend-tg \
    --protocol HTTP \
    --port 8000 \
    --vpc-id vpc-xxxxx \
    --target-type ip \
    --health-check-path /api/v1/health

aws elbv2 create-target-group \
    --name frontend-tg \
    --protocol HTTP \
    --port 3000 \
    --vpc-id vpc-xxxxx \
    --target-type ip

# Create listener
aws elbv2 create-listener \
    --load-balancer-arn arn:aws:elasticloadbalancing:... \
    --protocol HTTP \
    --port 80 \
    --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:...
```

---

### Step 5: Create ECS Services

**Backend Service:**
```bash
aws ecs create-service \
    --cluster aimarketpulse-cluster \
    --service-name backend-service \
    --task-definition aimarketpulse-backend \
    --desired-count 2 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxx,subnet-yyyyy],securityGroups=[sg-xxxxx],assignPublicIp=ENABLED}" \
    --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=backend,containerPort=8000"
```

**Frontend Service:**
```bash
aws ecs create-service \
    --cluster aimarketpulse-cluster \
    --service-name frontend-service \
    --task-definition aimarketpulse-frontend \
    --desired-count 2 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxx,subnet-yyyyy],securityGroups=[sg-xxxxx],assignPublicIp=ENABLED}" \
    --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=frontend,containerPort=3000"
```

---

## 🎯 Alternative: AWS App Runner (Easiest!)

**Deploy Backend:**
```bash
aws apprunner create-service \
    --service-name aimarketpulse-backend \
    --source-configuration '{
      "ImageRepository": {
        "ImageIdentifier": "YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/aimarketpulse-backend:latest",
        "ImageRepositoryType": "ECR",
        "ImageConfiguration": {
          "Port": "8000",
          "RuntimeEnvironmentVariables": {
            "DATABASE_URL": "postgresql://...",
            "SECRET_KEY": "..."
          }
        }
      },
      "AutoDeploymentsEnabled": true
    }' \
    --instance-configuration '{
      "Cpu": "1 vCPU",
      "Memory": "2 GB"
    }'
```

---

## 💰 Cost Estimates

### Free Tier (First 12 months)
- **RDS**: 750 hours/month (db.t3.micro) - FREE
- **Fargate**: Limited free tier
- **ECR**: 500 MB storage/month - FREE
- **ALB**: ~$16/month (not free)

### After Free Tier (~$40-60/month)
- **RDS**: ~$15/month (db.t3.micro)
- **Fargate**: ~$25-35/month (2 tasks, 0.25 vCPU, 0.5 GB each)
- **ALB**: ~$16/month
- **ECR**: ~$1/month
- **Data Transfer**: ~$5/month
- **Total**: ~$60/month

---

## 📊 Deployment Flow

```
1. Push code to GitHub
   ↓
2. GitHub Actions triggered
   ↓
3. Build Docker images (in GitHub Actions runner)
   ↓
4. Push images to AWS ECR
   ↓
5. Update ECS services
   ↓
6. ECS pulls new images from ECR
   ↓
7. Deploy new containers
   ↓
8. Health checks pass
   ↓
9. Old containers terminated
   ↓
10. Deployment complete!
```

**You never need Docker Desktop locally - GitHub Actions does everything!**

---

## ✅ Summary

### What You Need:
- ✅ **Dockerfiles** (already have them in backend/ and frontend/)
- ✅ **GitHub Actions** (builds Docker images for you)
- ✅ **AWS ECR** (stores Docker images)
- ✅ **AWS ECS/Fargate** (runs containers)
- ✅ **AWS RDS** (database)
- ❌ **Docker Desktop locally** (NOT needed!)

### Key Points:
1. Docker images are built by GitHub Actions, not locally
2. Images are stored in AWS ECR
3. ECS Fargate runs the containers
4. No need for Docker Desktop on your machine
5. Push to GitHub → Automatic deployment

---

## � Quick Start

1. Create AWS account
2. Create RDS database
3. Create ECR repositories
4. Add GitHub secrets (AWS credentials)
5. Push code to GitHub
6. GitHub Actions builds and deploys automatically!

**That's it! No Docker Desktop needed on your machine.**
