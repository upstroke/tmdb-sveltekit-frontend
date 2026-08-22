set shell := ["zsh", "-cu"]

# Entwicklungsserver starten
dev:
	npm run dev

# Produktionsbuild erstellen
build:
	npm run build

# Produktionsbuild lokal anzeigen
preview:
	npm run preview

# SvelteKit-Projekt synchronisieren
prepare:
	npm run prepare

# Formatierung und Linting prüfen
lint:
	npm run lint

# Dateien mit Prettier formatieren
format:
	npm run format

# Formatierung und ESLint automatisch korrigieren
lint-fix:
	npm run lint:fix

# Vitest ausführen
test-vitest:
	npm run test:vitest

test-unit:
	npm run test:unit

test-components:
	npm run test:components

test-integration:
	npm run test:integration

test-acceptance:
	npm run test:acceptance

test-all:
	npm run test:all

# Vitest mit Coverage ausführen
test-coverage:
	npm run test:vitest:coverage

# Playwright Acceptance-Tests ausführen
test-acceptance-ui:
	npm run test:acceptance:ui
