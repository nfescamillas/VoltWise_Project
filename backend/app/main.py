import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from .routers import auth, catalog, topics

DESCRIPTION = """
HTTP API for Voltwise's original electrical-standards quick-reference summaries.

The catalog does not replace official standards, local rules, an authority having
jurisdiction, or professional engineering judgment.
"""

app = FastAPI(
    title="Voltwise Electrical Toolkit API",
    version="0.1.0",
    description=DESCRIPTION,
)

API_PREFIX = "/api/v1"
app.include_router(catalog.router, prefix=API_PREFIX)
app.include_router(topics.router, prefix=API_PREFIX)
app.include_router(auth.router, prefix=API_PREFIX)


@app.get("/health", include_in_schema=False)
def health() -> dict[str, str]:
    return {"status": "ok"}


STATIC_DIR = Path(
    os.getenv(
        "VOLTWISE_STATIC_DIR",
        Path(__file__).resolve().parents[2] / "frontend" / "dist",
    )
)

# Mount the frontend last so API, documentation, and health routes take
# precedence. Development remains API-only until the Vite build exists.
if STATIC_DIR.is_dir():
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="frontend")

