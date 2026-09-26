# Voltwise — Electrical Engineering Toolkit

A desktop-friendly electrical standards quick-reference app based on `plan.md.md`. It contains 63 structured topics across eight engineering areas, with IEC, NEC, and PEC perspectives, engineering-language search, related-topic navigation, and a clear separation between requirements and explanatory guidance.

## Repository structure

- `frontend/` contains the React/Vite application and UI tests.
- `backend/` contains the public data contracts, structured catalog, service interface, mock backend, and service tests.

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

The included records are original summaries intended for product demonstration. Final engineering decisions must be checked against official standards, local regulations, and the authority having jurisdiction.
