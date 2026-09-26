from __future__ import annotations

import re
from copy import deepcopy

from .auth import hash_password
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


CATEGORY_DATA = [
    ("conductors", "Conductors & Cables", "Conductors", "Ampacity, sizing, derating, and voltage drop.", "#0b7285", "cable"),
    ("protection", "Overcurrent Protection", "Protection", "Breakers, fuses, fault protection, and coordination.", "#c2410c", "shield"),
    ("grounding", "Grounding & Bonding", "Grounding", "Earthing systems, bonding, and protective conductors.", "#2f855a", "ground"),
    ("motors", "Motors & Drives", "Motors", "Motor circuits, protection, controls, and drives.", "#2563a8", "motor"),
    ("transformers", "Transformers", "Transformers", "Protection, conductors, grounding, and installation.", "#7c3aed", "transformer"),
    ("generators", "Generators & Standby", "Generators", "Generator systems, transfer equipment, and emergency power.", "#b7791f", "generator"),
    ("distribution", "Panels & Distribution", "Distribution", "Panels, switchgear, bus systems, and clearances.", "#475569", "panel"),
    ("industrial", "Industrial Systems", "Industrial", "Controls, PLCs, VFDs, isolation, and safety circuits.", "#be185d", "factory"),
]

TOPIC_NAMES = {
    "conductors": ["Conductor Ampacity", "Cable Sizing Principles", "Ambient-Temperature Correction", "Cable Grouping and Derating", "Parallel Conductors", "Neutral Conductor Sizing", "Protective Conductor Sizing", "Voltage-Drop Guidance", "Copper vs Aluminum Conductors"],
    "protection": ["Circuit Breakers", "Fuses", "Overload Protection", "Short-Circuit Protection", "Ground-Fault Protection", "Interrupting Capacity", "Protective-Device Coordination"],
    "grounding": ["Grounding Terminology", "Equipment Grounding Conductors", "Protective Earth Conductors", "Grounding Electrode Systems", "Bonding", "Neutral-to-Ground Connections", "Separately Derived Systems", "Generator Grounding", "IEC TN, TT, and IT Earthing Arrangements"],
    "motors": ["Motor Full-Load Current", "Motor Branch-Circuit Conductors", "Motor Overload Protection", "Motor Short-Circuit Protection", "Motor Disconnecting Means", "Motor Controllers", "Multiple-Motor Feeders", "VFD-Fed Motors", "Soft-Starter Installations", "Motor Control Centers"],
    "transformers": ["Transformer Rated Current", "Transformer Primary Protection", "Transformer Secondary Protection", "Transformer Conductors", "Transformer Grounding", "Dry-Type Transformer Installation"],
    "generators": ["Generator Conductor Sizing", "Generator Overcurrent Protection", "Generator Neutral Grounding", "Transfer Switches", "Separately Derived Generator Systems", "Emergency Systems", "Standby Systems"],
    "distribution": ["Panelboards", "Switchboards", "Switchgear", "Motor Control Centers in Distribution", "Busbar and Bus Ratings", "Working Clearances", "Equipment SCCR and Interrupting Ratings"],
    "industrial": ["Industrial Control Panels", "PLC and Control Panels", "Control Transformers", "Control Wiring", "24 VDC Control Systems", "VFD Installation", "Isolation and Disconnects", "Emergency-Stop Electrical Considerations"],
}

REFERENCES = {
    "conductors": {"nec": "Articles 210, 215 & 310", "iec": "IEC 60364-5-52", "pec": "PEC Part 1, Chapters 2 & 3"},
    "protection": {"nec": "Articles 110 & 240", "iec": "IEC 60364-4-43 / IEC 60947", "pec": "PEC Part 1, Article 2.40"},
    "grounding": {"nec": "Article 250", "iec": "IEC 60364-4-41 / 5-54", "pec": "PEC Part 1, Article 2.50"},
    "motors": {"nec": "Article 430", "iec": "IEC 60364 / IEC 60947-4-1", "pec": "PEC Part 1, Article 4.30"},
    "transformers": {"nec": "Article 450", "iec": "IEC 60076 / IEC 60364", "pec": "PEC Part 1, Article 4.50"},
    "generators": {"nec": "Articles 445, 700 & 702", "iec": "IEC 60364-5-55 / 6", "pec": "PEC Part 1, Articles 4.45 & 7"},
    "distribution": {"nec": "Articles 110, 408 & 409", "iec": "IEC 61439 / IEC 60947", "pec": "PEC Part 1, Articles 1.10 & 4.08"},
    "industrial": {"nec": "Articles 409, 430 & 670", "iec": "IEC 60204-1 / IEC 61439", "pec": "PEC Part 1, Articles 4.09 & 6.70"},
}

OVERRIDES = {
    "motor-full-load-current": {
        "description": "The current value used as the starting point for motor circuit conductor and protection decisions.",
        "synonyms": ["motor amps", "motor FLC", "motor current table", "nameplate current"],
        "engineering_explanation": "Code-table current and nameplate current serve different purposes. Branch conductors and short-circuit protection commonly begin with tabulated current, while overload protection is closely tied to the motor nameplate and service factor.",
        "engineering_notes": ["Record voltage, phase, frequency, duty, and service factor before selecting a basis.", "A VFD input circuit is evaluated differently from the motor output circuit."],
        "common_mistakes": ["Using nameplate current for every motor-circuit calculation.", "Ignoring the distinction between full-load current and full-load amperes."],
    },
    "motor-overload-protection": {
        "description": "Protection against sustained overcurrent and overheating during motor operation.",
        "synonyms": ["motor heater", "overload relay", "motor OL", "thermal overload"],
        "engineering_explanation": "Overload devices protect the motor from thermal damage. They are not intended to interrupt high-level short circuits, so the branch circuit normally also needs a fuse or circuit breaker selected under separate rules.",
        "engineering_notes": ["Coordinate settings with motor service factor, temperature rise, and starting profile.", "Electronic overload relays can add phase-loss and imbalance protection."],
        "common_mistakes": ["Treating the branch breaker as the motor overload device.", "Setting overloads only to avoid nuisance trips without checking motor thermal limits."],
    },
    "motor-short-circuit-protection": {
        "description": "Branch-circuit protection for faults and high-magnitude short-circuit current.",
        "synonyms": ["motor breaker", "motor fuse", "MCP", "instantaneous trip"],
        "engineering_explanation": "A motor branch protective device must allow normal starting current while clearing faults. This often produces a rating larger than the conductor ampacity would suggest under general circuit rules.",
        "engineering_notes": ["Check the controller combination rating and available fault current.", "Document any permitted increase made to allow the motor to start."],
        "common_mistakes": ["Applying general branch-circuit breaker limits without the motor-specific rules.", "Confusing fault protection with overload protection."],
    },
    "conductor-ampacity": {
        "description": "The maximum current a conductor can carry continuously under its stated conditions of use.",
        "synonyms": ["cable ampacity", "wire current rating", "conductor rating", "amp table"],
        "engineering_explanation": "Ampacity is not a single property of conductor size. Insulation rating, termination temperature, ambient conditions, installation method, grouping, and harmonic content can all determine the usable value.",
        "engineering_notes": ["Start with the correct installation-method table before applying correction factors.", "The lowest-rated termination can govern the usable ampacity."],
        "common_mistakes": ["Selecting from a table without applying ambient or grouping corrections.", "Using a 90 °C insulation column for terminals rated 75 °C."],
    },
    "voltage-drop-guidance": {
        "description": "Design guidance for limiting conductor voltage loss to maintain equipment performance.",
        "synonyms": ["voltage drop", "cable volt loss", "maximum voltage drop", "VD calculation"],
        "engineering_explanation": "Voltage drop is primarily a performance design check rather than a substitute for ampacity. Circuit length, load current, power factor, conductor impedance, and starting conditions should be considered.",
        "engineering_notes": ["Evaluate motor starting drop separately from steady-state drop.", "Use actual route length and include return path as appropriate to the system."],
        "common_mistakes": ["Treating recommended percentage values as universal mandatory limits.", "Calculating with nominal load when starting or inrush is the governing case."],
    },
    "equipment-grounding-conductors": {
        "description": "The conductive fault-current path connecting non-current-carrying metal parts to the system ground.",
        "synonyms": ["earth conductor", "EGC", "ground wire", "equipment earth"],
        "engineering_explanation": "The equipment grounding conductor provides a low-impedance fault path so the protective device operates promptly. It is not intended to carry normal load current.",
        "engineering_notes": ["Maintain continuity across raceway joints and removable equipment.", "Increasing phase conductors for voltage drop may require a proportional EGC increase."],
        "common_mistakes": ["Using the earth as the effective fault-current return path.", "Mixing equipment grounding and neutral functions downstream of the permitted bonding point."],
    },
    "generator-neutral-grounding": {
        "description": "Selection and arrangement of neutral grounding and bonding for generator-supplied systems.",
        "synonyms": ["generator neutral", "genset grounding", "four pole ATS", "generator bond"],
        "engineering_explanation": "Whether a generator is separately derived depends strongly on transfer-switch neutral switching. That classification determines the location of the neutral-to-ground bond and grounding-electrode connection.",
        "engineering_notes": ["Review the transfer scheme before deciding where to bond the neutral.", "Ground-fault sensing must be coordinated with the chosen bonding arrangement."],
        "common_mistakes": ["Creating parallel neutral paths through duplicate bonds.", "Assuming every generator is automatically a separately derived system."],
    },
    "transformer-primary-protection": {
        "description": "Overcurrent protection on the supply side of a transformer.",
        "synonyms": ["transformer breaker", "primary fuse", "transformer OCPD"],
        "engineering_explanation": "Primary protection is selected from transformer current, permitted protection arrangements, conductor protection, and inrush behavior. Secondary conductor and device requirements remain a separate check.",
        "engineering_notes": ["Transformer energization can produce substantial inrush.", "Evaluate both transformer protection and feeder conductor protection."],
        "common_mistakes": ["Assuming primary protection always protects secondary conductors.", "Selecting a device without checking inrush tolerance."],
    },
    "working-clearances": {
        "description": "Minimum clear working space around electrical equipment likely to require examination or service while energized.",
        "synonyms": ["panel clearance", "electrical room clearance", "working space", "switchboard clearance"],
        "engineering_explanation": "Required depth, width, height, access, and illumination depend on voltage and the conditions around exposed live parts. The space must remain dedicated and unobstructed.",
        "engineering_notes": ["Coordinate clearances early with architectural and mechanical layouts.", "Doors and removable panels may affect the practical service envelope."],
        "common_mistakes": ["Using working space for storage.", "Measuring only from the wall rather than the equipment enclosure."],
    },
}


def slug(value: str) -> str:
    return re.sub(r"(^-|-$)", "", re.sub(r"[^a-z0-9]+", "-", value.lower().replace("&", "and")))


def normalize(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()


def build_catalog() -> tuple[list[Category], list[Standard], list[Topic]]:
    categories = [
        Category(id=id_, name=name, short_name=short, description=description, accent=accent, icon=icon)
        for id_, name, short, description, accent, icon in CATEGORY_DATA
    ]
    standards = [
        Standard(id="iec", name="IEC", full_name="International Electrotechnical Commission", edition="Current supported editions", description="International standards for electrical installations, equipment, and safety."),
        Standard(id="nec", name="NEC", full_name="NFPA 70 — National Electrical Code", edition="2023", description="United States benchmark for safe electrical design and installation."),
        Standard(id="pec", name="PEC", full_name="Philippine Electrical Code", edition="2017", description="Electrical installation requirements used in the Philippines."),
    ]
    all_ids = [slug(name) for names in TOPIC_NAMES.values() for name in names]
    topics: list[Topic] = []
    for category_index, (category_id, names) in enumerate(TOPIC_NAMES.items()):
        for index, title in enumerate(names):
            topic_id = slug(title)
            related_pool = [name for name in names if slug(name) != topic_id]
            related_start = max(0, index - 1)
            local_related = related_pool[related_start:related_start + 2]
            candidates = [slug(name) for name in local_related]
            candidates.append(all_ids[(category_index * 7 + index + 11) % len(all_ids)])
            related = list(dict.fromkeys(item for item in candidates if item != topic_id))[:3]
            standard_items = {}
            for standard_id in StandardId:
                value = standard_id.value
                standard_items[value] = TopicStandard(
                    standard_id=standard_id,
                    edition="2023" if value == "nec" else "2017" if value == "pec" else "Current supported edition",
                    reference=REFERENCES[category_id][value],
                    summary=f"{title} must be selected and applied within the installation rules, equipment ratings, and safety provisions of the {value.upper()} reference.",
                    requirements=[
                        "Confirm equipment and conductor ratings for the actual operating conditions.",
                        "Apply the referenced protection, installation, and identification requirements.",
                        "Verify exceptions and local authority requirements before final design approval.",
                    ],
                )
            topic_data = {
                "id": topic_id,
                "title": title,
                "category_id": category_id,
                "description": f"Practical guidance for applying {title.lower()} requirements in electrical installations.",
                "synonyms": [word for word in re.split(r"[\s/&-]+", title.lower()) if len(word) > 3],
                "standards": TopicStandards(**standard_items),
                "engineering_explanation": f"{title} should be evaluated as part of the complete electrical system. Load characteristics, environmental conditions, equipment listings, protection, and the authority having jurisdiction can affect the final application.",
                "engineering_notes": ["Document the design basis and the edition used.", "Confirm manufacturer instructions and local amendments."],
                "common_mistakes": ["Applying a general rule without checking its exceptions.", "Failing to coordinate the requirement with connected equipment."],
                "related_topic_ids": related,
                "last_reviewed": "2026-08-14" if index % 3 == 0 else "2026-07-22" if index % 3 == 1 else "2026-06-05",
                "review_status": ReviewStatus.VERIFIED if index % 5 == 0 else ReviewStatus.REVIEWED,
                "source_status": "Curated summary — verify against official publication",
            }
            topic_data.update(OVERRIDES.get(topic_id, {}))
            topics.append(Topic(**topic_data))
    return categories, standards, topics


class InMemoryStore:
    def __init__(self) -> None:
        self._categories, self._standards, self._topics = build_catalog()
        self._users: dict[str, StoredUser] = {}
        self.add_user("demo", "voltwise-demo")

    def categories(self) -> list[Category]:
        return deepcopy(self._categories)

    def standards(self) -> list[Standard]:
        return deepcopy(self._standards)

    def stats(self) -> DashboardStats:
        reviewed = {ReviewStatus.REVIEWED, ReviewStatus.VERIFIED}
        return DashboardStats(
            topic_count=len(self._topics),
            category_count=len(self._categories),
            standard_count=len(self._standards),
            reviewed_count=sum(topic.review_status in reviewed for topic in self._topics),
        )

    def featured_topics(self, limit: int = 4) -> list[Topic]:
        ids = ["motor-overload-protection", "conductor-ampacity", "generator-neutral-grounding", "working-clearances"]
        return deepcopy([self._topic_by_id(id_) for id_ in ids][:limit])

    def recent_topics(self, limit: int = 5) -> list[Topic]:
        return deepcopy(list(reversed(self._topics))[:limit])

    def topics_by_category(self, category_id: str) -> list[Topic]:
        return deepcopy([topic for topic in self._topics if topic.category_id == category_id])

    def topics_by_standard(self, standard_id: StandardId) -> list[Topic]:
        return deepcopy([topic for topic in self._topics if getattr(topic.standards, standard_id.value) is not None])

    def topic(self, topic_id: str) -> Topic | None:
        topic = self._topic_by_id(topic_id)
        return deepcopy(topic) if topic else None

    def related_topics(self, topic_id: str) -> list[Topic]:
        source = self._topic_by_id(topic_id)
        if source is None:
            return []
        resolved = [self._topic_by_id(id_) for id_ in source.related_topic_ids]
        return deepcopy([topic for topic in resolved if topic is not None])

    def search_topics(
        self,
        query: str,
        category_id: str | None = None,
        standard_id: StandardId | None = None,
        limit: int | None = None,
    ) -> list[Topic]:
        terms = [term for term in normalize(query).split(" ") if term]
        matches = []
        for topic in self._topics:
            if category_id and topic.category_id != category_id:
                continue
            if standard_id and getattr(topic.standards, standard_id.value) is None:
                continue
            standard_text = []
            for item in (topic.standards.iec, topic.standards.nec, topic.standards.pec):
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
        return deepcopy(matches)

    def _topic_by_id(self, topic_id: str) -> Topic | None:
        return next((topic for topic in self._topics if topic.id == topic_id), None)

    def add_user(self, username: str, password: str) -> StoredUser:
        key = username.casefold()
        if key in self._users:
            raise ValueError("Username already exists")
        user = StoredUser(username=username, password_hash=hash_password(password))
        self._users[key] = user
        return user.model_copy()

    def authenticate(self, username: str, password: str) -> StoredUser | None:
        from .auth import verify_password

        user = self._users.get(username.casefold())
        return user.model_copy() if user and verify_password(password, user.password_hash) else None

    def get_user(self, username: str) -> StoredUser | None:
        user = self._users.get(username.casefold())
        return user.model_copy() if user else None


store = InMemoryStore()
