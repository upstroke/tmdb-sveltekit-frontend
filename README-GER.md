# TMDB SvelteKit Frontend

Ein SvelteKit-Frontend zum Durchsuchen von Filmen und Serien aus der TMDB-API.

Die Anwendung bietet eine Katalogansicht für Medieninhalte mit Trending-Bereichen, paginierten Listen, Detailseiten, lokalisierter Typeahead-Suche und Fallback-Mechanismen für fehlende Daten.

## Ziel des Projekts

Das Projekt dient als Frontend für eine TMDB-basierte Medien übersicht.

Im Fokus stehen:

- übersichtliche Darstellung von Filmen und Serien
- wiederverwendbare Svelte-Komponenten
- robuste Behandlung unvollst ändiger API-Daten
- saubere Trennung von UI, Hilfslogik und Service-Schicht
- testbare Architektur mit Acceptance-, Komponenten-, Integrations- und Unit-Tests
- Barrierefreiheit nach WCAG 2.2 AA durch automatisierte Tests

## Features

- Startseite mit Trending-Filmen und Trending-Serien
- getrennte Übersichtsseiten für Filme und Serien
- Detailseiten mit Bild, Metadaten, Cast und Produktionsinformationen
- Typeahead-Suche für Filme und Serien
- lokalisierte Oberfläche
- Sprachwechsel über den globalen Header
- erneute Typeahead-Suche in der neu gew ählten Sprache bei aktivem Suchbegriff
- Suchtreffer verwenden beim Klick die aktuell aktive Locale, auch wenn die Treffer vor dem Sprachwechsel geladen wurden
- Weitergabe der Locale über interne Navigation und serverseitige Datenabfragen
- Wiederherstellung der zuletzt besuchten Seite in paginierten Listen
- Duplikatbereinigung beim Nachladen von Daten
- gemeinsame Fallback-Logik für fehlende Bilder und Texte
- gemeinsamer Fehlerdialog für API- und Ladefehler
- wiederverwendbare Komponenten für Karten, Suche, Pagination und Fehlerzust ände

## Barrierefreiheit (Accessibility)

Das Projekt umfasst automatisierte Accessibility-Tests zur Sicherstellung der WCAG 2.2 AA-Konformit ät:

- **Accessibility-Checks** mit Playwright + axe-core (`@axe-core/playwright`) zur automatisierten Erkennung von WCAG A/AA-Verletzungen
- **Test-Dateien:** `tests/acceptance/accessibility/*.a11y.spec.js`
- **Testpl äne:** `tests/acceptance/accessibility/*-testplan.md`
- **Tags:** `@accessibility`, `@a11y`

### Accessibility-Tests ausf ühren

```bash
# Alle Accessibility-Tests
npx playwright test tests/acceptance/accessibility/

# Accessibility-Tests nach Tag
npx playwright test -g @accessibility
npx playwright test -g @a11y

# Kombiniert mit anderen Tags
npx playwright test -g "(?=.*@accessibility)(?=.*@homepage)"
```

Weitere Details findest du in `tests/acceptance/accessibility/accessibility-testplan.md` und `docs/testing.md`.

## Internationalisierung

Die Übersetzungskataloge liegen getrennt nach UI-Texten und Bewertungsformaten in:

- `src/lib/i18n/ui.json`
- `src/lib/i18n/ratings.json`

Die Locale-Logik befindet sich in:

- `src/lib/i18n/helpers.js` für unterst ützte Locales und Fallbacks
- `src/lib/stores/locale.js` für den aktiven Sprachzustand
- `src/lib/stores/i18n.js` für den Zugriff auf die geladenen Übersetzungen

Beim Sprachwechsel bleibt die aktuelle Route erhalten. Ist in der Typeahead-Suche ein Suchbegriff mit mindestens vier Zeichen vorhanden, werden die Ergebnisse automatisch mit der neuen Locale erneut geladen.

## Streaming-Daten

Die angezeigten Streaming-Anbieter und Watch-Links werden über die TMDB-API bereitgestellt. Die Streaming-Daten stammen von JustWatch und werden auf den Detailseiten für Filme und TV-Shows mit "Provided by JustWatch" gekennzeichnet.

## Testing-Hinweis

F ür Svelte-5-Komponententests unter Vitest wird das offizielle Vite-Plugin `svelteTesting()` aus `@testing-library/svelte/vite` verwendet. Es ergänzt die Testumgebung für DOM-basierte Svelte-Tests automatisch um Cleanup und die Browser-Resolver-Condition, damit UI-Tests unter `jsdom` korrekt die Browser-Variante der Svelte-Module laden.

## Tech Stack

- SvelteKit 2.63
- Svelte 5
- Vite
- Fomantic UI / Semantic UI Klassen
- Playwright f ür Acceptance-Tests (inklusive Accessibility)
- Vitest f ür Komponenten-, Integrations- und Unit-Tests
- Prettier und ESLint für Formatierung und Codequalit ät
- Sass f ür Styles

## Voraussetzungen

- Node.js `v26.6.0`
- npm `11.18.0`

## Umgebungsvariablen

Die benötigten Umgebungsvariablen sind in `.env.example` beschrieben.

Wichtig sind insbesondere:

- `TMDB_API_KEY`  
  API-Schl üssel für den Zugriff auf die TMDB-API

- `VITE_DEFAULT_LOCALE`  
  Locale f ür die Datumsformatierung

*Nachdem der API Key erg änzt wurde - die Datei in .env umbenennen.*

## TMDB API Key

Einen eigenen API-Schl üssel kannst du in deinem TMDB-Konto anlegen:

- [TMDB API Settings](https://www.themoviedb.org/settings/api)
- [TMDB Getting Started](https://developer.themoviedb.org/docs/getting-started)

## Installation und Start

```bash
npm install
npm run dev
```

Alternativ können die wichtigsten Projektbefehle über `just` ausgef ührt werden. Dafür muss `just` global installiert sein, zum Beispiel mit Homebrew:

```bash
brew install just
```

Das Projekt enth ält dafür ein `justfile` im Projektstamm. Beispiele:

```bash
just dev
just build
just lint
just format
just test-vitest
just test-e2e
```

Die wichtigsten npm-Skripte für Formatierung und Codequalit ät sind:

```bash
npm run format
npm run format:check
npm run lint:eslint
npm run lint
npm run lint:fix
```

- `npm run format` formatiert die Dateien unter `src` mit Prettier.
- `npm run format:check` prüft die Formatierung, ohne Dateien zu ändern.
- `npm run lint:eslint` führt ausschließlich ESLint für `src` aus.
- `npm run lint` kombiniert den Prettier-Check mit ESLint.
- `npm run lint:fix` formatiert den Quellcode und korrigiert mögliche ESLint-Probleme automatisch.

Die `just`-Befehle sind Abk ürzungen für die npm-Skripte aus `package.json`. Die eigentliche Befehlsdefinition bleibt daher in `package.json`; bei neuen oder ge änderten npm-Skripten muss das `justfile` geprüft und gegebenenfalls ergänzt oder angepasst werden.

## Produktionsbuild

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
    i18n/
    services/
    stores/
    utils/

static/

tests/
  acceptance/
    accessibility/
    loadmore/
    navigation/
  integration/
    components/
    routes/
  unit/
    routes/
    tmdb-api/
  fixtures/
  mocks/
  setup/

coverage/ (entsteht bei Bedarf)
playwright-report/ (entsteht bei Bedarf)
test-results/ (entsteht bei Bedarf)
```

## Testdokumentation

Diese Datei beschreibt das pragmatische Vorgehen für Tests  
[Testdokumentation und Testvorgehen](docs/testing.md)

## Bedeutung der wichtigsten Ordner

- `src/routes/` enth ält Seiten und serverseitige Routen
- `src/lib/components/` enth ält wiederverwendbare UI-Komponenten
- `src/lib/i18n/` enth ält Übersetzungskataloge und Locale-Hilfslogik
- `src/lib/services/` enth ält Service-Logik für externe Datenquellen wie TMDB
- `src/lib/stores/` enth ält globale Zust ände wie Locale und Übersetzungen
- `src/lib/utils/` enth ält Hilfsfunktionen für Formatierung, Paging und Duplikatbehandlung
- `static/` enth ält statische Assets
- `tests/` enth ält alle automatisierten Tests nach Testebene strukturiert
- `tests/acceptance/accessibility/` enth ält Accessibility-Tests mit axe-core
- `coverage/` entsteht bei Bedarf durch Coverage-L äufe mit Vitest
- `playwright-report/` enth ält die HTML-Ausgabe der Playwright-Tests
- `test-results/` enth ält Laufzeit-Artefakte und Fehlerausgaben aus Playwright

## Seiten und Routen

- Die Startseite zeigt Trending-Inhalte und unterst ützt das Nachladen weiterer Inhalte.
- Die Filmseite listet Film-Inhalte mit Pagination und Restore-Logik.
- Die Serienseite listet Serien-Inhalte mit derselben Pagination-Logik.
- Die Detailseiten zeigen Informationen zu Filmen und Serien inklusive Cast, Genres, Laufzeit und Produktionsfirmen.
- Die Suchroute versorgt die lokalisierte Typeahead-Suche in der Hauptnavigation.
- Der `locale`-Query-Parameter wird an Seiten, API-Routen und Detailnavigation weitergegeben.

## Zentrale Komponenten

- `HeaderMain` rendert die globale Navigation, den mobilen Menüschalter und den Sprachumschalter.
- `LanguageSwitcher` ändert die aktive Locale und l ädt die aktuelle Route mit der neuen Sprache neu.
- `FooterMain` stellt den globalen Footer als eigene Layout-Komponente bereit.
- `DetailsHero` kapselt den gemeinsamen Hero-/Poster-Bereich der Film- und Serien-Detailseiten.
- `CardDefault` rendert eine Standard-Medienkarte.
- `CardFeatured` rendert eine hervorgehobene Medienkarte.
- `DialogMessage` zeigt Fehler in konsistenter Form an.
- `LoadMore` l ädt weitere Eintr äge in paginierten Listen.
- `TypeHeadSearch` stellt die Live-Suche bereit, lokalisiert Suchergebnisse und startet die Suche nach einem Sprachwechsel erneut.

Globale Styles werden über `src/css/app.scss` geladen. Diese Datei bindet Fomantic UI, globale Sass-Variablen und anwendungsweite Styles ein; komponentenspezifische Styles bleiben in den jeweiligen `.svelte`-Komponenten.

Fallback-Bilder und Platzhaltertexte werden innerhalb der Komponenten zentral behandelt, damit dieselbe Logik nicht auf mehreren Seiten dupliziert werden muss.

## Wichtige Hilfsfunktionen

- `restorePagedList` stellt den Stand paginierter Listen aus dem Session Storage wieder her
- `getStoredPage` liest die zuletzt gespeicherte Seitenzahl einer Liste
- `deduplicateMedia` entfernt doppelte Medieneintr äge anhand von `mediaType` und `id`
- `getMediaKey` erzeugt stabile Schl üssel für Medieneintr äge
- `deduplicateById` entfernt doppelte Objekte anhand ihrer ID
- `formatDate` formatiert Datumswerte anhand der konfigurierten Locale
- `resolveLocale` validiert Locales und f ällt bei unbekannten Werten auf die Standardsprache zur ück

## Fehlerbehandlung

- Fehlende API-Daten werden über die gemeinsame `DialogMessage`-Komponente sichtbar gemacht.
- Fehlende Bilder fallen auf ein gemeinsames Platzhalter-Asset zur ück.
- Fehlende Textwerte werden in Komponenten und Detailseiten normalisiert.
- Listen- und Detailseiten bleiben nach Möglichkeit auch bei unvollst ändigen API-Antworten benutzbar.

## Pagination und Restore-Verhalten

- Der Pagination-Status wird im Session Storage gespeichert.
- Beim Zurückkehren auf eine Liste wird die zuletzt besuchte Seite wiederhergestellt.
- Die Restore-Logik l ädt bei Bedarf weitere Seiten nach, bis der gespeicherte Zustand erreicht ist.
- Doppelte Medieneintr äge werden vor dem Rendern gefiltert.
- Nach dem Nachladen wird zur ersten neu eingef ügten Position gescrollt.

## Mobiles Menü

`HeaderMain` verwendet auf mobilen Ansichten einen Button als Menüschalter. Ein `pointerdown`-Handler auf dem Window prüft, ob der Klick außerhalb des Headers stattfindet, und schließł ein ge öffnetes Menü dann automatisch.

Klicks auf Burger und Navigation bleiben innerhalb des Headers und werden deshalb nicht als Außenklick behandelt.

## Qualitätssicherung

Vor einem Commit sollten mindestens folgende Befehle erfolgreich durchlaufen:

```bash
npm run lint
npm run build
npm test
```

`npm run lint` prüft Prettier und ESLint für den gesamten `src`-Ordner. Die Regel `svelte/no-navigation-without-resolve` ist deaktiviert, weil das Projekt interne und externe URLs abh ängig vom jeweiligen Ziel unterschiedlich behandelt.

Bei Änderungen an Übersetzungen sollten alle unterst ützten Locale-Kataloge auf identische Schl üssel geprüft werden.

## Teststrategie

Die Teststruktur orientiert sich an Testarten und fachlicher Ebene, nicht an technischen Hilfsmitteln wie Mocks oder Fixtures.

### Testebenen

- `tests/acceptance/`  
  Acceptance-Tests (end2end) mit Playwright für fachliche Nutzerfl üsse

- `tests/acceptance/accessibility/`  
  Accessibility-Tests mit Playwright + axe-core für WCAG A/AA-Konformit ät

- `tests/integration/components/`  
  Komponententests mit Vitest für isolierte Svelte-Komponenten

- `tests/integration/`  
  Integrationstests mit Vitest für Services, Feature-Logik und das Zusammenspiel mehrerer Teile

- `tests/unit/`  
  Kleine Unit-Tests für reine Hilfsfunktionen und klar isolierte Logik

### Hilfsordner

- `tests/fixtures/`  
  feste Testdaten, die in mehreren Tests wiederverwendet werden können

- `tests/mocks/`  
  Mock-Funktionen oder Ersatzverhalten für externe Abh ängigkeiten

- `tests/setup/`  
  gemeinsame Test-Helfer und projektweite Testvorbereitung

Diese Ordner sind keine eigenen Testarten, sondern nur Hilfsstrukturen.

### Leitgedanke

Die Testabdeckung folgt möglichst nah der Praxis im agilen Entwicklungsalltag:

1. Eine User Story oder ein Use Case beschreibt das gewünschte Verhalten.
2. Acceptance-Tests prüfen den vollständigen Nutzerfluss.
3. Komponenten- und Integrationstests prüfen das Zusammenspiel der beteiligten Teile.
4. Unit-Tests sichern reine Hilfsfunktionen und Randf älle ab.
5. Accessibility-Tests prüfen die WCAG 2.2 AA-Konformit ät für Seiten und Interaktionen.
