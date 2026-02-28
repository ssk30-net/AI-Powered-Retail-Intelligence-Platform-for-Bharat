# Local Development with AWS RDS

This guide configures your **local machine** to connect to the **AWS RDS (PostgreSQL)** instance so you can run the backend (and frontend) locally and test against the same database used in production.

---

## Your RDS: “Internet access gateway: Disabled”

If under **Connectivity & security** you see **Internet access gateway: Disabled**, the instance is **not** reachable from the public internet. You must do **one** of the following before your PC can connect.

---

## Step 1: Make RDS reachable from your PC

Choose **one** of these.

### Option A: Make RDS publicly accessible (simplest if allowed)

1. In **AWS Console** go to **RDS → Databases**.
2. Select **database-1** (checkbox) → click **Modify**.
3. Under **Connectivity**, set **Publicly accessible** to **Yes**.
4. Click **Continue** → **Apply immediately** → **Modify DB instance**.
5. Wait until the instance status is **Available** again (a few minutes).
6. Then go to **Step 2** below to add your IP to the RDS security group.

If **Publicly accessible** is greyed out or not available, your DB subnet group may have only private subnets. Use **Option B** instead.

### Option B: Use a bastion (EC2) + port forward (when RDS stays private)

When RDS cannot be made public (or you prefer to keep it private), use an EC2 instance in the **same VPC** as RDS and forward port 5432 to your PC.

1. **Launch a small EC2** (e.g. Amazon Linux 2, t3.micro) in the **same VPC** as `database-1`, in a **public subnet** (so it has a public IP). Ensure the EC2 security group allows **SSH (22)** from **My IP**.
2. **RDS security group:** Allow **PostgreSQL (5432)** from the **EC2 security group** (so only the bastion can reach RDS).
3. **On your PC**, create an SSH tunnel (replace `ec2-user`, `<EC2-public-IP>`, and the RDS endpoint if different):
   ```bash
   ssh -i "your-key.pem" -L 5432:database-1.cjqose8cc9yh.eu-north-1.rds.amazonaws.com:5432 ec2-user@<EC2-public-IP>
   ```
   Keep this terminal open while you develop.
4. In **`backend/.env`** use **localhost** (the tunnel forwards to RDS):
   ```env
   DATABASE_URL=postgresql://postgres:ai-market-pulse@localhost:5432/aimarketpulse
   ```
5. Run your backend locally; it will connect to RDS through the tunnel.

---

## Step 2: Allow your IP (only for Option A)

If you made RDS **publicly accessible** (Option A), the RDS security group must allow your PC:

1. In **RDS → database-1**, note the **VPC security group** (e.g. `sg-xxxx`).
2. Go to **EC2 → Security Groups** and open that security group.
3. **Inbound rules → Edit inbound rules**.
4. **Add rule:** Type **PostgreSQL**, Port **5432**, Source **My IP** (or **0.0.0.0/0** for testing only).
5. **Save rules.**

(If you used Option B, skip this; only the bastion’s security group needs access to RDS.)

---

## Prerequisites

- Python 3.11+ with backend dependencies installed
- Node.js 18+ for frontend (optional)
- RDS endpoint: `database-1.cjqose8cc9yh.eu-north-1.rds.amazonaws.com` (eu-north-1)

---

## Step 3: Backend `.env` for local RDS

1. In the project root, go to the backend folder:
   ```bash
   cd backend
   ```

2. Copy the example env (if you don’t have a `.env` yet):
   ```bash
   copy .env.example .env
   ```
   (On macOS/Linux: `cp .env.example .env`)

3. Edit **`backend/.env`** and set at least:

   ```env
   # Database – RDS (replace with your RDS password if different)
   DATABASE_URL=postgresql://postgres:ai-market-pulse@database-1.cjqose8cc9yh.eu-north-1.rds.amazonaws.com:5432/aimarketpulse

   # CORS (for local frontend)
   CORS_ORIGINS=["http://localhost:3000","http://localhost:8000"]

   # JWT (use a strong key locally too)
   SECRET_KEY=your-secret-key-change-this-in-production-use-openssl-rand-hex-32
   ```

   Keep or add other variables from `.env.example` as needed (e.g. `API_V1_STR`, `PROJECT_NAME`).

---

## Step 4: Test RDS connection from your PC

From a terminal (PowerShell or CMD):

```bash
# If you have psql installed (e.g. from PostgreSQL installer or WSL)
psql -h database-1.cjqose8cc9yh.eu-north-1.rds.amazonaws.com -U postgres -d aimarketpulse -p 5432
# Password: ai-market-pulse
```

If that connects, RDS is reachable. Type `\q` to exit.

If you don’t have `psql`, skip to Step 5 and rely on the backend startup to confirm connectivity.

---

## Step 5: Create tables (first time only)

From the **backend** folder, with your virtualenv activated:

```bash
cd backend
venv\Scripts\activate    # Windows
# source venv/bin/activate   # macOS/Linux

python -m app.core.init_db
```

You should see: `Database tables created successfully!`

---

## Step 6: Run the backend locally

Still in **backend** with the same `.env`:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- Backend will use **RDS** via `DATABASE_URL`.
- API: **http://localhost:8000**
- Docs: **http://localhost:8000/docs**
- Health: **http://localhost:8000/health**

If you see “Application startup complete” and no DB errors, local RDS configuration is working.

---

## Step 7 (Optional): Run the frontend locally

In a **second** terminal, from the project root:

```bash
cd frontend
npm install
npm run dev
```

Create or edit **`frontend/.env.local`**:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

Then open **http://localhost:3000**. Login/register will hit your local backend, which uses RDS.

---

## Quick checklist

| Step | Action |
|------|--------|
| 1 | RDS **Publicly accessible** = Yes (or use bastion) |
| 2 | RDS security group allows **5432** from **My IP** (or 0.0.0.0/0 for test) |
| 3 | **backend/.env** has **DATABASE_URL** pointing to RDS |
| 4 | (Optional) Test with `psql` |
| 5 | Run **python -m app.core.init_db** once |
| 6 | Run **uvicorn app.main:app --reload --port 8000** |
| 7 | (Optional) Run frontend with **NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1** |

---

## Troubleshooting

- **Connection timeout / “could not connect”**  
  - RDS not public, or security group not allowing your IP on 5432. Re-check Step 1 and 2.

- **Password authentication failed**  
  - Username/password in `DATABASE_URL` must match RDS (user `postgres`, password from your RDS setup, e.g. `ai-market-pulse`).

- **SSL / certificate errors**  
  - Some RDS setups require SSL. You can try adding `?sslmode=require` to the URL:
    ```env
    DATABASE_URL=postgresql://postgres:ai-market-pulse@database-1.cjqose8cc9yh.eu-north-1.rds.amazonaws.com:5432/aimarketpulse?sslmode=require
    ```

- **Tables already exist**  
  - Safe to run `python -m app.core.init_db` again; it only creates missing tables.

---

## Security note

- Prefer **My IP** in the RDS security group instead of **0.0.0.0/0** for production-like testing.
- Do not commit **`.env`** (it should be in `.gitignore`). Only commit `.env.example` with placeholders.
