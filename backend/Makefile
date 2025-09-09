# Makefile for Express Auth API Docker Management

.PHONY: help build up down logs shell db-shell migrate test clean

# Default target
help:
	@echo "Available commands:"
	@echo "  make run-local     - Start all services (production mode)"
	@echo "  make run-dev       - Start all services (development mode with hot reload)"
	@echo "  make down-local    - Stop and remove all containers"
	@echo "  make logs          - Show logs from all services"
	@echo "  make logs-app      - Show logs from app service only"
	@echo "  make logs-db       - Show logs from database service only"
	@echo "  make shell         - Open shell in app container"
	@echo "  make db-shell      - Open MySQL shell in database container"
	@echo "  make migrate       - Run Prisma migrations in container"
	@echo "  make test          - Run tests in container"
	@echo "  make clean         - Clean up containers, volumes, and images"
	@echo "  make build         - Build Docker images"

# Production mode
run-local:
	@echo "Starting production services..."
	docker-compose up -d app db
	@echo "Services started! API available at http://localhost:4000"

# Development mode
run-dev:
	@echo "Starting development services with hot reload..."
	docker-compose up -d app-dev db
	@echo "Development services started! API available at http://localhost:4001"

# Stop services
down-local:
	@echo "Stopping all services..."
	docker-compose down
	@echo "All services stopped"

# View logs
logs:
	docker-compose logs -f

logs-app:
	docker-compose logs -f app

logs-db:
	docker-compose logs -f db

# Container shells
shell:
	@echo "Opening shell in app container..."
	docker-compose exec app sh

db-shell:
	@echo "Opening MySQL shell..."
	docker-compose exec db mysql -u appuser -papppassword express_auth_boilerplate

# Database operations
migrate:
	@echo "Running Prisma migrations..."
	docker-compose exec app npx prisma db push
	@echo "Database migrations completed"

migrate-reset:
	@echo "Resetting database..."
	docker-compose exec app npx prisma migrate reset --force
	@echo "Database reset completed"

# Testing
test:
	@echo "Running tests in container..."
	docker-compose exec app npm test

# Build images
build:
	@echo "Building Docker images..."
	docker-compose build

# Cleanup
clean:
	@echo "Cleaning up containers, volumes, and images..."
	docker-compose down -v --rmi all
	docker system prune -f
	@echo "Cleanup completed"

# Quick development setup
dev-setup: build run-dev migrate
	@echo "Development environment ready!"
	@echo "API: http://localhost:4001"
	@echo "Database: localhost:3306"
	@echo "Run 'make logs' to see application logs"
