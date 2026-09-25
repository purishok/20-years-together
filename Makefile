.DEFAULT_GOAL := help
.PHONY: help install backend frontend build test up down docker-backend docker-frontend logs

help:
	@printf '\n  20 років разом\n\n  make install          Встановити залежності\n  make backend          FastAPI → http://localhost:8000\n  make frontend         React   → http://localhost:5173\n  make up               Запустити два окремі Docker-контейнери\n  make down             Зупинити Docker-контейнери\n  make docker-backend   Запустити лише backend у Docker\n  make docker-frontend  Запустити лише frontend у Docker\n  make build            Зібрати frontend\n  make test             Перевірити backend і TypeScript\n  make logs             Переглянути логи Docker\n\n'

install:
	cd backend && uv sync --locked
	cd frontend && npm ci

backend:
	cd backend && uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

frontend:
	cd frontend && npm run dev -- --host 0.0.0.0

build:
	cd frontend && npm run build

test:
	cd backend && uv run pytest
	cd frontend && npm run typecheck

up:
	docker compose up --build -d
	@printf '\nСайт: http://localhost:8080\nAPI: http://localhost:8000/docs\n'

down:
	docker compose down

docker-backend:
	docker compose up --build -d backend

docker-frontend:
	docker compose up --build --no-deps -d frontend

logs:
	docker compose logs -f

