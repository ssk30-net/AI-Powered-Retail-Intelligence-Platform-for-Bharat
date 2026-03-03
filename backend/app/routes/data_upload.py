"""
Data ingestion API: upload CSV, XLSX, or JSON; validate, clean, and insert into price_history with user_id.
"""
import io
import json
import logging
from datetime import datetime, timezone
from uuid import UUID

import pandas as pd
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from sqlalchemy import text

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.commodity import Commodity
from app.models.price_history import PriceHistory
from app.models.region import Region
from app.schemas.response import ApiResponse

logger = logging.getLogger(__name__)
router = APIRouter()

ALLOWED_EXTENSIONS = {".csv", ".xlsx", ".xls", ".json"}
MAX_FILE_SIZE_MB = 50
BATCH_SIZE = 500

# Column name variants we accept (first match wins)
COMMODITY_KEYS = ["commodity", "commodity_name", "commodity_id", "product", "item"]
PRICE_KEYS = ["price", "modal_price", "min_price", "max_price", "value"]
DATE_KEYS = ["date", "recorded_at", "arrival_date", "timestamp", "record_date"]
REGION_KEYS = ["region", "region_name", "market", "district", "state"]
VOLUME_KEYS = ["volume", "quantity", "qty"]


def _normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Map accepted column names to canonical: commodity, price, date, region, volume."""
    out = pd.DataFrame()
    cols_lower = {c.lower().strip(): c for c in df.columns}

    def first_match(keys):
        for k in keys:
            if k in cols_lower:
                return cols_lower[k]
        return None

    commodity_col = first_match(COMMODITY_KEYS)
    price_col = first_match(PRICE_KEYS)
    date_col = first_match(DATE_KEYS)
    region_col = first_match(REGION_KEYS)
    volume_col = first_match(VOLUME_KEYS)

    if not price_col or not date_col:
        raise ValueError("Required columns not found. Need at least: price and date (or recorded_at, arrival_date, etc.).")
    if not commodity_col:
        raise ValueError("Commodity column not found. Use: commodity, commodity_name, product, or item.")

    out["commodity"] = df[commodity_col].astype(str).str.strip()
    out["price"] = pd.to_numeric(df[price_col], errors="coerce")
    out["date"] = pd.to_datetime(df[date_col], errors="coerce")
    out["region"] = df[region_col].astype(str).str.strip() if region_col else ""
    out["volume"] = pd.to_numeric(df[volume_col], errors="coerce") if volume_col else None
    return out


def _parse_json_content(content: bytes) -> pd.DataFrame:
    """Parse JSON array or object with 'data' key into a DataFrame."""
    raw = json.loads(content.decode("utf-8"))
    if isinstance(raw, list):
        return pd.DataFrame(raw)
    if isinstance(raw, dict) and "data" in raw:
        return pd.DataFrame(raw["data"])
    if isinstance(raw, dict):
        return pd.DataFrame([raw])
    raise ValueError("JSON must be an array of rows or an object with 'data' array.")


@router.post("/upload", response_model=ApiResponse)
async def upload_file(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db),
):
    """
    Upload CSV, XLSX, or JSON file. Data is validated, cleaned, and ingested into price_history
    with the current user's ID for partitioning.
    """
    user_id = UUID(current_user["user_id"])

    # Ensure price_history has user_id column (migrate if missing)
    try:
        db.execute(text("""
            DO $$ BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = 'price_history' AND column_name = 'user_id'
                ) THEN
                    ALTER TABLE price_history ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE SET NULL;
                    CREATE INDEX IF NOT EXISTS idx_price_history_user_id ON price_history(user_id);
                END IF;
            END $$
        """))
        db.commit()
    except Exception as e:
        logger.warning("Could not ensure price_history.user_id column: %s", e)
        db.rollback()

    filename = (file.filename or "").lower()
    ext = "." + filename.rsplit(".", 1)[-1] if "." in filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported format. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    content = await file.read()
    if len(content) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Max size: {MAX_FILE_SIZE_MB}MB",
        )

    try:
        if ext == ".json":
            df = _parse_json_content(content)
        elif ext == ".xlsx":
            df = pd.read_excel(io.BytesIO(content), engine="openpyxl")
        elif ext == ".xls":
            df = pd.read_excel(io.BytesIO(content), engine="xlrd")
        else:
            df = pd.read_csv(io.BytesIO(content))

        if df.empty:
            return ApiResponse(
                success=True,
                data={
                    "rows_accepted": 0,
                    "rows_rejected": 0,
                    "errors": ["File is empty or has no rows."],
                },
                message="No rows to process",
            )

        normalized = _normalize_columns(df)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {str(e)}")

    # Drop rows with missing required fields
    normalized = normalized.dropna(subset=["commodity", "price", "date"])
    normalized = normalized[normalized["price"] > 0]
    errors = []
    rows_accepted = 0
    rows_rejected = len(df) - len(normalized)
    if len(normalized) == 0:
        return ApiResponse(
            success=True,
            data={
                "rows_accepted": 0,
                "rows_rejected": rows_rejected,
                "errors": ["No valid rows after validation (need commodity, price > 0, valid date)."],
            },
            message="No valid rows",
        )

    # Default region (first available or create one)
    region_row = db.query(Region.id).first()
    if region_row is None:
        r = Region(name="Default", state="India", country="India")
        db.add(r)
        db.flush()
        default_region_id = r.id
    else:
        default_region_id = region_row[0] if isinstance(region_row, (list, tuple)) else region_row

    commodity_cache = {}
    region_cache = {}

    def get_or_create_commodity(name: str):
        name = (name or "").strip() or "Unknown"
        if name in commodity_cache:
            return commodity_cache[name]
        c = db.query(Commodity).filter(Commodity.name == name).first()
        if not c:
            c = Commodity(name=name, category="Uploaded", unit="quintal")
            db.add(c)
            db.flush()
        commodity_cache[name] = c.id
        return c.id

    def get_or_create_region(region_name) -> int:
        if region_name is None or (isinstance(region_name, float) and pd.isna(region_name)):
            return default_region_id
        key = str(region_name).strip() or "_default"
        if key == "_default":
            return default_region_id
        if key in region_cache:
            return region_cache[key]
        r = db.query(Region).filter(Region.name == key).first()
        if not r:
            r = Region(name=key, state="India", country="India")
            db.add(r)
            db.flush()
        region_cache[key] = r.id
        return r.id

    try:
        to_insert = []
        for _, row in normalized.iterrows():
            try:
                comm_id = get_or_create_commodity(str(row["commodity"]))
                region_id = get_or_create_region(row.get("region"))
                dt = row["date"]
                if hasattr(dt, "to_pydatetime"):
                    recorded_at = dt.to_pydatetime()
                elif hasattr(dt, "timestamp"):
                    recorded_at = datetime.fromtimestamp(dt.timestamp(), tz=timezone.utc)
                else:
                    recorded_at = datetime.fromisoformat(str(dt)) if isinstance(dt, str) else dt
                if getattr(recorded_at, "tzinfo", None) is None:
                    recorded_at = recorded_at.replace(tzinfo=timezone.utc)
                vol_val = row.get("volume")
                vol = None
                if vol_val is not None and not (isinstance(vol_val, float) and pd.isna(vol_val)):
                    try:
                        vol = float(vol_val)
                    except (TypeError, ValueError):
                        pass
                to_insert.append({
                    "commodity_id": int(comm_id),
                    "region_id": int(region_id),
                    "user_id": user_id,
                    "price": float(row["price"]),
                    "volume": vol,
                    "source": "user_upload",
                    "recorded_at": recorded_at,
                })
            except Exception as e:
                errors.append(str(e))
                rows_rejected += 1
                continue

        for i in range(0, len(to_insert), BATCH_SIZE):
            batch = to_insert[i : i + BATCH_SIZE]
            db.bulk_insert_mappings(PriceHistory, batch)
            rows_accepted += len(batch)
        db.commit()

        # Mark user as having completed data step (optional: only if we want is_first_login updated on upload)
        from app.models.user import User
        user = db.query(User).filter(User.id == user_id).first()
        if user and user.is_first_login:
            user.is_first_login = False
            db.commit()

    except Exception as e:
        db.rollback()
        logger.exception("Data upload ingestion failed")
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(e)}")

    return ApiResponse(
        success=True,
        data={
            "rows_accepted": rows_accepted,
            "rows_rejected": rows_rejected,
            "errors": errors[:20],
        },
        message=f"Ingested {rows_accepted} rows into price history.",
    )


@router.get("/upload-status/{upload_id}")
async def get_upload_status(
    upload_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Placeholder for async job status; sync upload returns immediately with result."""
    return ApiResponse(
        success=True,
        data={
            "upload_id": upload_id,
            "status": "completed",
            "rows_processed": 0,
            "progress": 100,
        },
    )
