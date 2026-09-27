# Philippine Electrical Engineering Toolkit

A PEC-first electrical engineering handbook and toolkit based on `plan_v3.md`. The active module is the Philippine Electrical Code (PEC). Philippine Distribution Code (PDC) and Philippine Grid Code (PGC) appear only as planned source families because they govern different system roles and have not yet been curated.

The initial catalog contains the twelve priority PEC topics. Nine chapters are now fully structured: **Motor Full-Load Current / Current Basis**, **Motor Branch-Circuit Conductors**, **Motor Overload Protection**, **Motor Short-Circuit and Ground-Fault Protection**, **Conductor Ampacity**, **Temperature Correction / Adjustment Factors**, **Voltage Drop**, **Grounding and Bonding Fundamentals**, and **Generator Neutral Grounding / Separately Derived Systems**. Each includes source-driven explanation, applicability, exact sections and supplied-PDF page locations, classified formulas, engineering and decision tables, original diagrams, two worked examples, workflows, exceptions, common mistakes, related topics, and an internal completeness gate. The conductor chapters also expose an interactive ampacity and voltage-drop worksheet whose official table values remain explicit user inputs. Other priority topics remain visibly marked **Needs verification** until developed from the supplied source documents. IEC and NEC are not active content families.

## Repository structure

- `frontend/` contains the React/Vite application and UI tests.
- `backend/` contains the TypeScript service contract and mock plus a FastAPI HTTP implementation backed by SQLAlchemy and bearer authentication.

Every data operation used by the UI is defined by `ElectricalToolkitService` in `backend/src/services/`. The frontend reaches it only through `frontend/src/services/index.ts`, which now binds the UI to `HttpElectricalToolkitService`. The mock remains available for deterministic tests and offline development scenarios.

Rich topic records live in `backend/src/data/catalog.ts` and the focused `backend/src/data/motorChapters.ts` module. Catalog integrity checks in `backend/src/data/validateCatalog.ts` cover identifiers, related-topic links, editions and references, formula and table schemas, diagram assets, placeholders, review statuses, and verification metadata.

## Run

```bash
make install
make api
# In another terminal:
make run
```

Run `make help` to see every available development command. If GNU Make is not
installed, the equivalent commands are `npm install` and `npm run dev`.

## Verify

```bash
make verify
```

This runs the npm workspace tests and type checks, then builds the production
frontend. The individual targets are `make test`, `make lint`, and `make build`.

## FastAPI backend

```bash
make api-install
make api
```

The API is served below `/api/v1`, with interactive documentation at `/docs`.
The Vite development server proxies `/api` to `http://127.0.0.1:8000`. For a
separately hosted API, set `VITE_API_BASE_URL` to its full `/api/v1` URL when
building or starting the frontend.
Catalog endpoints match `openapi.yaml` and are public. Authentication helpers are
available at `/api/v1/auth/register`, `/api/v1/auth/token`, and the bearer-protected
`/api/v1/auth/me`. The seeded development login is `demo` / `voltwise-demo`.
Set `VOLTWISE_TOKEN_SECRET` to a strong private value outside local development.

The API reads its SQLAlchemy connection URL from `DATABASE_URL`. It
defaults to `sqlite:///backend/voltwise.db`, creates the schema on startup, and
idempotently seeds the reference catalog and development login when the database
is empty. For example:

```bash
DATABASE_URL=sqlite:///./voltwise.db make api
```

The persistence layer uses portable SQLAlchemy models and sessions. To use a
different database later, provide its SQLAlchemy URL and install the appropriate
driver; API and repository code do not depend on SQLite-specific SQL.

Run its tests with `make api-test`. Without GNU Make, run `uv sync --dev`,
`uv run uvicorn app.main:app --reload`, and `uv run pytest` from `backend/`.

## Docker

Build the frontend and run it with the FastAPI backend in one image:

```bash
docker build -t voltwise .
docker run --rm -p 8000:8000 -v voltwise-data:/data voltwise
```

Open `http://localhost:8000`. The named volume preserves the default SQLite
database between containers. Set `DATABASE_URL` at runtime to use another
SQLAlchemy-compatible database.

The included records are original summaries intended for product demonstration. Final engineering decisions must be checked against official standards, local regulations, and the authority having jurisdiction.
