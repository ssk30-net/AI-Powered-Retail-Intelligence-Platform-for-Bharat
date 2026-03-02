#!/usr/bin/env pwsh
# AWS Deployment Script for AI Market Pulse
# This script automates the deployment process to AWS ECS

param(
    [string]$AWSRegion = "eu-north-1",
    [string]$AWSAccountId = "",
    [string]$ClusterName = "ai-market-pulse-cluster",
    [string]$BackendService = "ai-market-pulse-backend-service",
    [string]$FrontendService = "ai-market-pulse-frontend-service",
    [switch]$BackendOnly,
    [switch]$FrontendOnly,
    [switch]$SkipBuild,
    [switch]$SkipPush
)

# Colors for output
function Write-ColorOutput {
    param([string]$ForegroundColor, [string]$Message)
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    Write-Output $Message
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Step {
    param([string]$message)
    Write-Host "`n> $message" -ForegroundColor Yellow
}

function Write-Success {
    param([string]$message)
    Write-Host "[OK] $message" -ForegroundColor Green
}

function Write-ErrorMsg {
    param([string]$message)
    Write-Host "[ERROR] $message" -ForegroundColor Red
}

# Check if AWS Account ID is provided
if ([string]::IsNullOrEmpty($AWSAccountId)) {
    Write-ErrorMsg "AWS Account ID is required!"
    Write-Output "Usage: .\deploy-to-aws.ps1 -AWSAccountId YOUR_ACCOUNT_ID"
    exit 1
}

Write-Host @"

===============================================================
     AI Market Pulse - AWS Deployment Script
===============================================================

"@ -ForegroundColor Cyan

Write-Output "Region: $AWSRegion"
Write-Output "Account: $AWSAccountId"
Write-Output "Cluster: $ClusterName"
Write-Output ""

# Step 1: Git commit and push
Write-Step "Committing changes to Git..."
try {
    git add .
    $commitMessage = "Deploy: Updates on $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    git commit -m $commitMessage
    git push origin main
    Write-Success "Changes committed and pushed"
} catch {
    Write-Host "[WARNING] No changes to commit or push failed (continuing anyway)" -ForegroundColor Yellow
}

# Determine what to build
$buildBackend = !$FrontendOnly
$buildFrontend = !$BackendOnly

# Step 2: Build Docker images
if (!$SkipBuild) {
    if ($buildBackend) {
        Write-Step "Building backend Docker image..."
        Set-Location -Path "backend"
        docker build -t ai-market-pulse-backend:latest .
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Backend image built successfully"
        } else {
            Write-ErrorMsg "Backend build failed"
            exit 1
        }
        Set-Location -Path ".."
    }

    if ($buildFrontend) {
        Write-Step "Building frontend Docker image..."
        Set-Location -Path "frontend"
        docker build -t ai-market-pulse-frontend:latest .
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Frontend image built successfully"
        } else {
            Write-ErrorMsg "Frontend build failed"
            exit 1
        }
        Set-Location -Path ".."
    }
} else {
    Write-Host "[SKIP] Skipping build step" -ForegroundColor Yellow
}

# Step 3: Login to ECR
if (!$SkipPush) {
    Write-Step "Logging into AWS ECR..."
    $ecrLogin = aws ecr get-login-password --region $AWSRegion | docker login --username AWS --password-stdin "$AWSAccountId.dkr.ecr.$AWSRegion.amazonaws.com" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Logged into ECR successfully"
    } else {
        Write-ErrorMsg "ECR login failed"
        exit 1
    }

    # Step 4: Tag and push images
    if ($buildBackend) {
        Write-Step "Pushing backend image to ECR..."
        $backendRepo = "$AWSAccountId.dkr.ecr.$AWSRegion.amazonaws.com/ai-market-pulse-backend"
        docker tag ai-market-pulse-backend:latest "$backendRepo:latest"
        docker push "$backendRepo:latest"
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Backend image pushed to ECR"
        } else {
            Write-ErrorMsg "Backend push failed"
            exit 1
        }
    }

    if ($buildFrontend) {
        Write-Step "Pushing frontend image to ECR..."
        $frontendRepo = "$AWSAccountId.dkr.ecr.$AWSRegion.amazonaws.com/ai-market-pulse-frontend"
        docker tag ai-market-pulse-frontend:latest "$frontendRepo:latest"
        docker push "$frontendRepo:latest"
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Frontend image pushed to ECR"
        } else {
            Write-ErrorMsg "Frontend push failed"
            exit 1
        }
    }
} else {
    Write-Host "[SKIP] Skipping push step" -ForegroundColor Yellow
}

# Step 5: Update ECS services
if ($buildBackend) {
    Write-Step "Updating backend ECS service..."
    aws ecs update-service --cluster $ClusterName --service $BackendService --force-new-deployment --region $AWSRegion | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Backend service update initiated"
    } else {
        Write-ErrorMsg "Backend service update failed"
    }
}

if ($buildFrontend) {
    Write-Step "Updating frontend ECS service..."
    aws ecs update-service --cluster $ClusterName --service $FrontendService --force-new-deployment --region $AWSRegion | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Frontend service update initiated"
    } else {
        Write-ErrorMsg "Frontend service update failed"
    }
}

Write-Host @"

===============================================================
              Deployment Complete!
===============================================================

"@ -ForegroundColor Cyan

Write-Output "[OK] New images pushed to ECR"
Write-Output "[OK] ECS services updating (this takes 5-10 minutes)"
Write-Output ""
Write-Output "Monitor deployment status:"
Write-Output "  AWS Console: https://console.aws.amazon.com/ecs"
Write-Output "  Or run: aws ecs describe-services --cluster $ClusterName --services $BackendService --region $AWSRegion"
Write-Output ""
Write-Host "All done! Your changes will be live shortly." -ForegroundColor Green
