# Finding Commodities With Price History and Forecasts

Ways to see **which commodities have data** in `price_history` and `forecasts` in your RDS database.

---

## Seed forecasts so the UI shows correct data

If the **Forecasts** page shows only “Actual (RDS)” and “No model forecast in RDS yet”, the `forecasts` table is empty. You can fill it from existing `price_history` so the chart and cards show forecast data:

1. From the project root, go to the backend and run the seed script (uses `DATABASE_URL` from `.env`):

   ```bash
   cd backend
   python seed_forecasts.py
   ```

   The script:
   - Finds every commodity that has at least one `price_history` row
   - For each, inserts 30 days of **forecast** rows (predicted_price, lower_bound, upper_bound, confidence, explanation) based on the latest price
   - Skips commodities that already have future forecasts

2. Refresh the Forecasts page in the browser. You should see the **Forecast (model)** line and the **Next period** / **End of horizon** values.

To re-seed (e.g. after adding new commodities with price history), you can delete existing forecast rows for future dates and run `python seed_forecasts.py` again, or change the script to overwrite.

---

## 1. API endpoint (no SQL)

Call this from the app or with `curl` (with a valid auth token):

```bash
# Replace YOUR_TOKEN with a real JWT from login
curl -s -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8000/api/v1/forecasts/data-availability"
```

**Response shape:**

```json
{
  "success": true,
  "data": {
    "with_price_history": [
      { "commodity_id": 1, "name": "Wheat", "price_history_count": 42 }
    ],
    "with_forecasts": [
      { "commodity_id": 1, "name": "Wheat", "forecast_count": 30 }
    ]
  }
}
```

- **`with_price_history`**: commodities that have at least one row in `price_history`, with row count.
- **`with_forecasts`**: commodities that have at least one row in `forecasts`, with row count.

---

## 2. SQL in RDS (psql or any client)

Connect to your database, then run the following.

### Commodities that have **price_history**

```sql
SELECT c.id AS commodity_id,
       c.name AS commodity_name,
       COUNT(ph.id) AS price_history_count
FROM commodities c
JOIN price_history ph ON ph.commodity_id = c.id
GROUP BY c.id, c.name
ORDER BY c.name;
```

### Commodities that have **forecasts**

```sql
SELECT c.id AS commodity_id,
       c.name AS commodity_name,
       COUNT(f.id) AS forecast_count
FROM commodities c
JOIN forecasts f ON f.commodity_id = c.id
GROUP BY c.id, c.name
ORDER BY c.name;
```

### One result set: both counts per commodity

```sql
SELECT c.id AS commodity_id,
       c.name AS commodity_name,
       COUNT(DISTINCT ph.id) AS price_history_count,
       COUNT(DISTINCT f.id)  AS forecast_count
FROM commodities c
LEFT JOIN price_history ph ON ph.commodity_id = c.id
LEFT JOIN forecasts f ON f.commodity_id = c.id
GROUP BY c.id, c.name
ORDER BY c.name;
```

- `price_history_count` or `forecast_count` &gt; 0 means that commodity has data in that table.

### Connect with psql (RDS)

```bash
psql -h database-1.cjqose8cc9yh.eu-north-1.rds.amazonaws.com \
     -U postgres -d aimarketpulse -p 5432
# Enter password when prompted, then run the SQL above.
```

---

## 3. Quick check: row counts per table

```sql
SELECT 'price_history' AS table_name, COUNT(*) AS rows FROM price_history
UNION ALL
SELECT 'forecasts', COUNT(*) FROM forecasts
UNION ALL
SELECT 'commodities', COUNT(*) FROM commodities;
```

This only shows total rows; use the queries in section 2 to see **which** commodities have data.
