# Development recipes
dev:
	@echo "Starting development server..."
	npm run dev

# Build recipes
build:
	@echo "Building project..."
	npm run build

preview:
	@echo "Starting preview server..."
	npm run preview

# Linting recipes
lint:
	@echo "Running linters..."
	npm run lint

format:
	@echo "Running formatters..."
	npm run format

# Testing recipes
test:
	@echo "Running all tests..."
	npm run test:all

test-unit:
	@echo "Running unit tests..."
	npm run test:unit

test-components:
	@echo "Running component tests..."
	npm run test:components

test-integration:
	@echo "Running integration tests..."
	npm run test:integration

test-acceptance:
	@echo "Running acceptance tests..."
	npm run test:acceptance

test-acceptance-ui:
	@echo "Running acceptance tests in UI mode..."
	npm run test:acceptance:ui

# Combined recipes
test-all:
	@echo "Running all tests..."
	npm run test:all

test-all-ui:
	@echo "Running all tests with UI..."
	npm run test:acceptance:ui
