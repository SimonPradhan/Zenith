from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.dashboard_preference import DashboardPreference
from app.models.user import User
from app.schemas.dashboard_preference import (
    DashboardPreferencesResponse,
    DashboardPreferencesUpdate,
)

router = APIRouter(
    prefix="/dashboard/preferences",
    tags=["Dashboard Preferences"],
)


@router.get("/", response_model=DashboardPreferencesResponse)
def get_dashboard_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    record = db.get(DashboardPreference, current_user.id)

    if record is None:
        return DashboardPreferencesResponse(preferences={})

    return DashboardPreferencesResponse(
        preferences=record.preferences,
    )


@router.put("/", response_model=DashboardPreferencesResponse)
def save_dashboard_preferences(
    data: DashboardPreferencesUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    record = db.get(DashboardPreference, current_user.id)

    if record is None:
        record = DashboardPreference(
            user_id=current_user.id,
            preferences=data.preferences,
        )
        db.add(record)
    else:
        record.preferences = data.preferences

    db.commit()
    db.refresh(record)

    return DashboardPreferencesResponse(
        preferences=record.preferences,
    )
