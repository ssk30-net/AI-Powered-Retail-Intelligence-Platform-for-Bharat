# Plan: Data Ingestion Layer + Risks & Alerts Pages

**Target:** Implement a data ingestion layer and make Risks & Alerts pages dynamic.

---

## Part 1: Data Ingestion Layer

### Goal
Let users (or systems) upload/push data into the platform so that **dashboards and models use ingested data** instead of only pre-seeded RDS data.

### 1.1 Scope

| Item | Description |
|------|-------------|
| **Inputs** | CSV, XLSX, JSON (commodity prices, optional: sentiment, forecasts) |
| **Storage** | Same RDS tables: `price_history`, optionally `forecasts`, `commodities` (upsert by name) |
| **Validation** | Schema check, date range, required columns (e.g. commodity_id/name, price, date) |
| **Idempotency** | Optional: dedupe by (commodity_id, region_id, date) to avoid duplicates on re-upload |

### 1.2 Backend Work

- **New/expand route:** e.g. `POST /api/v1/data/ingest` or use existing `data_upload` if present.
- **Request:** multipart file upload (CSV/XLSX/JSON) or JSON body for small payloads.
- **Steps:**
  1. Validate file type and parse (pandas for CSV/XLSX, json for JSON).
  2. Validate columns (e.g. `commodity` or `commodity_id`, `price`, `date`/`recorded_at`, optional `region`).
  3. Resolve commodity name → `commodities.id` (create commodity if missing and allowed).
  4. Resolve region if present → `regions.id`.
  5. Insert into `price_history` (and optionally `forecasts` if columns exist). Use transaction; rollback on error.
  6. Return summary: rows accepted, rows rejected, errors (e.g. invalid rows).
- **Optional:** Background job for large files (e.g. Celery/Redis or async task) so API returns quickly with a job ID; frontend polls for completion.

### 1.3 Frontend Work

- **Data ingestion page** (design already in `ai-market-pulse-design.md`):
  - Drag-and-drop or file picker for CSV, XLSX, JSON.
  - File validation indicator (format, column names).
  - Upload → call `POST /api/v1/data/ingest` (or upload endpoint).
  - Progress/loading state, then success summary (rows ingested) or error list.
  - Link/button to dashboard so user can “see my data” after upload.

### 1.4 Dashboards Using Ingested Data

- **Already in place:** Dashboard and forecast pages read from RDS (`price_history`, `forecasts`). Once ingestion writes to these tables, **the same dashboards automatically show ingested data**.
- **Optional:** Add a “data source” or “uploaded at” indicator so users know which data is from ingestion vs seed/synthetic.

### 1.5 Time Complexity / Performance (reference)

- **Ingestion:** O(n) in rows; use batch inserts (e.g. 500–1000 rows per INSERT) to keep DB round-trips low.
- **Dashboards:** No change to time complexity; existing queries (by date range, commodity) remain. Add indexes if you add new filters (e.g. `source = 'ingestion'`).

---

## Part 2: Risks & Alerts Pages (Dynamic)

### Goal
Replace static content with **backend-driven alerts and risk data**, and optional **user-defined rules**.

### 2.1 Data Model (align with DESIGN.md / DATABASE_SCHEMA.md)

- **`alerts` table** (if not exists):
  - `id`, `user_id` (nullable for system alerts), `commodity_id` (nullable), `alert_type` (e.g. `price_spike`, `demand_change`, `supply_disruption`, `forecast_breach`), `title`, `message`, `severity` (high/medium/low), `triggered_at`, `is_read`, `metadata` (JSONB, optional).
- **`alert_rules` table** (optional, for user-defined rules):
  - `id`, `user_id`, `name`, `commodity_id` (nullable), `condition` (e.g. price_change_pct > 5), `threshold`, `is_active`, `created_at`.

### 2.2 Backend Work

- **Alerts API**
  - `GET /api/v1/alerts` — list alerts (filter: status=unread/all, limit). Query DB; return `alerts` + `unread_count`.
  - `POST /api/v1/alerts/acknowledge` — body `{ "alert_id": 123 }` or `{ "alert_ids": [1,2,3] }`; set `is_read = true`.
  - `POST /api/v1/alerts/create` — (internal or admin) create alert; used by ingestion or batch jobs when they detect anomalies.
- **Alert generation**
  - From **dashboard/price logic:** e.g. when computing top_gainers/top_losers, if change % > threshold (e.g. 10%), insert into `alerts` (e.g. “Wheat price spike: +12%”).
  - From **data ingestion:** after ingest, run a simple check (e.g. new price vs last known price); if large change, create alert.
  - Optional: scheduled job (e.g. daily) that scans `price_history` / `forecasts` and creates alerts for threshold breaches.
- **Risks**
  - Option A: **Risks = subset of alerts** (e.g. severity=high or type=price_spike/supply_disruption). Same API; filter by type/severity for “Risks” view.
  - Option B: **Separate risks endpoint** — e.g. `GET /api/v1/risks` that returns computed risks (e.g. commodity-level volatility, forecast error, sentiment drop) from current data. Start with Option A to keep scope small.

### 2.3 Frontend Work

- **Alerts page** (`(dashboard)/alerts/page.tsx`):
  - Replace hardcoded `alerts` array with `GET /api/v1/alerts` (with auth).
  - Display real list; “Mark all as read” → `POST /api/v1/alerts/acknowledge` (all or by ids).
  - Use real `unread_count` for badge and for “Unread” stat.
- **Risks**
  - If same as high-severity alerts: add a “Risks” tab or section that filters `alerts` by severity/type.
  - If separate risks API: new section or page that calls `GET /api/v1/risks` and renders cards/list.

### 2.4 Design References

- **DESIGN.md:** `POST /api/v1/alerts/create`, WebSocket `alert` message type, CloudWatch + SNS for ops alerts.
- **DATABASE_SCHEMA.md:** `alerts` and `alert_rules` table definitions.
- **API_ENDPOINTS.md:** Alerts endpoints (GET alerts, acknowledge, create rule).

---

## Suggested Order for Tomorrow

1. **Morning**
   - Create/alter `alerts` table (migration or init script).
   - Implement `GET /api/v1/alerts` and `POST /api/v1/alerts/acknowledge` with real DB.
   - Wire **Alerts page** to these APIs (remove static list).
2. **Midday**
   - Add **alert creation** from existing logic (e.g. when dashboard computes big price moves, insert one alert per spike).
   - Optional: `POST /api/v1/alerts/create` for manual or internal use.
3. **Afternoon**
   - **Data ingestion:** implement `POST /api/v1/data/ingest` (CSV at minimum), validate and insert into `price_history`.
   - Add **Data ingestion UI** (upload component + success/error summary).
4. **Optional**
   - `alert_rules` table + one simple rule type (e.g. “alert when commodity X change > Y%”).
   - Risks page or Risks section (filter alerts by severity/type).

---

## Files to Touch (checklist)

| Area | Files |
|------|--------|
| Alerts API | `backend/app/routes/alerts.py` |
| Alerts DB | `backend/app/models/` (alert model if not present), migrations or `init_rds_database.py` |
| Alert creation | `backend/app/routes/dashboard.py` or a small `alerts_service` that dashboard/ingest call |
| Ingestion API | `backend/app/routes/data_upload.py` or new `backend/app/routes/ingest.py` |
| Alerts UI | `frontend/src/app/(dashboard)/alerts/page.tsx` |
| Ingestion UI | New page under `frontend/src/app/(dashboard)/ingest/page.tsx` or reuse existing upload page |
| Risks | New `frontend/src/app/(dashboard)/risks/page.tsx` or section in alerts page |

---

## Success Criteria

- **Ingestion:** User can upload a CSV with columns (e.g. commodity, price, date); rows appear in RDS and show up on dashboard/forecast charts.
- **Alerts:** Alerts page shows alerts from DB; unread count and “Mark all as read” work; at least one automated source creates alerts (e.g. price spike).
- **Risks:** Either a dedicated risks view (filtered alerts or risks API) or a clear “Risks” section on the alerts page.

You can use this as the runbook for tomorrow; adjust order and scope as needed.
