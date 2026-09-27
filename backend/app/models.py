from __future__ import annotations

from datetime import date
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


def to_camel(value: str) -> str:
    first, *rest = value.split("_")
    return first + "".join(part.capitalize() for part in rest)


class ApiModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        extra="forbid",
    )


class StandardId(str, Enum):
    PEC = "pec"
    PDC = "pdc"
    PGC = "pgc"


class ReviewStatus(str, Enum):
    DRAFT = "Draft"
    REVIEWED = "Reviewed"
    VERIFIED = "Verified"
    NEEDS_UPDATE = "Needs update"
    NEEDS_VERIFICATION = "Needs verification"


class Category(ApiModel):
    id: str
    name: str
    short_name: str
    description: str
    accent: str
    icon: str


class Standard(ApiModel):
    id: StandardId
    name: str
    full_name: str
    edition: str
    description: str
    status: str = "active"


class TopicStandard(ApiModel):
    standard_id: StandardId
    edition: str
    reference: str
    summary: str
    requirements: list[str]
    terminology: str | None = None


class TopicStandards(ApiModel):
    pec: TopicStandard | None = None
    pdc: TopicStandard | None = None
    pgc: TopicStandard | None = None


class Topic(ApiModel):
    id: str
    title: str
    category_id: str
    description: str
    synonyms: list[str]
    standards: TopicStandards
    engineering_explanation: str
    engineering_notes: list[str]
    common_mistakes: list[str]
    related_topic_ids: list[str]
    last_reviewed: date
    review_status: ReviewStatus
    source_status: str


class DashboardStats(ApiModel):
    topic_count: int = Field(ge=0)
    category_count: int = Field(ge=0)
    standard_count: int = Field(ge=0)
    reviewed_count: int = Field(ge=0)


class RegisterRequest(ApiModel):
    username: str = Field(min_length=3, max_length=64, pattern=r"^[A-Za-z0-9_.-]+$")
    password: str = Field(min_length=8, max_length=256)


class TokenRequest(ApiModel):
    username: str
    password: str


class TokenResponse(ApiModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class UserPublic(ApiModel):
    username: str


class StoredUser(BaseModel):
    username: str
    password_hash: str

