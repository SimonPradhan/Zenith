from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class DashboardPreferencesUpdate(BaseModel):
    preferences: dict[str, Any] = Field(default_factory=dict)


class DashboardPreferencesResponse(BaseModel):
    preferences: dict[str, Any] = Field(default_factory=dict)
