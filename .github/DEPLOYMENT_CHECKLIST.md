# GitHub Actions Deployment — New AWS Account Checklist

Use this checklist when deploying with a **new AWS account**. The workflows use **GitHub Secrets** (not your local `.env` files).

---

## 1. Required GitHub Secrets

In your repo: **Settings → Secrets and variables → Actions** → **New repository secret**.

| Secret name | Description | Example |
|-------------|-------------|--------|
| `AWS_ACCESS_KEY_ID` | IAM user access key for the new account | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key | (from IAM console) |
| `AWS_ACCOUNT_ID` | 12-digit AWS account ID | `123456789012` |

**How to get AWS_ACCOUNT_ID:**  
AWS Console → top-right account menu → **Account ID**, or run:
```bash
aws sts get-caller-identity --query Account --output text
```

---

## 2. AWS Account Setup (one-time per account)

### 2.1 IAM user for GitHub Actions

- Create an IAM user (e.g. `github-actions-deploy`) with programmatic access.
- Attach a policy that allows at least:
  - **ECR**: `GetAuthorizationToken`, `BatchCheckLayerAvailability`, `GetDownloadUrlForLayer`, `BatchGetImage`, `PutImage`, `InitiateLayerUpload`, `UploadLayerPart`, `CompleteLayerUpload`
  - (If you use ECS task updates later: ECS `UpdateService`, etc.)

Or use **AWS managed policy**: `AmazonEC2ContainerRegistryPowerUser` for ECR push.

### 2.2 ECR repositories

Create in the **same region** as in the workflow (default: `eu-north-1`):

```bash
aws ecr create-repository --repository-name aimarketpulse-frontend --region eu-north-1
aws ecr create-repository --repository-name aimarketpulse-backend --region eu-north-1
```

### 2.3 Region

Workflows use **`eu-north-1`** by default. To use another region (e.g. `ap-south-1`):

- Edit in both workflow files the line: `AWS_REGION: eu-north-1` → your region.
- Create ECR repos and any ECS/RDS resources in that region.

---

## 3. What the workflows do

- **Deploy Frontend** (`.github/workflows/deploy.yml`): builds `frontend/Dockerfile`, tags as `latest`, pushes to `aimarketpulse-frontend` in ECR.
- **Deploy Backend** (`.github/workflows/deploy-backend.yml`): builds `backend/Dockerfile`, tags with git SHA, pushes to `aimarketpulse-backend` in ECR.

Both run on **push to `main`**. They only **build and push images**; they do not create or update ECS services. To run the containers you still need ECS (or EKS/App Runner) set up in the same AWS account and region.

---

## 4. Deploy steps

1. Add the three secrets above in GitHub.
2. Ensure ECR repos exist in your chosen region.
3. Push to `main` (or merge a PR into `main`).
4. Check **Actions** tab for "Deploy Frontend to ECS" and "Deploy Backend" runs.
5. If either fails, open the run and read the log (often missing secret or wrong `AWS_ACCOUNT_ID` / region).

---

## 5. Common issues

| Issue | Fix |
|-------|-----|
| **Credentials could not be loaded / Could not load credentials from any providers** | Add these **repository secrets** in GitHub (not in `.env`): `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ACCOUNT_ID`. Go to **Repo → Settings → Secrets and variables → Actions → New repository secret**. Use the exact names (case-sensitive). |
| `AWS_ACCOUNT_ID` not set | Add repository secret `AWS_ACCOUNT_ID` (12 digits). |
| `no basic auth credentials` | Check `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`; ensure IAM user has ECR permissions. |
| `RepositoryNotFoundException` | Create ECR repos in the same region as the workflow (`eu-north-1` unless you changed it). |
| Wrong region | Change `AWS_REGION` in both workflow files and create ECR (and ECS) in that region. |

---

**Workflows updated:** No hardcoded account ID; builds use `frontend/Dockerfile` and `backend/Dockerfile` with correct build context.
