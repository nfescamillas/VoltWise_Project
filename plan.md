# Electrical Standards Quick Reference
## Product Specification and Development Plan

**Project Type:** Engineering reference application  
**Primary Standards:** IEC, NEC/NFPA 70, Philippine Electrical Code (PEC)  
**Initial Product Strategy:** Option A — Quick Reference  
**Status:** Initial specification  
**Version:** 0.1

---

## 1. Project Overview

Electrical Standards Quick Reference is a desktop- or web-based engineering reference application that summarizes commonly used electrical requirements from IEC, NEC/NFPA 70, and the Philippine Electrical Code (PEC).

The application is intended to help electrical engineers, maintenance engineers, automation engineers, technicians, students, and industrial personnel quickly locate relevant electrical standards information without manually browsing large standards documents.

The application will focus on practical engineering topics such as:

- Cable and conductor requirements
- Overcurrent protection
- Grounding and bonding
- Motors
- Transformers
- Generators
- Panels, switchboards, and MCCs
- Industrial electrical installations

The application is a **reference and navigation tool**, not a substitute for official standards and not a certified electrical design tool.

---

## 2. Product Vision

Create a fast, structured, engineering-focused reference system that answers:

> “Which electrical standard applies to this topic, what does it generally require, and where can I find the official reference?”

The application should allow users to search by engineering terminology rather than requiring them to know article or clause numbers.

Examples:

- motor breaker sizing
- generator neutral grounding
- cable derating
- equipment grounding conductor
- transformer secondary protection
- MCC working clearance

---

## 3. Product Goals

### 3.1 Primary Goals

The first version should:

1. Summarize commonly used IEC, NEC, and PEC requirements.
2. Organize requirements by practical engineering topic.
3. Allow users to browse by category.
4. Allow users to browse by standard.
5. Provide engineering-language search.
6. Show relevant code/article/clause references.
7. Clearly distinguish:
   - Standard requirements
   - Engineering explanation
   - Recommended engineering practice
8. Include common mistakes and related topics.
9. Support future expansion without redesigning the application architecture.

### 3.2 Secondary Goals

The application should eventually support:

- Multiple standard editions
- Side-by-side standards comparison
- Bookmarks and favorites
- Recently viewed topics
- Offline reference mode
- Engineering calculators
- Guided electrical design workflows
- AI-assisted standards search

---

## 4. Non-Goals for V1

The first version will **not** attempt to:

- Replace official IEC, NFPA, or PEC publications
- Reproduce complete copyrighted standards
- Perform certified electrical design
- Perform arc-flash calculations
- Perform short-circuit studies
- Perform protection coordination studies
- Size grounding grids
- Perform relay coordination
- Design transmission systems
- Design utility substations
- Cover railway, aircraft, marine, nuclear, or mining standards
- Provide legal or regulatory certification

Complex calculation tools will be deferred to later releases.

---

## 5. Target Users

### 5.1 Primary Users

- Electrical engineers
- Industrial maintenance engineers
- Automation and control engineers
- Plant electrical personnel
- Project engineers
- Electrical technicians

### 5.2 Secondary Users

- Electrical engineering students
- Electrical contractors
- Facility engineers
- Commissioning engineers
- Technical trainers

---

## 6. Standards Scope

### 6.1 IEC

The application may reference applicable IEC standards depending on topic, such as:

- IEC 60364 series
- IEC 60947 series
- IEC 60204 series
- IEC 61439 series
- Relevant motor, transformer, generator, and protection standards

The application should not assume that one IEC publication covers every subject.

### 6.2 NEC

Primary reference:

- NFPA 70 — National Electrical Code

The system must store the specific edition used for each topic.

### 6.3 Philippine Electrical Code

The Philippine implementation should be represented as:

**PEC — Philippine Electrical Code**

IIEE should be treated as the relevant Philippine professional organization/publisher context rather than as a separate technical code equivalent to IEC or NEC.

---

## 7. V1 Functional Scope

The MVP should contain approximately **60–70 curated topics** across eight categories.

### 7.1 Conductors and Cables

Suggested topics:

1. Conductor ampacity
2. Cable sizing principles
3. Ambient-temperature correction
4. Cable grouping and derating
5. Parallel conductors
6. Neutral conductor sizing
7. Protective conductor sizing
8. Voltage-drop guidance
9. Copper vs aluminum conductors

### 7.2 Overcurrent Protection

Suggested topics:

1. Circuit breakers
2. Fuses
3. Overload protection
4. Short-circuit protection
5. Ground-fault protection
6. Interrupting capacity
7. Protective-device coordination principles

### 7.3 Grounding and Bonding

Suggested topics:

1. Grounding terminology
2. Equipment grounding conductors
3. Protective earth conductors
4. Grounding electrode systems
5. Bonding
6. Neutral-to-ground connections
7. Separately derived systems
8. Generator grounding
9. IEC TN/TT/IT earthing arrangements

### 7.4 Motors

Suggested topics:

1. Motor full-load current
2. Motor branch-circuit conductors
3. Motor overload protection
4. Motor short-circuit protection
5. Motor disconnecting means
6. Motor controllers
7. Multiple-motor feeders
8. VFD-fed motors
9. Soft-starter installations
10. Motor control centers

### 7.5 Transformers

Suggested topics:

1. Transformer rated current
2. Primary protection
3. Secondary protection
4. Transformer conductors
5. Transformer grounding
6. Dry-type transformer installation

### 7.6 Generators and Standby Power

Suggested topics:

1. Generator conductor sizing principles
2. Generator overcurrent protection
3. Generator neutral grounding
4. Transfer switches
5. Separately derived generator systems
6. Emergency systems
7. Standby systems

### 7.7 Panels, Switchboards, and Distribution

Suggested topics:

1. Panelboards
2. Switchboards
3. Switchgear
4. Motor control centers
5. Busbar and bus ratings
6. Working clearances
7. Equipment interrupting/SCCR concepts

### 7.8 Industrial Installations

Suggested topics:

1. Industrial control panels
2. PLC/control panels
3. Control transformers
4. Control wiring
5. 24 VDC control systems
6. VFD installation
7. Isolation and disconnects
8. Emergency-stop electrical considerations

---

## 8. Core User Workflows

### 8.1 Browse by Category

Example:

```text
Home
  → Motors
      → Motor Overload Protection
```

### 8.2 Search by Engineering Term

Example search:

```text
motor breaker
```

Possible results:

- Motor Short-Circuit Protection
- Motor Overload Protection
- Motor Disconnecting Means

### 8.3 Browse by Standard

Example:

```text
Standards
  → NEC
      → Motors
          → Motor Branch-Circuit Conductors
```

### 8.4 View Topic by Standard

Example topic page:

```text
Motor Overload Protection

[ IEC ] [ NEC ] [ PEC ]

Reference
Summary
Key Requirements
Engineering Notes
Common Mistakes
Related Topics
```

---

## 9. Topic Page Specification

Each topic should use a consistent structure.

### Required Fields

- Topic title
- Category
- Short description
- Applicable standard
- Standard edition
- Article/clause/reference
- Requirement summary
- Engineering explanation
- Key requirements
- Engineering notes
- Common mistakes
- Related topics
- Last reviewed date
- Source status

### Recommended Presentation

#### Requirement

Explain the standard requirement in concise, original language.

#### Engineering Explanation

Explain why the requirement exists and how engineers generally interpret it.

#### Engineering Note

Provide useful practical context that is not itself a mandatory rule.

#### Common Mistakes

Highlight frequent misinterpretations.

#### Related Topics

Link to related requirements.

---

## 10. Information Classification

The UI should clearly distinguish among different types of content.

Suggested labels:

```text
REQUIREMENT
ENGINEERING EXPLANATION
ENGINEERING NOTE
COMMON MISTAKE
REFERENCE
```

This is important because engineering guidance must not be presented as though it were a mandatory code requirement.

---

## 11. Search Requirements

The search system should support:

- Topic titles
- Synonyms
- Engineering phrases
- Standard numbers
- Article numbers
- Equipment names
- Common field terminology

Examples:

| User Search | Likely Topic |
|---|---|
| motor breaker | Motor Short-Circuit Protection |
| cable derating | Cable Grouping / Temperature Correction |
| generator neutral | Generator Grounding |
| transformer breaker | Transformer Protection |
| earth conductor | Protective/Earth Conductor |
| panel clearance | Working Clearances |

Future versions may add semantic search.

---

## 12. Standards Comparison

Comparison is not the main purpose of V1, but a limited comparison view should be supported.

Example:

```text
Topic: Motor Overload Protection

IEC
Reference:
Summary:

NEC
Reference:
Summary:

PEC
Reference:
Summary:
```

The comparison should focus on:

- Reference location
- Terminology
- General approach
- Important differences

It should avoid excessive duplication.

---

## 13. Data Model

The content should be stored as structured records rather than embedded directly in UI code.

Example:

```yaml
id: motor-overload-protection

title: Motor Overload Protection

category: motors

description: >
  Protection intended to protect a motor against sustained
  overcurrent and overheating.

standards:

  nec:
    edition: "2026"
    reference: "Article 430"
    summary: "..."
    requirements:
      - "..."

  iec:
    edition: "current-supported-edition"
    references:
      - "IEC 60364"
      - "IEC 60947"
    summary: "..."
    requirements:
      - "..."

  pec:
    edition: "supported-edition"
    reference: "..."
    summary: "..."
    requirements:
      - "..."

engineering_notes:
  - "Overload protection is different from short-circuit protection."

common_mistakes:
  - "Using the same sizing basis for conductor, overload, and short-circuit protection."

related_topics:
  - motor-branch-conductors
  - motor-short-circuit-protection

last_reviewed: "YYYY-MM-DD"
```

---

## 14. Recommended Content Metadata

Each topic-standard record should store:

- `standard_id`
- `standard_name`
- `edition`
- `reference`
- `topic_id`
- `category`
- `summary`
- `requirements`
- `engineering_notes`
- `common_mistakes`
- `related_topics`
- `source`
- `last_reviewed`
- `review_status`

Suggested review statuses:

- Draft
- Reviewed
- Verified
- Needs update

---

## 15. Edition Management

Even if V1 supports only one edition of each standard, the architecture should support multiple editions.

Example future UI:

```text
NEC
[2020] [2023] [2026]
```

Edition should therefore be stored independently from the standard name.

---

## 16. User Interface Structure

### 16.1 Home Page

Suggested layout:

```text
Electrical Standards Quick Reference

IEC • NEC • PEC

Search electrical topics...

[ Conductors ]
[ Protection ]
[ Grounding ]
[ Motors ]
[ Transformers ]
[ Generators ]
[ Distribution ]
[ Industrial ]
```

### 16.2 Search Page

Display:

- Search field
- Matching topics
- Category
- Standard availability
- Brief description

### 16.3 Topic Page

Display:

- Topic name
- Category
- Standard tabs
- Standard edition
- Official reference
- Requirement summary
- Key requirements
- Engineering explanation
- Notes
- Common mistakes
- Related topics

### 16.4 Standards Page

```text
IEC
NEC
PEC
```

Each standard page should list available categories and topics.

---

## 17. Content Principles

All written content should follow these principles:

1. Summarize rather than reproduce standards.
2. Use original wording.
3. Preserve technical accuracy.
4. Always identify the source standard and edition.
5. Clearly identify article/clause references when available.
6. Avoid presenting engineering preference as mandatory code.
7. Flag uncertain or unverified interpretations.
8. Prefer concise technical language.
9. Include examples only when they clarify the rule.
10. Encourage verification against the official standard for final engineering decisions.

---

## 18. Copyright and Legal Considerations

IEC, NFPA, and PEC publications are copyrighted.

The application should therefore avoid storing large verbatim extracts.

Preferred content:

- Original summaries
- Explanations
- References
- Clause/article numbers
- Engineering interpretation
- Examples
- Cross-references
- Search metadata

Avoid:

- Full standard pages
- Long verbatim excerpts
- Reconstructed codebooks
- Scanned copyrighted material distributed inside the application

Recommended disclaimer:

> This application provides summarized engineering reference information. It does not replace official IEC, NFPA, PEC, local regulations, authority-having-jurisdiction requirements, or professional engineering judgment.

---

## 19. Technical Architecture Options

### Option 1 — Web Application

Possible stack:

- Frontend: React / Next.js
- Backend: Python FastAPI or Node.js
- Database: SQLite initially, PostgreSQL later
- Content format: YAML or JSON
- Search: built-in database search initially

Advantages:

- Cross-platform
- Easy updates
- Good future AI integration

### Option 2 — Desktop Application

Possible stack:

- Python
- PySide6
- SQLite
- YAML/JSON content files

Advantages:

- Offline use
- Simple packaging
- Familiar Python ecosystem
- Suitable for plant environments

### Option 3 — Hybrid

Possible stack:

- React frontend
- Local database
- Tauri/Electron packaging

Advantages:

- Desktop user experience
- Web technologies
- Offline capability

For an engineering tool likely to be used in industrial environments, **desktop-first with offline capability** is a strong option.

---

## 20. Suggested MVP Architecture

A simple MVP could use:

```text
Application
│
├── UI
│   ├── Home
│   ├── Categories
│   ├── Search
│   ├── Topic View
│   └── Standards View
│
├── Content Engine
│   ├── Topic Loader
│   ├── Standard Filter
│   ├── Related Topics
│   └── Search
│
├── Data
│   ├── topics/
│   ├── standards/
│   └── metadata/
│
└── Local Database
    ├── Bookmarks
    ├── Search History
    └── Settings
```

---

## 21. Suggested Repository Structure

```text
electrical-standards-reference/
│
├── README.md
├── docs/
│   ├── specification.md
│   ├── content-guidelines.md
│   └── roadmap.md
│
├── app/
│   ├── ui/
│   ├── search/
│   ├── content/
│   └── models/
│
├── data/
│   ├── standards/
│   ├── categories/
│   └── topics/
│
├── tests/
│
└── assets/
```

---

## 22. MVP Deliverables

The first usable release should include:

### Application

- Home screen
- Category browser
- Standards browser
- Topic page
- Search
- Related-topic navigation

### Content

- 8 categories
- Approximately 60–70 topics
- IEC references where applicable
- NEC references
- PEC references
- Engineering explanations
- Common mistakes

### Content Management

- Structured YAML/JSON topic format
- Standard editions stored separately
- Review status
- Last-reviewed metadata

---

## 23. Features Deferred Until After MVP

### V1.1

- Improved IEC/NEC/PEC comparison
- Better filtering
- Search synonyms
- Topic tags

### V1.2

- Bookmarks
- Favorites
- Recently viewed
- Offline content updates
- Export/print topic summaries

### V2

Engineering calculators such as:

- Three-phase current
- Voltage drop
- Motor current
- Transformer current
- Basic conductor sizing
- Basic motor feeder workflow

### V2.5

Guided design workflows:

```text
Equipment
→ Load information
→ Applicable standards
→ Required checks
→ Engineering workflow
```

### V3

AI standards assistant capable of answering queries against the curated standards knowledge base.

---

## 24. Initial Development Phases

### Phase 1 — Foundation

- Create repository
- Define content schema
- Define category structure
- Define standards metadata
- Build sample topic records

Target:

- 5–10 complete topics

### Phase 2 — Core UI

Develop:

- Home
- Category browser
- Topic page
- Standard tabs
- Related topics

### Phase 3 — Search

Implement:

- Keyword search
- Synonyms
- Topic tags
- Standard/article search

### Phase 4 — Content Expansion

Grow from sample topics to approximately 60–70 topics.

Suggested priority:

1. Motors
2. Conductors
3. Protection
4. Grounding
5. Transformers
6. Generators
7. Distribution
8. Industrial

### Phase 5 — Validation

Review:

- Standard reference accuracy
- Edition accuracy
- Engineering terminology
- Content classification
- Search quality
- Broken cross-references

### Phase 6 — Release

Prepare:

- Application packaging
- Disclaimer
- Documentation
- Versioning
- Content update process

---

## 25. Quality and Validation Requirements

Every published topic should answer:

1. Which standard applies?
2. Which edition is being referenced?
3. What article or clause applies?
4. What is the summarized requirement?
5. Is the statement mandatory or explanatory?
6. Are there important exceptions?
7. Is the interpretation verified?
8. When was the topic last reviewed?

No topic should be considered production-ready unless its reference has been verified against the correct standard edition.

---

## 26. Success Criteria for V1

The MVP is successful when a user can:

1. Open the application.
2. Search for a common electrical topic using normal engineering language.
3. Find the correct topic quickly.
4. View IEC, NEC, and/or PEC references.
5. Understand the requirement without reading a full codebook section.
6. Identify whether content is a requirement, explanation, or engineering note.
7. Navigate to related topics.
8. Determine which official standard to consult for final verification.

---

## 27. Recommended First Content Set

The first ten topics should be selected to test different categories and data structures.

Recommended initial topics:

1. Motor Full-Load Current
2. Motor Branch-Circuit Conductors
3. Motor Overload Protection
4. Motor Short-Circuit Protection
5. Conductor Ampacity
6. Voltage Drop
7. Equipment Grounding Conductor
8. Generator Neutral Grounding
9. Transformer Primary Protection
10. Working Clearances

These topics cover calculations, terminology, protection, grounding, and installation rules and therefore provide a good test of the content model.

---

## 28. Final MVP Definition

The MVP should be considered:

> **A curated electrical standards reference application containing approximately 60–70 practical engineering topics across eight categories, with engineering-language search and structured summaries of applicable IEC, NEC, and PEC requirements.**

The core workflow is:

```text
Engineering Question
        ↓
Search / Browse
        ↓
Topic
        ↓
Standard
        ↓
Reference
        ↓
Requirement Summary
        ↓
Engineering Explanation
        ↓
Related Topics
```

The first release should remain focused on **reference, navigation, explanation, and discovery**.

Calculation engines, design automation, and AI assistance should be layered onto the structured standards database only after the reference foundation has been validated.

---

## 29. Product Roadmap Summary

```text
V1
Electrical Standards Quick Reference

        ↓

V1.1
Standards Comparison Enhancements

        ↓

V1.2
Bookmarks / Offline / Search Improvements

        ↓

V2
Engineering Calculators

        ↓

V2.5
Guided Electrical Design

        ↓

V3
AI Electrical Standards Assistant
```

---

## 30. Project Principle

The most important design principle for this project is:

> **Build the standards knowledge base first. Build intelligence on top of it later.**

A well-structured and carefully verified standards database will make future comparison tools, calculators, engineering workflows, and AI assistance substantially easier and safer to implement.
