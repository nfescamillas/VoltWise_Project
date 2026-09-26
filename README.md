# Voltwise — Electrical Engineering Toolkit

A desktop-friendly electrical standards quick-reference app based on `plan.md.md`. It contains 63 structured topics across eight engineering areas, with IEC, NEC, and PEC perspectives, engineering-language search, related-topic navigation, and a clear separation between requirements and explanatory guidance.

## Repository structure

- `frontend/` contains the React/Vite application and UI tests.
- `backend/` contains the TypeScript service contract and mock plus a FastAPI HTTP implementation with an in-memory catalog and bearer authentication.

Every data operation used by the UI is defined by `ElectricalToolkitService` in `backend/src/services/`. The frontend reaches it only through `frontend/src/services/index.ts`. The current app injects `MockElectricalToolkitService`, an asynchronous, defensive-copying in-memory backend. A future HTTP or desktop database adapter can replace the backend binding without changing UI components.

## Run

```bash
npm install
npm run dev
```

## Verify

```bash
npm test
npm run lint
npm run build
```

## FastAPI backend

```bash
cd backend
uv sync --dev
uv run uvicorn app.main:app --reload
```

The API is served below `/api/v1`, with interactive documentation at `/docs`.
Catalog endpoints match `openapi.yaml` and are public. Authentication helpers are
available at `/api/v1/auth/register`, `/api/v1/auth/token`, and the bearer-protected
`/api/v1/auth/me`. The seeded development login is `demo` / `voltwise-demo`.
Set `VOLTWISE_TOKEN_SECRET` to a strong private value outside local development.

Run its tests with `cd backend && uv run pytest`.

The included records are original summaries intended for product demonstration. Final engineering decisions must be checked against official standards, local regulations, and the authority having jurisdiction.
