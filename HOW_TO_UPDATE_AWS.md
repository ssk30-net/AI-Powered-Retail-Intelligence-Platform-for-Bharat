# 🚀 How to Update Your AWS Deployment

**After making code changes, follow these steps to deploy the updates to AWS.**

---

## 📋 Prerequisites

Before updating, ensure you have:
- ✅ AWS CLI installed and configured
- ✅ Docker installed (for building images)
- ✅ AWS ECR repository created
- ✅ AWS ECS cluster and services running

---

## 🔄 Update Process Overview

```
Local Changes → Build Docker Image → Push to ECR → Update ECS Service → Deploy
```

---

## 📝 Step-by-Step Guide

### **Step 1: Make Your Code Changes**

You've already done this! We just added:
- ✅ Real sentiment analysis (NLP)
- ✅ AI Copilot with LLM support
- ✅ Insights & recommendations engine
- ✅ Updated requirements.txt

### **Step 2: Test Locally (Recommended)**

```bash
# Navigate to project
cd C:\Users\Admin\Desktop\AI_Retail\AI-Powered-Retail-Intelligence-Platform-for-Bharat

# Test backend locally
cd backend
python -m pip install -r requirements.txt
uvicorn app.main:app --reload

# In another terminal, test endpoints
curl http://localhost:8000/health
```

### **Step 3: Commit Changes to Git**

```bash
# From project root
git add .
git commit -m "feat: Add AI features - sentiment analysis, copilot, and insights"
git push origin main
```

### **Step 4: Build Docker Images**

#### **Option A: Build Locally (if you have Docker Desktop)**

```bash
# Backend image
cd backend
docker build -t ai-market-pulse-backend:latest .

# Frontend image (if changed)
cd ../frontend
docker build -t ai-market-pulse-frontend:latest .
```

#### **Option B: Use AWS CodeBuild (Recommended)**

Create a `buildspec.yml` in your project root:

```yaml
version: 0.2

phases:
  pre_build:
    commands:
      - echo Logging in to Amazon ECR...
      - aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
  build:
    commands:
      - echo Build started on `date`
      - docker build -t ai-market-pulse-backend:latest ./backend
      - docker tag ai-market-pulse-backend:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/ai-market-pulse-backend:latest
  post_build:
    commands:
      - docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/ai-market-pulse-backend:latest
```

### **Step 5: Push Images to AWS ECR**

```powershell
# Set your AWS details
$AWS_REGION = "eu-north-1"  # or your region
$AWS_ACCOUNT_ID = "YOUR_ACCOUNT_ID"
$ECR_BACKEND = "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/ai-market-pulse-backend"
$ECR_FRONTEND = "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/ai-market-pulse-frontend"

# Login to ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

# Tag and push backend
docker tag ai-market-pulse-backend:latest "$ECR_BACKEND:latest"
docker push "$ECR_BACKEND:latest"

# Tag and push frontend (if changed)
docker tag ai-market-pulse-frontend:latest "$ECR_FRONTEND:latest"
docker push "$ECR_FRONTEND:latest"
```

### **Step 6: Update ECS Service**

#### **Option A: Using AWS Console**

1. Go to AWS ECS Console
2. Select your cluster
3. Click on your backend service
4. Click "Update Service"
5. Check "Force new deployment"
6. Click "Update"
7. Wait 5-10 minutes for deployment

#### **Option B: Using AWS CLI (Faster)**

```powershell
# Update backend service
aws ecs update-service `
    --cluster ai-market-pulse-cluster `
    --service ai-market-pulse-backend-service `
    --force-new-deployment `
    --region $AWS_REGION

# Update frontend service (if changed)
aws ecs update-service `
    --cluster ai-market-pulse-cluster `
    --service ai-market-pulse-frontend-service `
    --force-new-deployment `
    --region $AWS_REGION
```

### **Step 7: Monitor Deployment**

```powershell
# Check service status
aws ecs describe-services `
    --cluster ai-market-pulse-cluster `
    --services ai-market-pulse-backend-service `
    --region $AWS_REGION

# View logs (if you have CloudWatch)
aws logs tail /ecs/ai-market-pulse-backend --follow --region $AWS_REGION
```

---

## ⚡ Quick Update Script

Save this as `deploy-to-aws.ps1`:

```powershell
# Configuration
$AWS_REGION = "eu-north-1"
$AWS_ACCOUNT_ID = "YOUR_ACCOUNT_ID"
$CLUSTER_NAME = "ai-market-pulse-cluster"
$BACKEND_SERVICE = "ai-market-pulse-backend-service"

Write-Host "🚀 Starting AWS Deployment..." -ForegroundColor Green

# Step 1: Commit changes
Write-Host "📝 Committing changes..." -ForegroundColor Yellow
git add .
git commit -m "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
git push origin main

# Step 2: Build Docker image
Write-Host "🔨 Building Docker image..." -ForegroundColor Yellow
cd backend
docker build -t ai-market-pulse-backend:latest .

# Step 3: Login to ECR
Write-Host "🔐 Logging into ECR..." -ForegroundColor Yellow
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

# Step 4: Tag and push
Write-Host "📤 Pushing to ECR..." -ForegroundColor Yellow
docker tag ai-market-pulse-backend:latest "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/ai-market-pulse-backend:latest"
docker push "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/ai-market-pulse-backend:latest"

# Step 5: Update ECS service
Write-Host "🔄 Updating ECS service..." -ForegroundColor Yellow
aws ecs update-service --cluster $CLUSTER_NAME --service $BACKEND_SERVICE --force-new-deployment --region $AWS_REGION

Write-Host "✅ Deployment initiated! Check AWS Console for status." -ForegroundColor Green
```

**Usage:**
```powershell
# Edit the script with your AWS details, then run:
.\deploy-to-aws.ps1
```

---

## 🔧 Environment Variables

Don't forget to add environment variables to your ECS task definition:

### **Required for AI Features**

```json
{
  "name": "OPENAI_API_KEY",
  "value": "sk-your-openai-key-here"
}
```

**To add via AWS Console:**
1. Go to ECS → Task Definitions
2. Create new revision of your task
3. Add environment variables
4. Update service to use new task definition

**To add via CLI:**
```powershell
# Update task definition with new environment variables
aws ecs register-task-definition --cli-input-json file://backend-task-def.json
```

---

## 🎯 What Changed in This Update

### **New Services Added:**
1. **Sentiment Analyzer** (`app/services/sentiment_analyzer.py`)
   - Fetches real news from Google News RSS
   - Uses VADER + TextBlob for sentiment analysis
   - Provides commodity-specific sentiment

2. **AI Copilot** (`app/services/ai_copilot.py`)
   - OpenAI GPT integration (if API key provided)
   - Rule-based fallback for intelligent responses
   - Conversation history tracking

3. **Insights Engine** (`app/services/insights_engine.py`)
   - Identifies market opportunities
   - Analyzes risks
   - Generates actionable recommendations

### **Updated Routes:**
- `/api/v1/sentiment/*` - Now returns real NLP analysis
- `/api/v1/copilot/chat` - Now uses AI (if configured)
- `/api/v1/insights/*` - Now provides real insights

---

## 🔍 Verification

After deployment, test the new endpoints:

```bash
# Get your backend URL from AWS
BACKEND_URL="https://your-backend-url.com"

# Test sentiment analysis
curl -X GET "$BACKEND_URL/api/v1/sentiment/overview" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test AI Copilot
curl -X POST "$BACKEND_URL/api/v1/copilot/chat" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the wheat price forecast?"}'

# Test insights
curl -X GET "$BACKEND_URL/api/v1/insights/overview" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ⚠️ Important Notes

### **New Dependencies:**
The updated `requirements.txt` includes:
- `openai` - For GPT integration
- `transformers`, `torch` - For ML models
- `nltk`, `textblob`, `vaderSentiment` - For NLP
- `feedparser`, `beautifulsoup4` - For news scraping
- `boto3` - For AWS services

**This will increase your Docker image size by ~1-2 GB.**

### **Cost Considerations:**
- OpenAI API calls cost $0.002 per 1K tokens (GPT-3.5)
- Use the rule-based fallback if you don't want to add OpenAI costs
- News scraping is free (Google News RSS)

### **Performance:**
- First request may be slow (model loading)
- Consider adding Redis caching for frequent queries
- Use ECS with at least 2GB memory for backend

---

## 🆘 Troubleshooting

### **Deployment fails:**
```bash
# Check service events
aws ecs describe-services --cluster your-cluster --services your-service

# Check task logs
aws logs tail /ecs/ai-market-pulse-backend --follow
```

### **Container won't start:**
- Check if new dependencies installed correctly
- Verify environment variables are set
- Check memory limits (increase to 2048 MB)

### **OpenAI not working:**
- Verify `OPENAI_API_KEY` is set in ECS
- Check if API key is valid
- System will fallback to rule-based if key missing

---

## 📚 Additional Resources

- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [CI/CD with GitHub Actions](https://docs.github.com/en/actions)

---

## 🎉 You're All Set!

Your AWS deployment now has **real AI features**:
- ✅ Sentiment analysis using NLP
- ✅ AI Copilot (OpenAI or rule-based)
- ✅ Market insights & recommendations

**Next time you make changes, just run the deployment script!**
