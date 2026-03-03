"""
Alerts API: list, acknowledge, and create alerts. Backend-driven alerts and risk data.
"""
from uuid import UUID
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.alert import Alert
from app.models.commodity import Commodity
from app.schemas.response import ApiResponse

router = APIRouter()


class AcknowledgeBody(BaseModel):
    alert_id: Optional[int] = None
    alert_ids: Optional[list[int]] = None


class CreateAlertBody(BaseModel):
    alert_type: str  # price_spike, demand_change, supply_disruption, forecast_breach
    severity: str  # high, medium, low
    title: str
    message: Optional[str] = None
    commodity_id: Optional[int] = None


@router.get("", response_model=ApiResponse)
async def get_alerts(
    status: str = Query("all", description="all | unread"),
    limit: int = Query(50, ge=1, le=200),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List alerts for the current user (or system alerts with user_id null). Returns alerts + unread_count."""
    user_id = UUID(current_user["user_id"])
    q = db.query(Alert).filter(
        or_(Alert.user_id == user_id, Alert.user_id.is_(None))
    ).order_by(desc(Alert.triggered_at))
    if status == "unread":
        q = q.filter(Alert.is_read == False)
    alerts_rows = q.limit(limit).all()

    unread_count = db.query(Alert).filter(
        or_(Alert.user_id == user_id, Alert.user_id.is_(None)),
        Alert.is_read == False,
    ).count()

    # Join commodity name for display
    commodity_ids = {a.commodity_id for a in alerts_rows if a.commodity_id}
    names = {}
    if commodity_ids:
        for c in db.query(Commodity.id, Commodity.name).filter(Commodity.id.in_(commodity_ids)):
            names[c.id] = c.name

    alerts_data = [
        {
            "id": a.id,
            "user_id": str(a.user_id) if a.user_id else None,
            "commodity_id": a.commodity_id,
            "commodity_name": names.get(a.commodity_id) if a.commodity_id else None,
            "alert_type": a.alert_type,
            "severity": a.severity,
            "title": a.title,
            "message": a.message,
            "is_read": a.is_read,
            "is_acknowledged": a.is_acknowledged,
            "triggered_at": a.triggered_at.isoformat() if a.triggered_at else None,
        }
        for a in alerts_rows
    ]
    return ApiResponse(
        success=True,
        data={"alerts": alerts_data, "unread_count": unread_count},
    )


@router.post("/acknowledge", response_model=ApiResponse)
async def acknowledge_alerts(
    body: AcknowledgeBody,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mark one or more alerts as read. Body: { alert_id: 123 } or { alert_ids: [1,2,3] }."""
    user_id = UUID(current_user["user_id"])
    ids = []
    if body.alert_id is not None:
        ids.append(body.alert_id)
    if body.alert_ids:
        ids.extend(body.alert_ids)
    if not ids:
        raise HTTPException(status_code=400, detail="Provide alert_id or alert_ids")
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    updated = (
        db.query(Alert)
        .filter(
            Alert.id.in_(ids),
            or_(Alert.user_id == user_id, Alert.user_id.is_(None)),
        )
        .update(
            {"is_read": True, "is_acknowledged": True, "acknowledged_at": now},
            synchronize_session="fetch",
        )
    )
    db.commit()
    return ApiResponse(success=True, data={"updated": updated}, message=f"Marked {updated} alert(s) as read")


@router.post("/create", response_model=ApiResponse)
async def create_alert(
    body: CreateAlertBody,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create an alert (e.g. from ingestion or dashboard logic). Stored for the current user."""
    user_id = UUID(current_user["user_id"])
    a = Alert(
        user_id=user_id,
        commodity_id=body.commodity_id,
        alert_type=body.alert_type,
        severity=body.severity,
        title=body.title,
        message=body.message or "",
    )
    db.add(a)
    db.commit()
    db.refresh(a)
    return ApiResponse(
        success=True,
        data={"id": a.id, "title": a.title, "severity": a.severity},
        message="Alert created",
    )
