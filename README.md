# TMDB SvelteKit Frontend

Ein SvelteKit-Frontend zum Durchsuchen von Filmen und Serien aus der TMDB-API.

Die Anwendung bietet eine klare Katalogansicht für Medieninhalte mit Trending-Bereichen, paginierten Listen, Detailseiten, Suche sowie Fallback-Mechanismen für fehlende Daten.

## Ziel des Projekts

Das Projekt dient als Frontend für eine TMDB-basierte Medienübersicht.

Im Fokus stehen:

- übersichtliche Darstellung von Filmen und Serien
- wiederverwendbare Svelte-Komponenten
- robuste Behandlung unvollständiger API-Daten
- saubere Trennung von UI, Hilfslogik und Service-Schicht
- testbare Architektur mit Acceptance-, Komponenten-, Integrations- und Unit-Tests

## Features

- Startseite mit Trending-Filmen und Trending-Serien
- getrennte Übersichtsseiten für Filme und Serien
- Detailseiten mit Bild, Metadaten, Cast und Produktionsinformationen
- Typeahead-Suche für Filme und Serien
- Wiederherstellung der zuletzt besuchten Seite in paginierten Listen
- Duplikatbereinigung beim Nachladen von Daten
- gemeinsame Fallback-Logik für fehlende Bilder und Texte
- gemeinsamer Fehlerdialog für API- und Ladefehler
- wiederverwendbare Komponenten für Karten, Suche, Pagination und Fehlerzustände

## Tech Stack

- SvelteKit 2.63
- Svelte 5
- Vite
- Fomantic UI / Semantic UI Klassen
- Playwright für Acceptance-Tests
- Vitest für Komponenten-, Integrations- und Unit-Tests
- Prettier und ESLint für Formatierung und Codequalität
- Sass für Styles

## Voraussetzungen

- Node.js `v26.6.0`
- npm `11.18.0`

## Umgebungsvariablen

Die benötigten Umgebungsvariablen sind in `.env.example` beschrieben.

Wichtig sind insbesondere:

- `TMDB_API_KEY`  
  API-Schlüssel für den Zugriff auf die TMDB-API

- `VITE_DATE_LOCALE`  
  Locale für die Datumsformatierung

## TMDB API Key

Einen eigenen API-Schlüssel kannst du in deinem TMDB-Konto anlegen:

- [TMDB API Settings](https://www.themoviedb.org/settings/api)
- [TMDB Getting Started](https://developer.themoviedb.org/docs/getting-started)

## Installation und Start

```bash
npm install
npm run dev
```

Alternativ können die wichtigsten Projektbefehle über `just` ausgeführt werden. Dafür muss `just` global installiert sein, zum Beispiel mit Homebrew:

```bash
brew install just
```

Das Projekt enthält dafür ein `justfile` im Projektstamm. Beispiele:

```bash
just dev
just build
just lint
just format
just test-vitest
just test-e2e
```

Die `just`-Befehle sind Abkürzungen für die npm-Skripte aus `package.json`. Die eigentliche Befehlsdefinition bleibt daher in `package.json`; bei neuen oder geänderten npm-Skripten muss das `justfile` geprüft und gegebenenfalls ergänzt oder angepasst werden.

## Für einen Produktionsbuild

```bash
npm run build
npm run preview
```

## Projektstruktur

```text
src/
  routes/
  lib/
    components/
    services/
    utils/

static/

tests/
  acceptance/
  components/
  integration/
  unit/
  fixtures/
  mocks/
  setup/

coverage/
playwright-report/
test-results/
```

## Bedeutung der wichtigsten Ordner

- `src/routes/` enthält Seiten und serverseitige Routen
- `src/lib/components/` enthält wiederverwendbare UI-Komponenten
- `src/lib/services/` enthält Service-Logik für externe Datenquellen wie TMDB
- `src/lib/utils/` enthält Hilfsfunktionen für Formatierung, Paging und Duplikatbehandlung
- `static/` enthält statische Assets
- `tests/` enthält alle automatisierten Tests nach Testebene strukturiert
- `coverage/` enthält die von Vitest erzeugten Coverage-Berichte
- `playwright-report/` enthält die HTML-Ausgabe der Playwright-Tests
- `test-results/` enthält Laufzeit-Artefakte und Fehlerausgaben aus Playwright

## Seiten und Routen

- Die Startseite zeigt Trending-Inhalte und unterstützt das Nachladen weiterer Inhalte.
- Die Filmseite listet Film-Inhalte mit Pagination und Restore-Logik.
- Die Serienseite listet Serien-Inhalte mit derselben Pagination-Logik.
- Die Detailseiten zeigen Informationen zu Filmen und Serien inklusive Cast, Genres, Laufzeit und Produktionsfirmen.
- Die Suchroute versorgt die Typeahead-Suche in der Hauptnavigation.

## Zentrale Komponenten

- `HeaderMain` rendert die globale Navigation und erhält die Navigationslinks über die `navItems`-Prop.
- `FooterMain` stellt den globalen Footer als eigene Layout-Komponente bereit.
- `DetailsHero` kapselt den gemeinsamen Hero-/Poster-Bereich der Film- und Serien-Detailseiten.
- `CardDefault` rendert eine Standard-Medienkarte.
- `CardFeatured` rendert eine hervorgehobene Medienkarte.
- `DialogMessage` zeigt Fehler in konsistenter Form an.
- `LoadMore` lädt weitere Einträge in paginierten Listen.
- `TypeHeadSearch` stellt die Live-Suche bereit und wird im Header als Inhalt eingebunden.

Globale Styles werden über `src/css/app.scss` geladen. Diese Datei bindet Fomantic UI, globale Sass-Variablen und anwendungsweite Styles ein; komponentenspezifische Styles bleiben in den jeweiligen `.svelte`-Komponenten.

Fallback-Bilder und Platzhaltertexte werden innerhalb der Komponenten zentral behandelt, damit dieselbe Logik nicht auf mehreren Seiten dupliziert werden muss.

## Wichtige Hilfsfunktionen

- `restorePagedList` stellt den Stand paginierter Listen aus dem Session Storage wieder her
- `getStoredPage` liest die zuletzt gespeicherte Seitenzahl einer Liste
- `deduplicateMedia` entfernt doppelte Medieneinträge anhand von `mediaType` und `id`
- `getMediaKey` erzeugt stabile Schlüssel für Medieneinträge
- `deduplicateById` entfernt doppelte Objekte anhand ihrer ID
- `formatDate` formatiert Datumswerte anhand der konfigurierten Locale

## Fehlerbehandlung

- Fehlende API-Daten werden über die gemeinsame `DialogMessage`-Komponente sichtbar gemacht.
- Fehlende Bilder fallen auf ein gemeinsames Platzhalter-Asset zurück.
- Fehlende Textwerte werden in Komponenten und Detailseiten normalisiert.
- Listen- und Detailseiten bleiben nach Möglichkeit auch bei unvollständigen API-Antworten benutzbar.

## Pagination und Restore-Verhalten

- Der Pagination-Status wird im Session Storage gespeichert.
- Beim Zurückkehren auf eine Liste wird die zuletzt besuchte Seite wiederhergestellt.
- Die Restore-Logik lädt bei Bedarf weitere Seiten nach, bis der gespeicherte Zustand erreicht ist.
- Doppelte Medieneinträge werden vor dem Rendern gefiltert.
- Nach dem Nachladen wird zur ersten neu eingefügten Position gescrollt.

## Teststrategie

Die Teststruktur orientiert sich an Testarten und fachlicher Ebene, nicht an technischen Hilfsmitteln wie Mocks oder Fixtures.

### Testebenen

- `tests/acceptance/`  
  Acceptance-Tests mit Playwright für fachliche Nutzerflüsse

- `tests/components/`  
  Komponententests mit Vitest für isolierte Svelte-Komponenten

- `tests/integration/`  
  Integrationstests mit Vitest für Services, Feature-Logik und das Zusammenspiel mehrerer Teile

- `tests/unit/`  
  Kleine Unit-Tests für reine Hilfsfunktionen und klar isolierte Logik

### Hilfsordner

- `tests/fixtures/`  
  feste Testdaten, die in mehreren Tests wiederverwendet werden können

- `tests/mocks/`  
  Mock-Funktionen oder Ersatzverhalten für externe Abhängigkeiten

- `tests/setup/`  
  gemeinsame Test-Helfer und projektweite Testvorbereitung

Diese Ordner sind keine eigenen Testarten, sondern nur Hilfsstrukturen.

### Leitgedanke

Die Testabdeckung folgt möglichst nah der Praxis im agilen Entwicklungsalltag:

1. Eine User Story oder ein Use Case beschreibt das gewünschte Verhalten.
2. Akzeptanzkriterien und Checklisten konkretisieren die fachlichen Erwartungen.
3. Acceptance-Tests prüfen den Nutzerfluss.
4. Komponenten-, Integrations- und Unit-Tests sichern die technische Umsetzung gezielt ab.

### Namenskonventionen

#### Playwright

Acceptance-Tests werden mit `*.spec.js` benannt.

Beispiele:

- `search-flow.spec.js`
- `movie-details.spec.js`
- `load-more-flow.spec.js`

#### Vitest

Komponenten-, Integrations- und Unit-Tests werden mit `*.test.js` benannt.

Beispiele:

- `LoadMore.test.js`
- `tmdb-api.trending.test.js`
- `formatDate.test.js`

### Benennung von Testdateien

- Komponenten: nach dem Namen der Komponente  
  Beispiel: `LoadMore.test.js`

- Services oder Integrationsbereiche: nach Fachbereich oder Verhalten  
  Beispiel: `tmdb-api.search.test.js`

- Acceptance-Tests: nach Nutzerfluss oder Story  
  Beispiel: `search-flow.spec.js`

### Benennung innerhalb der Tests

- `describe()` benennt das getestete Objekt oder den fachlichen Bereich
- `it()` beschreibt genau ein Verhalten
- Testnamen sollen fachlich lesbar sein und nicht nur technische Details beschreiben

Gute Beispiele:

- `it('zeigt den Button an, wenn weitere Ergebnisse vorhanden sind')`
- `it('deaktiviert den Button während eines laufenden Ladevorgangs')`
- `it('liefert hasMore false auf der letzten Seite')`

### Praktische Regeln

- Eine Datei pro Komponente, Service-Bereich oder Nutzerfluss
- Erst aufteilen, wenn eine Datei fachlich zu groß wird
- Ein Test prüft genau ein Verhalten
- Fixtures und Mocks dienen nur als Hilfsmittel, nicht als Strukturkriterium

## Node.js-Skripte

Die wichtigsten `package.json`-Skripte:

- `npm run dev` startet den lokalen Entwicklungsserver
- `npm run build` erstellt einen Produktionsbuild
- `npm run preview` startet die lokale Produktionsvorschau
- `npm run prepare` führt den SvelteKit-Sync-Schritt nach der Installation aus
- `npm run lint` prüft Formatierung und ESLint-Regeln
- `npm run format` formatiert die Quelldateien mit Prettier
- `npm run lint:fix` formatiert und behebt Lint-Probleme automatisch
- `npm run dev:acceptance` startet die Anwendung auf festem Host und Port für Playwright
- `npm run test:acceptance` startet die Acceptance-Test-Suite
- `npm run test:acceptance:ui` startet Playwright mit UI
- `npm run test:vitest` führt alle Vitest-Tests aus
- `npm run test:vitest:watch` startet Vitest im Watch-Modus
- `npm run test:vitest:coverage` führt Vitest mit Coverage-Ausgabe aus
- `npm run test` ist ein Alias für den Vitest-Lauf

## Testausführung

### Vitest

Alle Vitest-Tests ausführen:

```bash
npm run test:vitest
```

Vitest im Watch-Modus:

```bash
npm run test:vitest:watch
```

Mit Coverage:

```bash
npm run test:vitest:coverage
```

### Playwright

Acceptance-Tests ausführen:

```bash
npm run test:acceptance
```

Mit interaktiver Playwright-Oberfläche:

```bash
npm run test:acceptance:ui
```

## Entwicklungsprinzipien

- Wiederverwendbare Komponenten statt duplizierter UI-Logik
- Klare Trennung zwischen Darstellung, Hilfslogik und Datenzugriff
- Robuste Behandlung fehlerhafter oder unvollständiger API-Daten
- Fachlich lesbare Tests mit klarer Zuordnung zu Testebene und Use Case
- Saubere und stabile Dateinamen für Komponenten, Services und Tests

## Weiterentwicklung

Sinnvolle nächste Ausbaustufen für das Projekt:

- zusätzliche Acceptance-Tests für zentrale Nutzerflüsse
- mehr Integrationstests für die TMDB-Service-Schicht
- gezielte Unit-Tests für isolierte Utilities
- Ausbau der README um Architektur- oder Deployment-Hinweise, falls das Projekt wächst
