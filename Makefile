.PHONY: help setup env docker-dev docker-dev-build docker-dev-logs docker-dev-down docker-prod docker-up docker-down docker-logs docker-restart clean-docker

# Variables
DOCKER_COMPOSE = docker compose
DOCKER_COMPOSE_DEV = docker compose -f docker-compose.dev.yml

# Default target
help:
	@echo "GitHubMon - Makefile Commands"
	@echo ""
	@echo "Environment Setup:"
	@echo "  make setup          - Complete Docker setup (env + build)"
	@echo "  make env            - Create .env.local from .env.example"
	@echo ""
	@echo "Docker - Development:"
	@echo "  make docker-dev         - Start development container"
	@echo "  make docker-dev-build   - Build and start dev container"
	@echo "  make docker-dev-logs    - Show dev container logs"
	@echo "  make docker-dev-down    - Stop dev container"
	@echo ""
	@echo "Docker - Production:"
	@echo "  make docker-prod        - Build and start production containers"
	@echo "  make docker-up          - Start production containers (no build)"
	@echo "  make docker-down        - Stop all containers"
	@echo "  make docker-logs        - Show production logs"
	@echo "  make docker-restart     - Restart production containers"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean-docker       - Remove all containers and volumes"
	@echo ""
	@echo "For development commands, use npm directly:"
	@echo "  npm install         - Install dependencies"
	@echo "  npm run dev         - Start development server"
	@echo "  npm run build       - Build for production"
	@echo "  npm run lint        - Run ESLint"
	@echo "  npm run format      - Format code with Prettier"

# Environment Setup
setup: env
	@echo "🔧 Setting up Docker environment..."
	@echo "✅ Setup complete! Edit .env.local with your credentials"
	@echo "Then run: make docker-dev"

env:
	@if [ ! -f .env.local ]; then \
		cp .env.example .env.local; \
		echo "✅ Created .env.local - Please edit it with your credentials"; \
	else \
		echo "⚠️  .env.local already exists"; \
	fi

# Docker - Development
docker-dev:
	@echo "🐳 Starting development container..."
	$(DOCKER_COMPOSE_DEV) up

docker-dev-build:
	@echo "🐳 Building and starting development container..."
	$(DOCKER_COMPOSE_DEV) up --build

docker-dev-logs:
	@echo "📋 Showing development container logs..."
	$(DOCKER_COMPOSE_DEV) logs -f

docker-dev-down:
	@echo "🛑 Stopping development container..."
	$(DOCKER_COMPOSE_DEV) down

# Docker - Production
docker-prod:
	@echo "🐳 Building and starting production containers..."
	$(DOCKER_COMPOSE) up --build -d
	@echo "✅ Production containers started. Visit http://localhost:3000"

docker-up:
	@echo "🐳 Starting production containers..."
	$(DOCKER_COMPOSE) up -d

docker-down:
	@echo "🛑 Stopping all containers..."
	$(DOCKER_COMPOSE) down
	$(DOCKER_COMPOSE_DEV) down

docker-logs:
	@echo "📋 Showing production logs..."
	$(DOCKER_COMPOSE) logs -f

docker-restart:
	@echo "🔄 Restarting production containers..."
	$(DOCKER_COMPOSE) restart

# Cleanup
clean-docker:
	@echo "🧹 Removing all containers and volumes..."
	$(DOCKER_COMPOSE) down -v
	$(DOCKER_COMPOSE_DEV) down -v
	docker system prune -f
	@echo "✅ Docker cleanup complete"

# Quick aliases
dev: docker-dev
prod: docker-prod
up: docker-up
down: docker-down
logs: docker-logs
restart: docker-restart