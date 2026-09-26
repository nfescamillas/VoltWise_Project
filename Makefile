.DEFAULT_GOAL := help

.PHONY: help install run dev build test lint verify api-install api api-test clean

help: ## Show the available commands
	@echo "Voltwise development commands:"
	@echo "  make install      Install frontend and TypeScript backend dependencies"
	@echo "  make run          Start the frontend development server"
	@echo "  make dev          Alias for make run"
	@echo "  make test         Run frontend and TypeScript backend tests"
	@echo "  make lint         Type-check both npm workspaces"
	@echo "  make build        Build the production frontend"
	@echo "  make verify       Run tests, lint, and the production build"
	@echo "  make api-install  Install the FastAPI development dependencies"
	@echo "  make api          Start the FastAPI development server"
	@echo "  make api-test     Run the FastAPI test suite"
	@echo "  make clean        Remove generated frontend build output"

install: ## Install npm workspace dependencies
	npm install

run: ## Start the frontend development server
	npm run dev

dev: run ## Alias for make run

test: ## Run npm workspace tests
	npm test

lint: ## Type-check both npm workspaces
	npm run lint

build: ## Build the production frontend
	npm run build

verify: test lint build ## Run all project verification checks

api-install: ## Install FastAPI development dependencies
	cd backend && uv sync --dev

api: ## Start the FastAPI development server
	cd backend && uv run uvicorn app.main:app --reload

api-test: ## Run the FastAPI test suite
	cd backend && uv run pytest

clean: ## Remove generated frontend build output
	node -e "require('fs').rmSync('frontend/dist', { recursive: true, force: true })"
