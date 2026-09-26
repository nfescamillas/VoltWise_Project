# Voltwise Project Instructions

## Project purpose

Voltwise is an electrical standards quick-reference application based on `plan_v2.md`. It helps users navigate original summaries and reference locations for IEC, NEC/NFPA 70, and the Philippine Electrical Code. It is not a certified design tool and must never imply that its summaries replace official publications, local rules, an authority having jurisdiction, or professional engineering judgment.

## Repository layout

- `frontend/`: React, TypeScript, Vite, UI components, pages, styles, and UI tests.
- `backend/`: Shared data contracts, structured topic catalog, the service interface, mock service implementation, and service tests.
- `plan_v2.md`: Current product specification and roadmap.
- `plan.md`: Original product specification retained for reference.
- `README.md`: Developer setup and architecture overview.
- `Makefile`: Repository-wide development command shortcuts.

Keep frontend-only files in `frontend/` and backend/data-access files in `backend/`. Root files should be limited to workspace configuration, documentation, and repository-wide tooling.

## Architecture rules

1. All frontend data access must pass through `frontend/src/services/index.ts`.
2. UI components and pages must not import `backend/src/data/catalog.ts` or a mock implementation directly.
3. The backend package exposes its supported API through `backend/src/index.ts`; avoid deep imports across workspace boundaries.
4. `ElectricalToolkitService` is the backend contract. Preserve that interface when adding an HTTP, database, or desktop adapter.
5. The mock implementation must keep the complete app usable without a real backend or network connection.
6. Keep standards and topic content as structured records, never embedded in React components.
7. Edition information belongs to each topic-standard record and must not be inferred from UI labels.

## Content and safety rules

- Summarize standards in original language; do not reproduce copyrighted code text or long verbatim extracts.
- Clearly distinguish requirements, engineering explanations, notes, and common mistakes.
- Store a reference, edition, review status, and last-reviewed date for every topic-standard record.
- Treat new or changed technical content as unverified until checked against the correct official edition.
- Never present a design recommendation as a mandatory code requirement.
- Preserve the application disclaimer on user-facing reference surfaces.

## Development commands

Run commands from the repository root:

- `make help` — list the available development commands.
- `make install` — install and link both npm workspaces.
- `make run` — start the frontend development server (`make dev` is an alias).
- `make test` — run frontend and TypeScript backend tests.
- `make lint` — type-check both npm workspaces.
- `make build` — build the production frontend.
- `make verify` — run tests, lint, and the production build.
- `make api-install` — install FastAPI development dependencies.
- `make api` — start the FastAPI development server.
- `make api-test` — run the FastAPI test suite.

The underlying npm and `uv` commands remain valid when GNU Make is unavailable.

## Testing expectations

- Add or update backend tests for service behavior, filtering, search ranking, defensive copying, and relationship resolution.
- Add or update frontend tests for user-visible workflows and service integration.
- Run `make verify` after structural or behavior changes. When GNU Make is unavailable, run `npm test`, `npm run lint`, and `npm run build` directly.
- Keep tests deterministic and independent of network access or a real backend.

## UI conventions

- Preserve responsive behavior for desktop and compact layouts.
- Use accessible labels and semantic buttons for interactive controls.
- Reuse existing page, card, typography, spacing, and color patterns before adding new visual systems.
- Keep terminology concise and appropriate for practicing electrical engineers and technicians.
