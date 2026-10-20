COMPOSE ?= docker compose
SERVICE ?= app
IMAGE ?= good-beats:latest
PROD_CONTAINER ?= good-beats-production
PORT ?= 8080

.PHONY: help check-node docker-up docker-down docker-restart docker-logs docker-bash docker-build docker-prod docker-prod-run install dev host-install host-dev host-build host-preview build preview

help: ## Show available commands
	@awk 'match($$0, /^[a-zA-Z0-9_-]+:/) && match($$0, /## /) {name=substr($$0, 1, index($$0, ":")-1); description=substr($$0, RSTART+3); printf "\033[36m%-18s\033[0m %s\n", name, description}' $(MAKEFILE_LIST)

docker-up: ## Build and start the development container in the background
	$(COMPOSE) up --build -d

docker-down: ## Stop project containers (keeps the node_modules volume)
	$(COMPOSE) down
	@docker rm -f $(PROD_CONTAINER) >/dev/null 2>&1 || true

docker-restart: ## Restart the development container
	$(COMPOSE) restart $(SERVICE)

docker-logs: ## Follow development container logs
	$(COMPOSE) logs -f $(SERVICE)

docker-bash: ## Open a shell in the running development container
	$(COMPOSE) exec $(SERVICE) bash

docker-build: ## Build the development image
	$(COMPOSE) build $(SERVICE)

docker-prod: ## Build the production image
	docker build --target production -t $(IMAGE) .

docker-prod-run: docker-prod ## Build and run the production image on the configured host port
	docker run --rm --name $(PROD_CONTAINER) -p $(PORT):8080 $(IMAGE)

check-node: ## Check that the host Node.js version supports Vite 8
	@node -e 'const [major, minor] = process.versions.node.split(".").map(Number); if (!((major === 20 && minor >= 19) || (major === 22 && minor >= 12) || major > 22)) { console.error("Vite 8 needs Node.js 20.19+ or 22.12+; use make dev to run in Docker."); process.exit(1); }'

install: check-node ## Install locked npm dependencies locally
	npm ci
	@touch node_modules/.good-beats-installed

node_modules/.good-beats-installed: package.json package-lock.json | check-node
	npm ci
	@touch $@

dev: ## Start the Docker development stack and follow its logs
	$(COMPOSE) up --build

host-install: install ## Install dependencies for a host-native workflow

host-dev: node_modules/.good-beats-installed ## Start Vite directly on the host (requires supported Node.js)
	npm run dev

host-build: node_modules/.good-beats-installed ## Build assets directly on the host (requires supported Node.js)
	npm run build

host-preview: node_modules/.good-beats-installed ## Preview assets directly on the host (requires supported Node.js)
	npm run preview

build: docker-prod ## Build the production Docker image

preview: docker-prod-run ## Run the production image on localhost:8080 by default
