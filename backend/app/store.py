from __future__ import annotations

import re

from sqlalchemy import func, select
from sqlalchemy.engine import Engine
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import selectinload, sessionmaker

from .auth import hash_password
from .database import (
    Base,
    CategoryRecord,
    StandardRecord,
    TopicRecord,
    TopicStandardRecord,
    UserRecord,
    create_database_engine,
)
from .models import (
    Category,
    DashboardStats,
    ReviewStatus,
    Standard,
    StandardId,
    StoredUser,
    Topic,
    TopicStandard,
    TopicStandards,
)


def slug(value: str) -> str:
    return re.sub(r"(^-|-$)", "", re.sub(r"[^a-z0-9]+", "-", value.lower().replace("&", "and")))


def normalize(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()


def build_catalog() -> tuple[list[Category], list[Standard], list[Topic]]:
    category_rows = [
        ("conductors", "Conductors & Cables", "Conductors", "Ampacity, correction, adjustment, and voltage drop.", "#0b7285", "cable"),
        ("protection", "Protection", "Protection", "Overload, short-circuit, and ground-fault protection.", "#c2410c", "shield"),
        ("grounding", "Grounding & Bonding", "Grounding", "Grounding, bonding, electrodes, and fault-current paths.", "#2f855a", "ground"),
        ("motors", "Motors", "Motors", "Motor current basis, conductors, protection, and control.", "#2563a8", "motor"),
        ("transformers", "Transformers", "Transformers", "Transformer protection and installation.", "#7c3aed", "transformer"),
        ("generators", "Generators", "Generators", "Generator protection, transfer, and grounding.", "#b7791f", "generator"),
        ("services", "Services", "Services", "Service conductors, equipment, and disconnects.", "#9f1239", "panel"),
        ("distribution", "Panels & Distribution", "Distribution", "Panels, switchgear, and working spaces.", "#475569", "panel"),
        ("industrial", "Industrial Installations", "Industrial", "Industrial equipment, controls, and drives.", "#be185d", "factory"),
        ("special", "Special Systems", "Special systems", "Special occupancies and focused PEC applications.", "#0369a1", "shield"),
    ]
    categories = [Category(id=id_, name=name, short_name=short, description=description, accent=accent, icon=icon) for id_, name, short, description, accent, icon in category_rows]
    standards = [
        Standard(id="pec", name="PEC", full_name="Philippine Electrical Code", edition="Supplied PEC Part 1 PDF - edition needs verification", description="Active building, plant, facility, and equipment installation module.", status="active"),
        Standard(id="pdc", name="PDC", full_name="Philippine Distribution Code", edition="Planned", description="Future distribution-system and distribution-interface module.", status="planned"),
        Standard(id="pgc", name="PGC", full_name="Philippine Grid Code", edition="Planned", description="Future transmission, grid, and grid-interface module.", status="planned"),
    ]
    specs = [
        ("motor-branch-circuit-conductors", "Motor Branch-Circuit Conductors", "motors", "PEC §§4.30.1.6 and 4.30.2.1-.2; §3.10.1.15", ["motor cable", "motor wire size", "4.30.2.2"]),
        ("motor-full-load-current", "Motor Full-Load Current / Current Basis", "motors", "PEC §4.30.1.6", ["motor amps", "motor FLC", "nameplate current"]),
        ("motor-overload-protection", "Motor Overload Protection", "motors", "PEC Article 4.30 Part III", ["overload relay", "motor heater"]),
        ("motor-short-circuit-and-ground-fault-protection", "Motor Short-Circuit and Ground-Fault Protection", "protection", "PEC Article 4.30 Part IV", ["motor breaker", "motor fuse", "MCP"]),
        ("conductor-ampacity", "Conductor Ampacity", "conductors", "PEC §3.10.1.15", ["cable ampacity", "wire size"]),
        ("temperature-correction-and-adjustment-factors", "Temperature Correction / Adjustment Factors", "conductors", "PEC §3.10.1.15(b)(2)", ["cable derating", "ambient correction", "grouping factor"]),
        ("voltage-drop", "Voltage Drop", "conductors", "PEC §3.10.1.15 FPN 1", ["volt drop", "long cable run"]),
        ("grounding-and-bonding-fundamentals", "Grounding and Bonding Fundamentals", "grounding", "PEC Article 2.50", ["earth conductor", "neutral ground"]),
        ("generator-neutral-grounding", "Generator Neutral Grounding / Separately Derived Systems", "generators", "NEEDS SOURCE", ["generator neutral", "four pole ATS", "separately derived"]),
        ("transformer-primary-and-secondary-protection", "Transformer Primary and Secondary Protection", "transformers", "PEC Article 4.50", ["transformer breaker", "primary fuse"]),
        ("working-clearances", "Working Clearances", "distribution", "PEC §1.10.2.1", ["panel clearance", "working space"]),
        ("services-and-service-equipment", "Services and Service Equipment", "services", "PEC Article 2.30", ["service entrance", "main disconnect"]),
    ]
    ids = [item[0] for item in specs]
    topics: list[Topic] = []
    for index, (topic_id, title, category_id, reference, synonyms) in enumerate(specs):
        pec = TopicStandard(standard_id=StandardId.PEC, edition="Supplied PEC Part 1 PDF - edition needs verification", reference=reference, summary=f"NEEDS VERIFICATION - {title} is part of the PEC-first curated backlog. Use the official source for design decisions.", requirements=[])
        related = [item for item in ids if item != topic_id][:3]
        topics.append(Topic(id=topic_id, title=title, category_id=category_id, description=f"PEC-first engineering guidance for {title.lower()}.", synonyms=synonyms, standards=TopicStandards(pec=pec), engineering_explanation="This API locator remains subordinate to the versioned structured PEC catalog used by the frontend.", engineering_notes=["Verify the supplied PEC and AHJ requirements."], common_mistakes=["Treating a source locator as a completed design check."], related_topic_ids=related, last_reviewed="2026-09-27", review_status=ReviewStatus.NEEDS_VERIFICATION, source_status="NEEDS VERIFICATION - PEC source curation in progress."))
    return categories, standards, topics


FEATURED_TOPIC_IDS = [
    "motor-branch-circuit-conductors",
    "motor-full-load-current",
    "motor-overload-protection",
    "motor-short-circuit-and-ground-fault-protection",
]


class DatabaseStore:
    def __init__(self, engine: Engine | None = None) -> None:
        self.engine = engine or create_database_engine()
        self._sessions = sessionmaker(self.engine, expire_on_commit=False)
        Base.metadata.create_all(self.engine)
        self._seed()

    def _seed(self) -> None:
        categories, standards, topics = build_catalog()
        with self._sessions.begin() as session:
            for position, category in enumerate(categories):
                if session.get(CategoryRecord, category.id) is None:
                    session.add(CategoryRecord(**category.model_dump(), position=position))
            for position, standard in enumerate(standards):
                if session.get(StandardRecord, standard.id.value) is None:
                    values = standard.model_dump(mode="json", exclude={"status"})
                    session.add(StandardRecord(**values, position=position))
            existing_topic_ids = set(session.scalars(select(TopicRecord.id)))
            for position, topic in enumerate(topics):
                if topic.id in existing_topic_ids:
                    continue
                topic_values = topic.model_dump(exclude={"standards"})
                topic_values["review_status"] = topic.review_status.value
                topic_record = TopicRecord(
                    **topic_values,
                    position=position,
                    featured_position=(
                        FEATURED_TOPIC_IDS.index(topic.id)
                        if topic.id in FEATURED_TOPIC_IDS
                        else None
                    ),
                )
                for standard in (topic.standards.pec, topic.standards.pdc, topic.standards.pgc):
                    if standard is not None:
                        topic_record.standards.append(
                            TopicStandardRecord(**standard.model_dump(mode="json"))
                        )
                session.add(topic_record)
            if session.get(UserRecord, "demo") is None:
                session.add(
                    UserRecord(
                        normalized_username="demo",
                        username="demo",
                        password_hash=hash_password("voltwise-demo"),
                    )
                )

    def categories(self) -> list[Category]:
        with self._sessions() as session:
            rows = session.scalars(select(CategoryRecord).order_by(CategoryRecord.position)).all()
            return [Category.model_validate(row, from_attributes=True) for row in rows]

    def standards(self) -> list[Standard]:
        with self._sessions() as session:
            rows = session.scalars(select(StandardRecord).order_by(StandardRecord.position)).all()
            return [Standard.model_validate({**{column: getattr(row, column) for column in ("id", "name", "full_name", "edition", "description")}, "status": "active" if row.id == "pec" else "planned"}) for row in rows if row.id in {"pec", "pdc", "pgc"}]

    def stats(self) -> DashboardStats:
        reviewed = [ReviewStatus.REVIEWED.value, ReviewStatus.VERIFIED.value]
        with self._sessions() as session:
            return DashboardStats(
                topic_count=session.scalar(select(func.count()).select_from(TopicRecord)) or 0,
                category_count=session.scalar(select(func.count()).select_from(CategoryRecord)) or 0,
                standard_count=session.scalar(select(func.count()).select_from(StandardRecord)) or 0,
                reviewed_count=session.scalar(
                    select(func.count()).select_from(TopicRecord).where(TopicRecord.review_status.in_(reviewed))
                ) or 0,
            )

    def featured_topics(self, limit: int = 4) -> list[Topic]:
        statement = (
            self._topic_query()
            .where(TopicRecord.featured_position.is_not(None))
            .order_by(TopicRecord.featured_position)
            .limit(limit)
        )
        return self._topics(statement)

    def recent_topics(self, limit: int = 5) -> list[Topic]:
        return self._topics(self._topic_query().order_by(TopicRecord.position.desc()).limit(limit))

    def topics_by_category(self, category_id: str) -> list[Topic]:
        return self._topics(
            self._topic_query().where(TopicRecord.category_id == category_id).order_by(TopicRecord.position)
        )

    def topics_by_standard(self, standard_id: StandardId) -> list[Topic]:
        statement = (
            self._topic_query()
            .join(TopicStandardRecord)
            .where(TopicStandardRecord.standard_id == standard_id.value)
            .order_by(TopicRecord.position)
        )
        return self._topics(statement)

    def topic(self, topic_id: str) -> Topic | None:
        results = self._topics(self._topic_query().where(TopicRecord.id == topic_id))
        return results[0] if results else None

    def related_topics(self, topic_id: str) -> list[Topic]:
        source = self.topic(topic_id)
        if source is None:
            return []
        resolved = {
            topic.id: topic
            for topic in self._topics(
                self._topic_query().where(TopicRecord.id.in_(source.related_topic_ids))
            )
        }
        return [resolved[id_] for id_ in source.related_topic_ids if id_ in resolved]

    def search_topics(
        self,
        query: str,
        category_id: str | None = None,
        standard_id: StandardId | None = None,
        limit: int | None = None,
    ) -> list[Topic]:
        terms = [term for term in normalize(query).split(" ") if term]
        matches: list[Topic] = []
        statement = self._topic_query().order_by(TopicRecord.position)
        if category_id:
            statement = statement.where(TopicRecord.category_id == category_id)
        if standard_id:
            statement = statement.join(TopicStandardRecord).where(
                TopicStandardRecord.standard_id == standard_id.value
            )
        for topic in self._topics(statement):
            if category_id and topic.category_id != category_id:
                continue
            if standard_id and getattr(topic.standards, standard_id.value) is None:
                continue
            standard_text = []
            for item in (topic.standards.pec, topic.standards.pdc, topic.standards.pgc):
                if item:
                    standard_text.extend([item.reference, item.summary])
            searchable = normalize(" ".join([topic.title, topic.description, *topic.synonyms, *standard_text]))
            if all(term in searchable for term in terms):
                matches.append(topic)
        if terms:
            def rank(topic: Topic) -> tuple[int, str]:
                score = sum(
                    (3 if term in normalize(topic.title) else 0)
                    + (2 if any(term in normalize(synonym) for synonym in topic.synonyms) else 0)
                    for term in terms
                )
                return (-score, topic.title)
            matches.sort(key=rank)
        if limit is not None:
            matches = matches[:limit]
        return matches

    @staticmethod
    def _topic_query():
        return select(TopicRecord).options(selectinload(TopicRecord.standards))

    def _topics(self, statement) -> list[Topic]:
        with self._sessions() as session:
            rows = session.scalars(statement).unique().all()
            return [self._to_topic(row) for row in rows]

    @staticmethod
    def _to_topic(row: TopicRecord) -> Topic:
        standards = {
            item.standard_id: TopicStandard.model_validate(item, from_attributes=True)
            for item in row.standards
        }
        values = {
            column: getattr(row, column)
            for column in (
                "id", "title", "category_id", "description", "synonyms",
                "engineering_explanation", "engineering_notes", "common_mistakes",
                "related_topic_ids", "last_reviewed", "review_status", "source_status",
            )
        }
        values["standards"] = TopicStandards(**standards)
        return Topic(**values)

    def add_user(self, username: str, password: str) -> StoredUser:
        key = username.casefold()
        row = UserRecord(
            normalized_username=key,
            username=username,
            password_hash=hash_password(password),
        )
        try:
            with self._sessions.begin() as session:
                session.add(row)
        except IntegrityError:
            raise ValueError("Username already exists") from None
        return StoredUser(username=row.username, password_hash=row.password_hash)

    def authenticate(self, username: str, password: str) -> StoredUser | None:
        from .auth import verify_password

        user = self.get_user(username)
        return user if user and verify_password(password, user.password_hash) else None

    def get_user(self, username: str) -> StoredUser | None:
        with self._sessions() as session:
            row = session.get(UserRecord, username.casefold())
            return StoredUser(username=row.username, password_hash=row.password_hash) if row else None


store = DatabaseStore()
