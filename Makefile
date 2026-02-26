.PHONY: help install dev-backend dev-frontend dev test clean docker-up docker-down

help:
	@echo "AI Market Pulse - Development Commands"
	@echo ""
	@echo "install          Install all dependencies (frontend + backend)"
	@echo "dev-backend      Start backend development server"
	@echo "dev-frontend     Start frontend development server"
	@echo "dev              Start both frontend and backend"
	@echo "test             Run all tests"
	@echo "clean            Clean build artifacts"
	@echo "docker-up        Start all services with Docker"
	@echo "docker-down      Stop all Docker services"

install:
	@echo "Installing backend dependencies..."
	cd backend && pip install -r requirements.txt
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "Installation complete!"

dev-backend:
	cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev-frontend:
	cd frontend && npm run dev

dev:
	@echo "Starting backend and frontend..."
	@echo "Backend: http://localhost:8000"
	@echo "Frontend: http://localhost:3000"
	@echo "API Docs: http://localhost:8000/docs"

test:
	@echo "Running backend tests..."
	cd backend && pytest
	@echo "Running frontend tests..."
	cd frontend && npm test

clean:
	@echo "Cleaning build artifacts..."
	rm -rf frontend/node_modules frontend/.next frontend/out
	rm -rf backend/__pycache__ backend/**/__pycache__
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	@echo "Clean complete!"

docker-up:
	docker-compose up -d
	@echo "Services started!"
	@echo "Backend: http://localhost:8000"
	@echo "Frontend: http://localhost:3000"
	@echo "PostgreSQL: localhost:5432"

docker-down:
	docker-compose down
	@echo "Services stopped!"
