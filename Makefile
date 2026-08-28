SHELL := /bin/bash

COMPOSE := docker compose
BE := apps/be

.DEFAULT_GOAL := help

.PHONY: help db-up db-down db-reset db-migrate db-generate db-studio

help:
	@echo "Available targets:"
	@echo "  make db-reset     Wipe postgres volume, start DB, migrate from 0000"
	@echo "  make db-up        Start postgres container"
	@echo "  make db-down      Stop postgres container"
	@echo "  make db-migrate   Apply drizzle migrations"
	@echo "  make db-generate  Generate drizzle migration from schema"
	@echo "  make db-studio    Open drizzle studio"

db-up:
	$(COMPOSE) up -d postgres

db-down:
	$(COMPOSE) down

db-reset:
	$(COMPOSE) down -v
	$(COMPOSE) up -d postgres
	@echo "waiting for postgres to be healthy..."
	@for i in $$(seq 1 30); do \
		$(COMPOSE) exec -T postgres pg_isready -U admin -d simonjp >/dev/null 2>&1 && break; \
		sleep 2; \
	done
	cd $(BE) && bun run db:migrate

db-migrate:
	cd $(BE) && bun run db:migrate

db-generate:
	cd $(BE) && bun run db:generate

db-studio:
	cd $(BE) && bun run db:studio
