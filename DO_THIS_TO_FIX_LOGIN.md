# Fix the 3 errors (localhost, forgot-password 404, favicon 404)

---

## "CORS policy ... not a secure context ... more-private address space loopback" (deployed site)

If you open the **deployed** site (`http://aimarketpulse-alb-.../login`) and the console shows:

- **Access to XMLHttpRequest at 'http://localhost:8000/api/v1/auth/login' from origin 'http://aimarketpulse-alb-...' has been blocked by CORS policy: The request client is not a secure context and the resource is in more-private address space `loopback`.**
- **net::ERR_FAILED** on that request

**What it means:** The app running on the ALB is still the **old build** that calls **localhost:8000**. The browser blocks this: a public site (ALB) cannot call a private address (your PC’s localhost). So login from the deployed site will never work until the deployed app calls the **ALB** API, not localhost.

**Fix:** Deploy the **new** frontend image (built with API URL = your ALB) and make ECS use it. Follow **"Deployed app (ALB) still shows the 3 errors"** below: push code → wait for workflow → **Force new deployment** on the frontend ECS service. After that, the deployed app will call the ALB for login and this error will stop.

---

## Running **locally** (localhost:3000) and login goes to ALB or fails

If you open **http://localhost:3000/login** and login tries to call the ALB or fails:

1. **Backend must be running** on `http://localhost:8000`. In the **backend** folder run `RUN_BACKEND.bat` (or `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`). You should see "Uvicorn running on http://0.0.0.0:8000". If you get **POST localhost:8000 ... ERR_CONNECTION_REFUSED**, the backend is not running or crashed – start it and keep that terminal open.
2. **Frontend must use the local API** – Use `frontend/.env.development` (or `.env.local`) with `NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1`. Restart the frontend dev server after changing env: Ctrl+C, then `npm run dev` again.
3. **Clear Next.js cache once** (if it still used the wrong URL): in the `frontend` folder delete the `.next` folder, then `npm run dev` again.
4. **Hydration warning** – If you see "hydration mismatch" on `<body>` with `data-gr-ext-installed`, it's usually the **Grammarly** extension. Disable Grammarly for localhost or use an incognito window. The root layout now uses `suppressHydrationWarning` on `<html>` and `<body>` to avoid the warning when extensions modify the page.

Use **http://localhost:3000** for local testing, not the ALB URL.

---

## Deployed app (ALB) still shows the 3 errors

You still see these because **the app running on your ALB is an old build**. The fixes are already in your code; the server must be updated to use the new build.

Do these steps **in this order**.

---

## Step 1: Push your code to GitHub

In PowerShell (project root):

```powershell
cd "d:\AI-Powered-Retail-Intelligence-Platform-for-Bharat"
git add -A
git status
git commit -m "fix: API URL, forgot-password, favicon for deployed app"
git push origin main
```

This starts the **Deploy Frontend to ECS** workflow. The new build will have:
- API URL = your ALB (no more localhost:8000)
- `/forgot-password` page
- `/favicon.ico`

---

## Step 2: Wait for the workflow to finish

1. Open GitHub → your repo → **Actions**.
2. Click the latest **Deploy Frontend to ECS** run.
3. Wait until all steps are green (especially "Build Docker image" and "Tag and push image to ECR").

---

## Step 3: Force ECS to use the new image (required)

Pushing to ECR does **not** restart your app. You must tell ECS to deploy the new image.

1. Open **AWS Console** → **ECS** → **Clusters**.
2. Open your cluster (e.g. `aimarketpulse-cluster`).
3. Click the **frontend** service (e.g. `frontend-service`).
4. Click **Update** (top right).
5. Scroll down and check **Force new deployment**.
6. Click **Update**.

Wait a few minutes until the service shows **Running** and new tasks are **Healthy**. Old tasks will be replaced by new ones that use the new image.

---

## Step 4: Test without cache

1. Close all tabs with your ALB URL.
2. Open a **new Incognito/Private** window (or hard refresh: **Ctrl+Shift+R**).
3. Go to: `http://aimarketpulse-alb-1476389455.eu-north-1.elb.amazonaws.com/login`
4. Try **Login** again.

You should see:
- No more `POST http://localhost:8000` in the console.
- **Forgot password?** opens without 404.
- No favicon 404 (or it loads).

---

## If you still see the same errors

- **Step 3 not done** → The running app is still the old image. Do Step 3 and wait for the new tasks.
- **Old JS in browser** → Use Incognito or clear site data for the ALB URL, then reload.
- **Wrong service updated** → Make sure you updated the **frontend** ECS service, not the backend.

---

## Summary

| What you see              | Reason              | Fix                          |
|---------------------------|---------------------|------------------------------|
| POST localhost:8000       | Old frontend build  | Step 1 → 2 → **3** → 4       |
| /forgot-password 404      | Old build           | Same                         |
| favicon.ico 404           | Old build           | Same                         |

**Step 3 (Force new deployment)** is what actually updates the running app. Do not skip it.
