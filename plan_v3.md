# Philippine Electrical Engineering Toolkit
## Product Specification and Development Plan

**Project Type:** Philippine electrical engineering handbook and toolkit  
**Primary Source Families:** Philippine Electrical Code (PEC), Philippine Grid Code (PGC), Philippine Distribution Code (PDC)  
**Current Development Focus:** Philippine Electrical Code (PEC) only  
**Status:** PEC-first toolkit specification  
**Version:** 0.3

---

## 1. Project Overview

Philippine Electrical Engineering Toolkit is a desktop- or web-based engineering handbook and toolkit built around three Philippine electrical regulatory/technical source families:

1. **Philippine Electrical Code (PEC)** — electrical installations, conductors, protection, grounding, motors, transformers, generators, equipment, and related installation requirements.
2. **Philippine Grid Code (PGC)** — requirements relevant to the Philippine transmission/grid system, grid connection, operation, performance, protection, planning, and related grid interfaces.
3. **Philippine Distribution Code (PDC)** — requirements relevant to Philippine distribution systems, distribution planning/operation, service/interface requirements, power quality, protection, and related distribution-system matters.

These are not to be presented as three interchangeable or competing standards. They cover different levels and responsibilities within the Philippine electrical system.

### Current Product Focus

For the current development phase, **only PEC content is to be deeply implemented and populated**.

The Grid Code and Distribution Code should remain visible in the architecture and navigation as future source families, but their detailed toolkit content should be marked as **Planned** until deliberately developed from verified source documents.

The application should not behave as a simple code index. For PEC topics, it should provide a practical engineering toolkit containing:

- detailed requirement explanations;
- scope and applicability;
- formulas and engineering relationships;
- tables and decision aids;
- original figures and diagrams;
- worked examples;
- design workflows;
- exceptions and special conditions;
- common mistakes;
- cross-references;
- source traceability.

The application does not replace the official PEC, Grid Code, Distribution Code, local regulations, authority-having-jurisdiction requirements, or professional engineering judgment.

---

## 2. Product Vision

Create a **Philippine electrical engineering handbook and practical toolkit** that answers:

> “What Philippine electrical rule applies to this problem, what does it require, how do I apply it, what formulas/tables/figures help me understand it, what are the important exceptions, and where can I verify it in the official source?”

The user should be able to search using practical engineering language rather than knowing code article numbers in advance.

Examples:

- motor branch conductor
- motor breaker and overload
- feeder ampacity
- generator neutral grounding
- transformer protection
- grounding electrode conductor
- panel working clearance
- voltage drop
- emergency system
- service entrance

The current release should answer these primarily from the **Philippine Electrical Code**.

---

## 3. Product Goals

### 3.1 Primary Goals — PEC Phase

The PEC-focused phase should:

1. Build a deep, source-driven PEC knowledge base.
2. Organize PEC requirements by practical engineering topic.
3. Provide detailed requirement explanations rather than citation-only answers.
4. Show exact PEC article/section/table references where verified.
5. Include useful formulas and engineering relationships.
6. Include original engineering tables and decision aids.
7. Include original diagrams and figures where the topic benefits from visualization.
8. Include worked examples for calculation- or configuration-oriented topics.
9. Include engineering workflows showing the correct order of design checks.
10. Include important exceptions and special cases.
11. Include common mistakes and field/design notes.
12. Distinguish code requirements from engineering recommendations and general formulas.
13. Maintain source traceability for all PEC-specific technical claims.
14. Support search by engineering terminology, article number, equipment, and topic.
15. Build the architecture so PGC and PDC can later use the same toolkit model.

### 3.2 Future Goals

After PEC reaches sufficient depth and quality:

- add Philippine Grid Code toolkit content;
- add Philippine Distribution Code toolkit content;
- create cross-document navigation where topics overlap;
- add interactive calculators driven by verified source rules;
- add bookmarks/favorites and offline use;
- add guided design workflows;
- add a source-grounded AI assistant.

---

## 4. Non-Goals for V1

The first version will **not** attempt to:

- Replace official PEC, Philippine Grid Code, or Philippine Distribution Code publications
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

## 6. Source-Family Scope

### 6.1 Philippine Electrical Code (PEC) — Active Development

PEC is the active content source for the current phase.

The application should use the actual supported PEC edition(s) supplied to the project and should store:

- edition/year;
- part/volume if applicable;
- article;
- section;
- table;
- figure reference where relevant;
- page/location metadata where useful.

PEC content must be source-driven and should not be inferred from NEC solely because of historical relationships.

### 6.2 Philippine Grid Code (PGC) — Planned

PGC should remain represented as a future toolkit family.

Potential future areas include:

- grid connection;
- system planning;
- grid operation;
- voltage/frequency requirements;
- protection and coordination;
- generator/grid interfaces;
- metering;
- power quality;
- system performance;
- compliance responsibilities.

Do not populate detailed PGC technical rules until the relevant source material has been reviewed and structured.

### 6.3 Philippine Distribution Code (PDC) — Planned

PDC should remain represented as a future toolkit family.

Potential future areas include:

- distribution planning;
- distribution operation;
- service/interface requirements;
- connection requirements;
- protection;
- power quality;
- metering;
- embedded/distributed generation interfaces;
- reliability/performance;
- distribution system responsibilities.

Do not populate detailed PDC technical rules until the relevant source material has been reviewed and structured.

### 6.4 Source Hierarchy Principle

The three source families should be treated according to subject and applicability, not by forcing a comparison.

Example:

```text
Building / Plant Installation
        ↓
       PEC

Transmission / Grid Interface
        ↓
       PGC

Distribution System / Distribution Interface
        ↓
       PDC
```

Where a real project touches more than one source family, future versions may show cross-document relationships.

---

## 7. PEC Toolkit Functional Scope

The PEC toolkit should eventually contain approximately **60–70 deeply curated topics** across the categories below. Depth and source accuracy take priority over topic count.

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

### 8.3 Browse by Source Family

Example:

```text
Sources
  → Philippine Electrical Code
      → Motors
          → Motor Branch-Circuit Conductors
```

The source-family home may also show:

```text
Philippine Electrical Code      ACTIVE
Philippine Grid Code            PLANNED
Philippine Distribution Code    PLANNED
```

### 8.4 View PEC Topic

Example topic page:

```text
Motor Overload Protection

Philippine Electrical Code
Edition: [supported edition]

Quick Answer
What the PEC Requires
Applicability
Key Requirements
Formula / Design Rule
Quick Reference Table
Engineering Figure
Worked Examples
Design Workflow
Exceptions
Engineering Notes
Common Mistakes
Related Topics
Official PEC References
Verification Metadata
```

---

## 9. Topic Page Specification — Enriched Content Requirement

The current application must be upgraded from a **reference locator** into a **substantive engineering quick-reference**.

A topic is **not complete** if it only displays a standard name, article number, clause number, or a short sentence telling the user where to look.

For every supported PEC topic, the page should provide enough original explanatory content for the user to understand and apply the requirement at a practical engineering-reference level before consulting the official PEC publication.

### 9.1 Required Content Per Standard Per Topic

Each source-specific topic entry should contain, when applicable:

1. **Standard and Edition**
   - Standard name
   - Edition/year
   - Applicable article, section, clause, table, annex, or part
   - Other related standards needed for the topic

2. **Requirement Summary**
   - A substantive original-language explanation of what the standard requires
   - More than a citation or locator
   - Written without reproducing long copyrighted text verbatim

3. **Scope and Applicability**
   - What equipment/installations the rule applies to
   - Important conditions or boundaries
   - Situations where another article/standard takes precedence

4. **Key Requirements**
   - Structured bullet points covering the major requirements
   - Thresholds, factors, relationships, conditions, and limits where verified
   - Any important exceptions or qualifications

5. **Engineering Explanation**
   - What the requirement means in practice
   - Why the rule exists
   - How engineers normally use the requirement

6. **Formula(s)**
   - Applicable engineering formulas
   - Definition of every variable
   - Units
   - Assumptions
   - Notes on whether the formula comes from the standard, is derived from the standard, or is a general engineering relationship

7. **Table(s)**
   - Original application tables created from verified requirements/data
   - Examples include:
     - design-factor tables
     - comparison tables
     - decision tables
     - conductor/protection workflow tables
     - correction-factor summaries where copyright and source permissions allow
   - Do not copy protected standards tables wholesale
   - If exact official tabulated data cannot legally be reproduced, provide a summary/decision table and point to the official table number

8. **Figure / Diagram**
   - Original explanatory diagrams where visual explanation helps
   - Examples:
     - grounding arrangements
     - motor branch-circuit structure
     - generator neutral/ATS arrangements
     - transformer protection layouts
     - conductor/protection relationship diagrams
   - Do not copy copyrighted figures directly from standards
   - Figures should be newly drawn from the summarized engineering concept

9. **Worked Example**
   - At least one realistic engineering example for calculation-oriented or configuration-oriented topics
   - Clearly state assumptions and input data
   - Show calculation steps
   - Show intermediate values
   - Show final result
   - Explain which standard rule each major step is based on

10. **Common Mistakes**
    - Frequent misinterpretations
    - Incorrect assumptions
    - Confusion between different protection or conductor requirements

11. **Important Exceptions / Notes**
    - Exceptions that materially change application of the rule
    - Local/AHJ considerations
    - Cases where professional judgment or further study is necessary

12. **Related Topics**
    - Links to other application topics required to complete the design context

13. **Verification Metadata**
    - Source standard
    - Edition
    - Reference location
    - Last reviewed date
    - Review status
    - Source confidence/status

### 9.2 Topic Completion Rule

A topic should not be marked `verified` or `complete` unless:

- the standard reference has been checked;
- the substantive summary is present;
- all numerical values shown are traceable;
- formulas are correctly defined;
- an example is included where the topic benefits from one;
- applicable tables or diagrams are included or intentionally marked not applicable;
- exceptions are captured where they materially affect the result;
- the content does not merely redirect the user to the standard.

### 9.3 Preferred Topic Page Layout

```text
Topic Title
Category

[ PEC ]

STANDARD & EDITION
REFERENCE

WHAT THE STANDARD REQUIRES
Detailed summarized requirement...

APPLICABILITY
Where and when this rule applies...

KEY REQUIREMENTS
• ...
• ...
• ...

FORMULAS
Equation
Variables
Units
Assumptions

TABLE / QUICK REFERENCE
...

FIGURE / DIAGRAM
...

WORKED EXAMPLE
Given:
Step 1:
Step 2:
Result:

ENGINEERING EXPLANATION
...

IMPORTANT EXCEPTIONS
...

COMMON MISTAKES
...

RELATED TOPICS
...

SOURCE / REVIEW METADATA
...
```

### 9.4 Example Content Depth

For a topic such as **Motor Branch-Circuit Conductors**, the app should not stop at:

```text
PEC: See applicable Motor Article.
```

Instead it should provide content comparable in structure to:

```text
PEC — Motor Branch-Circuit Conductors

Reference:
Applicable Article/Section: [verified reference]

Requirement Summary:
Explain the conductor-sizing basis in original language.

Key Requirements:
• Identify the current basis used by the standard.
• Explain the required conductor ampacity relationship.
• Identify relevant correction/adjustment considerations.
• Note special cases where applicable.

Formula / Rule Representation:
Required conductor ampacity ≥ [verified relationship]

Worked Example:
Motor rating/current basis: ...
Required minimum conductor ampacity: ...
Selected conductor: ...
Verification: ...

Engineering Note:
Explain the distinction between conductor sizing, overload protection,
and branch-circuit short-circuit/ground-fault protection.

Common Mistake:
Using the same percentage or current basis for all three functions.
```

The exact numerical rule must only be inserted after verification against the supported PEC edition.

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

## 12. Cross-Document Relationships

Cross-standard comparison is no longer a primary feature.

For the PEC-first phase, focus on complete PEC content.

The architecture should still support future cross-document relationships such as:

```text
Topic: Generator Interconnection

PEC
Installation and equipment requirements

PGC
Grid-interface requirements where applicable

PDC
Distribution-interconnection requirements where applicable
```

Do not show forced side-by-side comparisons where the documents govern different scopes.

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

sources:

  pec:
    edition: "supported edition"
    reference: "verified PEC article/section"
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

## 13.1 Enriched Content Data Model

The data model must support rich source-specific content rather than only references and summaries.

Recommended structure:

```yaml
id: motor-branch-circuit-conductors
title: Motor Branch-Circuit Conductors
category: motors

sources:
  pec:
    document_name: "Philippine Electrical Code"
    edition: "supported edition"
    references:
      - "verified article/section"

    requirement_summary: |
      Original-language explanation of the applicable requirement.

    applicability:
      - "..."

    key_requirements:
      - "..."

    formulas:
      - name: "..."
        expression: "..."
        variables:
          - symbol: "I"
            definition: "..."
            unit: "A"
        basis: "standard | derived | general-engineering"
        source_reference: "..."

    tables:
      - title: "..."
        type: "summary | decision | application"
        source_reference: "..."
        rows: []

    figures:
      - title: "..."
        type: "schematic | flowchart | conceptual"
        description: "..."
        source_basis: "Original figure based on summarized requirement"

    examples:
      - title: "..."
        inputs: []
        assumptions: []
        steps: []
        result: "..."
        source_references: []

    exceptions:
      - "..."

    engineering_notes:
      - "..."

    common_mistakes:
      - "..."

    verification:
      review_status: "draft | reviewed | verified | needs-update"
      last_reviewed: "YYYY-MM-DD"
      verified_by: ""
      source_status: ""

related_topics:
  - "..."
```

### 13.2 Content Rendering Rules

The UI renderer should:

- Render formulas with proper mathematical formatting.
- Render tables responsively and allow horizontal scrolling where required.
- Render diagrams/figures as SVG or another scalable format where practical.
- Keep figures readable in both desktop and mobile layouts.
- Make worked-example steps visually distinct.
- Show references beside the content they support.
- Clearly label values that are examples rather than mandated limits.
- Allow `not applicable` for sections that genuinely do not apply instead of showing empty blocks.

### 13.3 No Placeholder Content in Production

The production UI must not display placeholders such as:

- `...`
- `TBD`
- `See standard`
- `Refer to Article X`
- empty formula/table/example sections

unless the topic is visibly marked as a draft.

A production-ready topic must provide useful engineering content rather than only navigation.

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

PEC • Grid Code • Distribution Code

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
- Source/topic navigation
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

## 17.1 Source and Verification Requirements for Detailed Content

Because this application now includes substantive technical details, numerical relationships, examples, formulas, and diagrams, content accuracy must be treated as a first-class feature.

### Source Rules

For every source-specific technical claim:

- Identify the standard and edition.
- Store the article/clause/table/annex reference.
- Do not invent missing numerical values.
- Do not infer PEC requirements from NEC merely because of historical relationships.
- Use the actual supported PEC source as the authority for PEC content.
- Where a PEC topic points to another Philippine regulation or source, record the cross-reference without assuming equivalence.
- Mark uncertain or incomplete content as `draft` or `needs-update`.

### Numerical Data Rules

All of the following require source verification before publication:

- percentages
- multipliers
- conductor ampacities
- correction factors
- temperature factors
- protection settings
- minimum dimensions
- maximum dimensions
- working clearances
- time limits
- voltage limits
- current limits
- conductor sizes
- table values

### Formula Rules

Every formula should indicate one of three origins:

1. **Standard-defined** — explicitly presented or required by the standard.
2. **Derived from standard requirements** — mathematical representation of a verified rule.
3. **General engineering formula** — standard engineering relationship used to illustrate application.

The app must not imply that a general engineering formula is directly quoted from a standard.

### Example Rules

Worked examples must:

- use clearly stated assumptions;
- use realistic but fictional project data;
- show each calculation step;
- reference the rule used at each major step;
- distinguish between a minimum code requirement and a selected engineering design value;
- avoid implying that one example is universally applicable.

---

## 18. Copyright and Legal Considerations

PEC, Philippine Grid Code, and Philippine Distribution Code publications and source documents may be subject to copyright and licensing restrictions.

The application should therefore avoid storing large verbatim extracts.

Preferred content:

- Original summaries
- Explanations
- References
- Clause/article numbers
- Engineering interpretation
- Original worked examples
- General or derived formulas
- Original decision/application tables
- Original figures and diagrams
- Cross-references
- Search metadata

Avoid:

- Full standard pages
- Long verbatim excerpts
- Reconstructed codebooks
- Wholesale reproduction of copyrighted standards tables
- Direct copies of copyrighted figures/diagrams
- Scanned copyrighted material distributed inside the application

Where an official table or figure is essential but cannot be reproduced, the application should provide:

- the official table/figure reference number;
- an original explanation of how it is used;
- an original worked example applying it;
- and, where permissible, an original simplified decision table or schematic that does not reproduce the protected work.

Recommended disclaimer:

> This application provides summarized engineering reference information. It does not replace official PEC, PGC, PDC, local regulations, authority-having-jurisdiction requirements, or professional engineering judgment.

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
│   └── Source-Family View
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
- Source/topic navigation
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

## 27.1 Existing-App Refocus and PEC Deep-Enrichment Upgrade

The application is already functioning. The next phase is a **scope refactor plus PEC deep-content upgrade**, not a greenfield rebuild.

### Required Scope Changes

1. Remove IEC and NEC as active content families from the user-facing product.
2. Rebrand the source structure around:
   - Philippine Electrical Code (PEC) — **Active**
   - Philippine Grid Code (PGC) — **Planned**
   - Philippine Distribution Code (PDC) — **Planned**
3. Preserve useful existing navigation/search infrastructure.
4. Remove forced IEC/NEC/PEC comparison UI.
5. Replace standards comparison with future cross-document relationship support.
6. Make PEC the default and only fully populated source for the current release.
7. Clearly label PGC and PDC as future modules rather than showing shallow placeholder technical content.

### Required PEC Toolkit Changes

Each completed PEC topic should support:

- detailed PEC requirement explanation;
- applicability and scope;
- key rules and thresholds;
- formulas and engineering relationships;
- variable definitions and units;
- original quick-reference tables;
- original figures/diagrams;
- at least one worked example where applicable;
- preferably two examples for major calculation topics;
- design workflows;
- decision tables;
- important exceptions;
- engineering notes;
- common mistakes;
- related PEC topics;
- exact PEC source references;
- verification metadata.

### PEC Content Quality Rule

A PEC topic is not complete merely because it contains:

```text
Article number
Section number
Short summary
```

A major topic should feel like a compact engineering handbook chapter and toolkit.

### First PEC Deep-Enrichment Batch

Fully implement these topics first:

1. Motor Full-Load Current / Current Basis
2. Motor Branch-Circuit Conductors
3. Motor Overload Protection
4. Motor Short-Circuit and Ground-Fault Protection
5. Conductor Ampacity
6. Temperature Correction and Adjustment
7. Voltage Drop
8. Grounding and Bonding Fundamentals
9. Generator Neutral Grounding / Separately Derived Systems
10. Transformer Primary and Secondary Protection
11. Working Clearances
12. Services and Service Equipment

Do not proceed to bulk topic expansion until these demonstrate the desired toolkit depth.

### Definition of Done for a Major PEC Topic

A major PEC topic should normally include:

```text
Detailed requirement explanation      ✓
Applicability                          ✓
Key requirements                       ✓
Formula(s) / relationship(s)          ✓ or N/A
Variable definitions                   ✓ or N/A
Quick-reference table                  ✓
Engineering figure                     ✓ or N/A
Worked example #1                      ✓
Worked example #2                      ✓ for major calculation topics
Design workflow                        ✓
Decision table                         ✓ where applicable
Important exceptions                   ✓
Common mistakes                        ✓
Related topics                         ✓
Exact PEC references                   ✓
Verification metadata                  ✓
```

If source material is insufficient for an exact technical claim, mark that item `needs-source` or `needs-verification` rather than inventing it.

---

## 28. Current Release Definition — PEC Toolkit

The current release should be considered:

> **A source-grounded Philippine Electrical Code engineering handbook and toolkit that combines detailed PEC explanations, formulas, tables, diagrams, worked examples, workflows, exceptions, and verified references for practical electrical engineering topics.**

The core workflow is:

```text
Engineering Problem
        ↓
Search / Browse
        ↓
PEC Topic
        ↓
Quick Answer
        ↓
Detailed PEC Requirement
        ↓
Formula / Table / Figure
        ↓
Worked Example
        ↓
Design Workflow
        ↓
Exceptions / Common Mistakes
        ↓
Official PEC Reference
```

Depth, engineering usefulness, and source traceability are more important than the number of topics.

---

## 29. Product Roadmap Summary

```text
Phase 1
PEC Deep Toolkit
Requirements + Tables + Formulas + Figures + Examples + Workflows

        ↓

Phase 2
PEC Coverage Expansion
Complete broader installation topics

        ↓

Phase 3
Philippine Distribution Code Toolkit

        ↓

Phase 4
Philippine Grid Code Toolkit

        ↓

Phase 5
Cross-Document Navigation
PEC ↔ PDC ↔ PGC

        ↓

Phase 6
Interactive Calculators and Guided Design Workflows

        ↓

Phase 7
Source-Grounded AI Philippine Electrical Assistant
```

---

## 30. Project Principle

The most important design principle for this project is:

> **Build a deep, source-grounded PEC knowledge base first. Add Grid Code and Distribution Code only after the PEC toolkit reaches the required depth. Build automation and AI on top of verified content later.**

A well-structured and carefully verified standards database will make future comparison tools, calculators, engineering workflows, and AI assistance substantially easier and safer to implement.
