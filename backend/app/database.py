from __future__ import annotations

import os
from datetime import date
from pathlib import Path

from sqlalchemy import JSON, Date, ForeignKey, Integer, String, Text, create_engine
from sqlalchemy.engine import Engine, make_url
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.pool import StaticPool


DATABASE_URL_ENV = "DATABASE_URL"
DEFAULT_DATABASE_PATH = Path(__file__).resolve().parent.parent / "voltwise.db"
DEFAULT_DATABASE_URL = f"sqlite:///{DEFAULT_DATABASE_PATH.as_posix()}"


class Base(DeclarativeBase):
    pass


class CategoryRecord(Base):
    __tablename__ = "categories"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(128))
    short_name: Mapped[str] = mapped_column(String(64))
    description: Mapped[str] = mapped_column(Text)
    accent: Mapped[str] = mapped_column(String(32))
    icon: Mapped[str] = mapped_column(String(64))
    position: Mapped[int] = mapped_column(Integer, index=True)


class StandardRecord(Base):
    __tablename__ = "standards"

    id: Mapped[str] = mapped_column(String(16), primary_key=True)
    name: Mapped[str] = mapped_column(String(64))
    full_name: Mapped[str] = mapped_column(String(256))
    edition: Mapped[str] = mapped_column(String(128))
    description: Mapped[str] = mapped_column(Text)
    position: Mapped[int] = mapped_column(Integer, index=True)


class TopicRecord(Base):
    __tablename__ = "topics"

    id: Mapped[str] = mapped_column(String(128), primary_key=True)
    title: Mapped[str] = mapped_column(String(256), index=True)
    category_id: Mapped[str] = mapped_column(ForeignKey("categories.id"), index=True)
    description: Mapped[str] = mapped_column(Text)
    synonyms: Mapped[list[str]] = mapped_column(JSON)
    engineering_explanation: Mapped[str] = mapped_column(Text)
    engineering_notes: Mapped[list[str]] = mapped_column(JSON)
    common_mistakes: Mapped[list[str]] = mapped_column(JSON)
    related_topic_ids: Mapped[list[str]] = mapped_column(JSON)
    last_reviewed: Mapped[date] = mapped_column(Date)
    review_status: Mapped[str] = mapped_column(String(32), index=True)
    source_status: Mapped[str] = mapped_column(String(256))
    position: Mapped[int] = mapped_column(Integer, index=True)
    featured_position: Mapped[int | None] = mapped_column(
        Integer, nullable=True, index=True
    )

    standards: Mapped[list[TopicStandardRecord]] = relationship(
        back_populates="topic", cascade="all, delete-orphan", lazy="selectin"
    )


class TopicStandardRecord(Base):
    __tablename__ = "topic_standards"

    topic_id: Mapped[str] = mapped_column(
        ForeignKey("topics.id", ondelete="CASCADE"), primary_key=True
    )
    standard_id: Mapped[str] = mapped_column(
        ForeignKey("standards.id"), primary_key=True
    )
    edition: Mapped[str] = mapped_column(String(128))
    reference: Mapped[str] = mapped_column(String(256))
    summary: Mapped[str] = mapped_column(Text)
    requirements: Mapped[list[str]] = mapped_column(JSON)
    terminology: Mapped[str | None] = mapped_column(Text, nullable=True)

    topic: Mapped[TopicRecord] = relationship(back_populates="standards")


class UserRecord(Base):
    __tablename__ = "users"

    normalized_username: Mapped[str] = mapped_column(String(64), primary_key=True)
    username: Mapped[str] = mapped_column(String(64), unique=True)
    password_hash: Mapped[str] = mapped_column(String(256))


def database_url() -> str:
    return os.getenv(DATABASE_URL_ENV, DEFAULT_DATABASE_URL)


def create_database_engine(url: str | None = None) -> Engine:
    selected_url = url or database_url()
    parsed_url = make_url(selected_url)
    options: dict[str, object] = {"pool_pre_ping": True}
    if parsed_url.get_backend_name() == "sqlite":
        options["connect_args"] = {"check_same_thread": False}
        if parsed_url.database in (None, "", ":memory:"):
            options["poolclass"] = StaticPool
    return create_engine(selected_url, **options)

