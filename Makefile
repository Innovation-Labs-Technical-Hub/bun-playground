.PHONY: help install dev build test lint clean \
       docker-up docker-down docker-logs docker-ps docker-build \
       k8s-dev k8s-prod k8s-delete \
       db-generate db-migrate db-push db-studio

COMPOSE_FILE := infrastructure/docker/docker-compose.yml
COMPOSE := docker compose -f $(COMPOSE_FILE)
K8S_DIR := infrastructure/k8s

# ========================
# General
# ========================

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install all dependencies
	bun install

dev: ## Start all services locally with Turbo
	bun run dev

build: ## Build all packages
	bun run build

test: ## Run all tests
	bun test --recursive

lint: ## Run ESLint across all workspaces
	bun run lint

clean: ## Remove dist, node_modules, docker volumes, sqlite dbs
	rm -rf node_modules apps/*/node_modules libs/*/node_modules services/*/node_modules
	rm -rf apps/*/dist libs/*/dist services/*/dist
	rm -f services/*/*.db
	$(COMPOSE) down -v 2>/dev/null || true

# ========================
# Prisma / Database
# ========================

db-generate: ## Generate Prisma clients for all services
	cd services/auth-service && bunx prisma generate
	cd services/core-service && bunx prisma generate

db-migrate: ## Run Prisma migrations for all services
	cd services/auth-service && bunx prisma migrate dev
	cd services/core-service && bunx prisma migrate dev

db-push: ## Push Prisma schema to database (no migration)
	cd services/auth-service && bunx prisma db push
	cd services/core-service && bunx prisma db push

db-studio: ## Open Prisma Studio (auth-service by default)
	cd services/auth-service && bunx prisma studio

# ========================
# Docker Compose
# ========================

docker-up: ## Start all services with Docker Compose
	$(COMPOSE) up --build -d

docker-down: ## Stop all Docker Compose services
	$(COMPOSE) down

docker-logs: ## Tail logs from all containers
	$(COMPOSE) logs -f

docker-ps: ## Show running containers
	$(COMPOSE) ps

docker-build: ## Build all Docker images
	$(COMPOSE) build

docker-restart: ## Restart all services
	$(COMPOSE) restart

docker-clean: ## Stop services and remove volumes
	$(COMPOSE) down -v

# ========================
# Kubernetes
# ========================

k8s-dev: ## Deploy to K8s with dev overlay
	kubectl apply -k $(K8S_DIR)/overlays/dev

k8s-prod: ## Deploy to K8s with prod overlay
	kubectl apply -k $(K8S_DIR)/overlays/prod

k8s-delete: ## Delete all K8s resources
	kubectl delete -k $(K8S_DIR)/overlays/dev 2>/dev/null || true
	kubectl delete -k $(K8S_DIR)/overlays/prod 2>/dev/null || true
	kubectl delete namespace bun-playground 2>/dev/null || true

k8s-status: ## Show K8s resource status
	kubectl get all -n bun-playground

.DEFAULT_GOAL := help
