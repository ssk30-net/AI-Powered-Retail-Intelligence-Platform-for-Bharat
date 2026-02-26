.PHONY: help install dev test lint format clean deploy

help:
	@echo "AI Market Pulse - Development Commands"
	@echo ""
	@echo "install       Install all dependencies"
	@echo "dev           Start development servers"
	@echo "test          Run all tests"
	@echo "lint          Run linters"
	@echo "format        Format code"
	@echo "clean         Clean build artifacts"
	@echo "deploy        Deploy to AWS"

install:
	npm install
	pip install -r requirements.txt

dev:
	npm run dev

test:
	npm test
	pytest

lint:
	npm run lint
	flake8 backend/
	mypy backend/

format:
	npm run format
	black backend/
	isort backend/

clean:
	rm -rf node_modules .next out build dist
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete

deploy:
	npm run deploy:infra
	npm run deploy:frontend
