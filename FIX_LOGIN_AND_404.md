# Fix: Login (localhost:8000) + 404s on deployed app

You’re still seeing **POST localhost:8000** and **404** for `/forgot-password` and `/favicon.ico` because the **version of the app running on the ALB is old**. The server is still serving a previous build that:

- Calls `http://localhost:8000` for the API (so login fails)
- Doesn’t have the `/forgot-password` page
- Doesn’t serve a favicon

Follow these steps **in order** so the running app is updated.

---

## Step 1: Push your latest code

From your project root:

```bash
git add -A
git status
git commit -m "fix: frontend API URL, forgot-password page, favicon"
git push origin main
```

This triggers the **Deploy Frontend to ECS** workflow, which builds a new image with:

- `NEXT_PUBLIC_API_URL` = `http://aimarketpulse-alb-1476389455.eu-north-1.elb.amazonaws.com/api/v1`
- The new `/forgot-password` page
- `public/favicon.ico` (no more favicon 404)

---

## Step 2: Wait for the workflow to finish

1. On GitHub: **Actions** tab.
2. Open the latest **Deploy Frontend to ECS** run.
3. Wait until it’s **green** (all steps success).  
   That means the new image was built and pushed to ECR with the correct API URL.

---

## Step 3: Force ECS to use the new image

Pushing a new image to ECR does **not** restart your frontend. You must tell ECS to deploy the new image:

1. Open **AWS Console** → **ECS** → **Clusters**.
2. Open your cluster (e.g. `aimarketpulse-cluster`).
3. Open the **frontend** service (e.g. `frontend-service`).
4. Click **Update**.
5. Leave all settings as they are and click **Force new deployment** (or **Update service** and enable “Force new deployment”).
6. Confirm. ECS will roll out new tasks that pull the latest `:latest` image from ECR.

Wait until the service shows **Running** and the new tasks are **Healthy** (can take a few minutes).

---

## Step 4: Test without cache

Your browser or the ALB might cache the old JS:

1. Do a **hard refresh**: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac).  
   Or open the site in an **Incognito/Private** window.
2. Open: `http://aimarketpulse-alb-1476389455.eu-north-1.elb.amazonaws.com/login`
3. Try **Login** again.

You should see:

- No more **POST http://localhost:8000** in the console; requests should go to the ALB.
- **Forgot password?** opening `/forgot-password` without 404.
- No 404 for **favicon.ico** (or at least fewer requests if the browser still caches).

---

## If it still shows localhost:8000

- Confirm the **Deploy Frontend** workflow run that completed **after** your push used the step that passes `NEXT_PUBLIC_API_URL` (check the workflow file and the run log).
- Confirm you did **Step 3** (Force new deployment) on the **frontend** ECS service.
- Confirm you’re not hitting a cached page (different browser or incognito, or clear site data for the ALB URL).

---

## Summary

| What you see       | Cause                    | Fix                                              |
|--------------------|--------------------------|--------------------------------------------------|
| POST localhost:8000| Old frontend build       | Push code → wait for workflow → Force new deploy |
| /forgot-password 404 | Old build, no route   | Same as above                                    |
| favicon.ico 404    | No favicon in old build  | Same as above; favicon added in repo             |

The critical step is **Step 3: Force new deployment** on the frontend ECS service. Without it, the running app never updates to the new image.

---

## Other login-related issues (after the frontend calls the right URL)

Once the frontend is calling the ALB (and not localhost), login can still fail for these reasons:

### 1. CORS

The backend must allow the frontend origin. The backend’s `CORS_ORIGINS` now includes `http://aimarketpulse-alb-1476389455.eu-north-1.elb.amazonaws.com` by default. If your ALB URL is different, set in the **backend** task definition or `.env`:

- `CORS_ORIGINS=["http://your-alb-url.eu-north-1.elb.amazonaws.com"]`  
  or add your URL to the list.

Otherwise the browser may block the login response with a CORS error.

### 2. ALB routing for `/api`

The load balancer must send `/api` (or `/api/*`) to the **backend** target group. If `/api` goes to the frontend or nowhere, you get 404 or connection errors. Check the ALB listener rules and fix the path-based routing.

### 3. Backend not running or unhealthy

The backend ECS service must be running and its target group must have healthy targets. If the backend is down or unhealthy, login requests will fail (e.g. 502/503 or connection errors).

### 4. Backend environment variables

The backend container needs at least:

- **DATABASE_URL** – so it can look up users (e.g. RDS).
- **SECRET_KEY** – for signing JWTs (use a long random string in production).

Set these in the backend ECS task definition (or `.env` in the image). Wrong or missing values can cause 500 errors or “invalid token” after login.

### 5. No user in the database

Login only works if the user exists. Use **Register** first, or create a user in the database. If you only have the frontend and backend and never registered, there is no user to log in with.

### 6. Browser cache / “Not secure”

Use a hard refresh or an incognito window so you’re not using an old cached JS bundle. The “Not secure” warning is because the ALB is HTTP; it doesn’t block login, but for production you’d typically add HTTPS (e.g. ACM certificate and HTTPS listener).
