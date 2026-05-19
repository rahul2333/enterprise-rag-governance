.PHONY: up down logs backend-test frontend-build migrate

up:
	docker compose up --build

down:
	docker compose down

logs:
	docker compose logs -f

migrate:
	docker compose run --rm backend alembic upgrade head

backend-test:
	docker compose run --rm backend pytest

frontend-build:
	docker compose run --rm frontend npm run build
