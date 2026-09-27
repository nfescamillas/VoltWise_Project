FROM node:22-alpine AS frontend-builder

WORKDIR /build

COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package.json
COPY backend/package.json backend/package.json
RUN npm ci

COPY frontend frontend
COPY backend/src backend/src
COPY backend/tsconfig.json backend/tsconfig.json
RUN npm run build


FROM python:3.13-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    VOLTWISE_STATIC_DIR=/app/static \
    DATABASE_URL=sqlite:////data/voltwise.db

WORKDIR /app

COPY backend /app/backend
RUN pip install --no-cache-dir /app/backend \
    && useradd --create-home --uid 10001 voltwise \
    && mkdir /data \
    && chown voltwise:voltwise /data

COPY --from=frontend-builder /build/frontend/dist /app/static

USER voltwise
WORKDIR /app/backend

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
