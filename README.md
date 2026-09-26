# Voltwise — Electrical Engineering Toolkit

A desktop-friendly electrical standards quick-reference app based on `plan_v2.md`. It contains 63 structured topics across eight engineering areas, with IEC, NEC, and PEC perspectives, engineering-language search, related-topic navigation, and a clear separation between requirements and explanatory guidance.

The first content-enrichment batch adds applicability, key requirements, formula metadata, original workflow tables and diagrams, worked examples, exceptions, mistakes, comparison data, and source-verification metadata to ten high-value topics. The first five toolkit topics also include visible step workflows, richer decision tables, and interactive motor-current or voltage-drop calculations where applicable; transformer current calculation is available on the transformer protection topic. Those records are intentionally marked **Needs source** until their detailed standard-specific rules are checked against official publications. The remaining locator records are visibly marked **Draft** and are not counted as reviewed content.

## Repository structure

- `frontend/` contains the React/Vite application and UI tests.
- `backend/` contains the TypeScript service contract and mock plus a FastAPI HTTP implementation with an in-memory catalog and bearer authentication.

Every data operation used by the UI is defined by `ElectricalToolkitService` in `backend/src/services/`. The frontend reaches it only through `frontend/src/services/index.ts`, which now binds the UI to `HttpElectricalToolkitService`. The mock remains available for deterministic tests and offline development scenarios.

Rich topic records live in `backend/src/data/enrichedContent.ts`. Catalog integrity checks in `backend/src/data/validateCatalog.ts` cover identifiers, related-topic links, editions and references, formula and table schemas, diagram assets, placeholders, review statuses, and verification metadata.

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

Run its tests with `make api-test`. Without GNU Make, run `uv sync --dev`,
`uv run uvicorn app.main:app --reload`, and `uv run pytest` from `backend/`.

The included records are original summaries intended for product demonstration. Final engineering decisions must be checked against official standards, local regulations, and the authority having jurisdiction.
