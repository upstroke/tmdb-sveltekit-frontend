# TMDB SvelteKit Frontend

Ein SvelteKit-Frontend zum Durchsuchen von Filmen und Serien aus der TMDB-API.

Die Anwendung bietet eine Katalogansicht für Medieninhalte mit Trending-Bereichen, paginierten Listen, Detailseiten, lokalisierter Typeahead-Suche und Fallback-Mechanismen für fehlende Daten.

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
- lokalisierte Oberfläche mit Deutsch (`de-DE`), Englisch (`en-US`) und Vietnamesisch (`vi-VN`)
- Sprachwechsel über den globalen Header
- erneute Typeahead-Suche in der neu gewählten Sprache bei aktivem Suchbegriff
- Suchtreffer verwenden beim Klick die aktuell aktive Locale, auch wenn die Treffer vor dem Sprachwechsel geladen wurden
- Weitergabe der Locale über interne Navigation und serverseitige Datenabfragen
- Wiederherstellung der zuletzt besuchten Seite in paginierten Listen
- Duplikatbereinigung beim Nachladen von Daten
- gemeinsame Fallback-Logik für fehlende Bilder und Texte
- gemeinsamer Fehlerdialog für API- und Ladefehler
- mobiles Menü mit Click-outside-Schließen
- wiederverwendbare Komponenten für Karten, Suche, Pagination und Fehlerzustände

## Internationalisierung

Die Übersetzungskataloge liegen getrennt nach UI-Texten und Bewertungsformaten in:

- `src/lib/i18n/ui.json`
- `src/lib/i18n/ratings.json`

Die Locale-Logik befindet sich in:

- `src/lib/i18n/helpers.js` für unterstützte Locales und Fallbacks
- `src/lib/stores/locale.js` für den aktiven Sprachzustand
- `src/lib/stores/i18n.js` für den Zugriff auf die geladenen Übersetzungen

Aktuell werden `de-DE`, `en-US` und `vi-VN` unterstützt. Die Locale wird als `locale`-Query-Parameter in der URL geführt, damit Seiten, API-Routen, Navigation und Suchanfragen dieselbe Sprache verwenden.

Beim Sprachwechsel bleibt die aktuelle Route erhalten. Ist in der Typeahead-Suche ein Suchbegriff mit mindestens vier Zeichen vorhanden, werden die Ergebnisse automatisch mit der neuen Locale erneut geladen.

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

*Nachdem der API Key ergänzt wurde - die Datei in .env umbenennen.*

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

Die wichtigsten npm-Skripte für Formatierung und Codequalität sind:

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

Die `just`-Befehle sind Abkürzungen für die npm-Skripte aus `package.json`. Die eigentliche Befehlsdefinition bleibt daher in `package.json`; bei neuen oder geänderten npm-Skripten muss das `justfile` geprüft und gegebenenfalls ergänzt oder angepasst werden.

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
  components/
  integration/
  unit/
  fixtures/
  mocks/
  setup/

coverage/ (entsteht bei Bedarf)
playwright-report/ (entsteht bei Bedarf)
test-results/ (entsteht bei Bedarf)
```

## Testdokumentation
Diese Datei beschreibt das pragmatische Vorgehen für Tests <br>
[Testdokumentation und Testvorgehen](docs/testing.md)

## Bedeutung der wichtigsten Ordner

- `src/routes/` enthält Seiten und serverseitige Routen
- `src/lib/components/` enthält wiederverwendbare UI-Komponenten
- `src/lib/i18n/` enthält Übersetzungskataloge und Locale-Hilfslogik
- `src/lib/services/` enthält Service-Logik für externe Datenquellen wie TMDB
- `src/lib/stores/` enthält globale Zustände wie Locale und Übersetzungen
- `src/lib/utils/` enthält Hilfsfunktionen für Formatierung, Paging und Duplikatbehandlung
- `static/` enthält statische Assets
- `tests/` enthält alle automatisierten Tests nach Testebene strukturiert
- `coverage/` entsteht bei Bedarf durch Coverage-Läufe mit Vitest
- `playwright-report/` enthält die HTML-Ausgabe der Playwright-Tests
- `test-results/` enthält Laufzeit-Artefakte und Fehlerausgaben aus Playwright

## Seiten und Routen

- Die Startseite zeigt Trending-Inhalte und unterstützt das Nachladen weiterer Inhalte.
- Die Filmseite listet Film-Inhalte mit Pagination und Restore-Logik.
- Die Serienseite listet Serien-Inhalte mit derselben Pagination-Logik.
- Die Detailseiten zeigen Informationen zu Filmen und Serien inklusive Cast, Genres, Laufzeit und Produktionsfirmen.
- Die Suchroute versorgt die lokalisierte Typeahead-Suche in der Hauptnavigation.
- Der `locale`-Query-Parameter wird an Seiten, API-Routen und Detailnavigation weitergegeben.

## Zentrale Komponenten

- `HeaderMain` rendert die globale Navigation, den mobilen Menüschalter und den Sprachumschalter.
- `LanguageSwitcher` ändert die aktive Locale und lädt die aktuelle Route mit der neuen Sprache neu.
- `FooterMain` stellt den globalen Footer als eigene Layout-Komponente bereit.
- `DetailsHero` kapselt den gemeinsamen Hero-/Poster-Bereich der Film- und Serien-Detailseiten.
- `CardDefault` rendert eine Standard-Medienkarte.
- `CardFeatured` rendert eine hervorgehobene Medienkarte.
- `DialogMessage` zeigt Fehler in konsistenter Form an.
- `LoadMore` lädt weitere Einträge in paginierten Listen.
- `TypeHeadSearch` stellt die Live-Suche bereit, lokalisiert Suchergebnisse und startet die Suche nach einem Sprachwechsel erneut.

Globale Styles werden über `src/css/app.scss` geladen. Diese Datei bindet Fomantic UI, globale Sass-Variablen und anwendungsweite Styles ein; komponentenspezifische Styles bleiben in den jeweiligen `.svelte`-Komponenten.

Fallback-Bilder und Platzhaltertexte werden innerhalb der Komponenten zentral behandelt, damit dieselbe Logik nicht auf mehreren Seiten dupliziert werden muss.

## Wichtige Hilfsfunktionen

- `restorePagedList` stellt den Stand paginierter Listen aus dem Session Storage wieder her
- `getStoredPage` liest die zuletzt gespeicherte Seitenzahl einer Liste
- `deduplicateMedia` entfernt doppelte Medieneinträge anhand von `mediaType` und `id`
- `getMediaKey` erzeugt stabile Schlüssel für Medieneinträge
- `deduplicateById` entfernt doppelte Objekte anhand ihrer ID
- `formatDate` formatiert Datumswerte anhand der konfigurierten Locale
- `resolveLocale` validiert Locales und fällt bei unbekannten Werten auf die Standardsprache zurück

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

## Mobiles Menü

`HeaderMain` verwendet auf mobilen Ansichten eine Checkbox als Menüschalter. Ein `pointerdown`-Handler auf dem Window prüft, ob der Klick außerhalb des Headers stattfindet, und schließt ein geöffnetes Menü dann automatisch.

Klicks auf Burger und Navigation bleiben innerhalb des Headers und werden deshalb nicht als Außenklick behandelt.

## Qualitätssicherung

Vor einem Commit sollten mindestens folgende Befehle erfolgreich durchlaufen:

```bash
npm run lint
npm run build
npm test
```

`npm run lint` prüft Prettier und ESLint für den gesamten `src`-Ordner. Die Regel `svelte/no-navigation-without-resolve` ist deaktiviert, weil das Projekt interne und externe URLs abhängig vom jeweiligen Ziel unterschiedlich behandelt.

Bei Änderungen an Übersetzungen sollten alle unterstützten Locale-Kataloge auf identische Schlüssel geprüft werden.

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
2. Acceptance-Tests prüfen den vollständigen Nutzerfluss.
3. Komponenten- und Integrationstests prüfen das Zusammenspiel der beteiligten Teile.
4. Unit-Tests sichern reine Hilfsfunktionen und Randfälle ab.
