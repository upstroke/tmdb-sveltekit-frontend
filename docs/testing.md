# Testdokumentation

Diese Datei beschreibt das pragmatische Vorgehen fuer Tests in diesem Projekt.

## Testarten

Das Projekt nutzt vier Testarten:

- Acceptance-Tests in `tests/acceptance/` mit Playwright
- Komponenten-Tests in `../tests/integration/components/` mit Vitest
- Integrations-Tests in `tests/integration/` mit Vitest
- Unit-Tests in `tests/unit/` mit Vitest

## Testbefehle

```bash
npm run test
npm run test:unit
npm run test:components
npm run test:integration
npm run test:acceptance
npm run test:vitest:coverage
```

## Pfad-Aliase

In `jsconfig.json` sind Aliase definiert:

```json
{
  "compilerOptions": {
    "paths": {
      "$tests": ["./tests"],
      "$tests/*": ["./tests/*"]
    }
  }
}
```

Damit kannst du in Tests schreiben:

```js
import { i18nMockDefault } from '$tests/mocks/i18n.mocks.js';
import { movieDetails } from '$tests/fixtures/tmdb/tmdb.fixtures.js';
import { cleanupAll } from '$tests/setup/test-utils.js';
```

## Fixtures

Fixtures enthalten wiederverwendbare, realistische Testdaten. Sie vermeiden
Duplikate in Testdateien und machen Tests leichter lesbar.

**Verzeichnis:** `tests/fixtures/`

### Vorhandene Fixtures

- `tests/fixtures/tmdb/tmdb.fixtures.js` - TMDB API Response-Daten
- `tests/fixtures/i18n.fixture.js` - i18n-Daten aus ui.json (Labels, Locales)
- `tests/fixtures/navItems.fixture.js` - Navigation Items fuer Header-Tests

### Verwendung

```js
import {
  movieDetails,
  tvShowDetails
} from '$tests/fixtures/tmdb/tmdb.fixtures.js';

it('verarbeitet Filmdetails', () => {
  const result = mapMovieDetails(movieDetails);

  expect(result.title).toBe(movieDetails.title);
});
```

### Regeln

- Wiederverwendbare Beispieldaten gehoeren nach `tests/fixtures/`.
- Fixtures sollen realistische, aber statische Testdaten enthalten.
- Tests duerfen Fixture-Objekte nicht direkt veraendern; bei Anpassungen eine Kopie erzeugen:

```js
const movieWithoutPoster = {
  ...movieDetails,
  poster_path: null
};
```

- Fixtures nicht fuer Mock-Verhalten verwenden; dafuer gehoeren Mocks nach `tests/mocks/`.
- **Fixtures enthalten stabile Testdaten:** Verwende Fixtures fuer fachliche Beispieldaten, die in mehreren Tests wiederkehren und keine Logik enthalten.

## Mocks

Mocks kapseln technische Abhaengigkeiten wie Stores, APIs oder Browser-Funktionen.

**Verzeichnis:** `tests/mocks/`

### Vorhandene Mocks

- `tests/mocks/i18n.mocks.js` - i18n Store Mock
- `tests/mocks/pages-media-data.mocks.js` - Paginierte Mediendaten Mocks

### Verwendung

```js
import { i18nMockDefault, getI18nLabels } from '$tests/mocks/i18n.mocks.js';

const labels = getI18nLabels();

vi.mock('$lib/stores/i18n', async () => ({
  i18n: {
    subscribe(run) {
      run({ labels: labels });
      return () => {};
    }
  }
}));
```

### Vorteile

- Labels kommen aus `ui.json` → Tests brechen bei Aenderungen
- Mock nur einmal zentral definiert
- Konsistente Labels ueber alle Tests

### Wichtiger Hinweis zu vi.mock

`vi.mock` muss **ganz oben** in der Test-Datei stehen und kann **keine Imports** verwenden!

**Richtig:**

```js
import { i18nData } from '$tests/fixtures/i18n.fixture.js';

vi.mock('$lib/stores/i18n', async () => ({
  i18n: {
    subscribe: (run) => {
      run({ labels: i18nData.labels });
      return () => {};
    }
  }
}));
```

**Falsch:**

```js
import { createI18nMock } from '$tests/mocks/i18n.mocks.js';

vi.mock('$lib/stores/i18n', () => createI18nMock()); // ❌ Error!
```

### Regeln

- **Mocks und Stubs kapseln Technik:** Verwende Mocks oder Stubs fuer technische Abhaengigkeiten wie `fetch`, API-Clients, Browser-APIs oder andere externen Schnittstellen.
- Mock-Logik bleibt in der Test-Datei (wegen `vi.mock` Einschraenkung).
- Fixture-Daten koennen importiert werden.

## Setup-Utilities

Setup-Utilities enthalten Helper-Funktionen fuer `beforeEach` und `afterEach` Bloecke.

**Verzeichnis:** `tests/setup/`

### Vorhandene Utilities

- `tests/setup/test-utils.js` - cleanupAll(), resetAll()
- `tests/setup/missing-api-key.helper.js` - Helper fuer API-Key-Tests

### Verwendung

```js
import { cleanupAll, resetAll } from '$tests/setup/test-utils.js';

describe('Component', () => {
  beforeEach(() => {
    resetAll();
  });

  afterEach(() => {
    cleanupAll();
  });

  it('test', () => {
    // Test code
  });
});
```

## Vorgehen bei Unit-Tests

Unit-Tests werden direkt als normale Vitest-Tests in `tests/unit/*.test.js` geschrieben.

Dabei gilt:

- Ein Test beschreibt sein Verhalten direkt in der Testdatei.
- Fachliche Varianten werden ueber sprechende `describe`- und `it`-Bloecke abgebildet.
- Zusaetzliche Metadateien oder ein Testgenerator werden nicht verwendet.
- Kommentare im Test sind erlaubt, wenn sie das fachliche Ziel eines Falls knapp erklaeren.
- Die Testdokumentation in der Testdatei soll die Testtechnik nennen und zusaetzlich kurz zwischen Happy Path und negativen bzw. Fallback-Faellen unterscheiden.

## Testdesign-Techniken

Je nach Funktion kommen unter anderem diese Techniken zum Einsatz:

- Aequivalenzklassen
- Grenzwertanalyse
- Anweisungsueberdeckung
- Zweigueberdeckung
- Zustandsbasierte Tests

Nicht jede Funktion benoetigt alle Techniken. Die gewaehlte Technik wird bei Bedarf direkt im Test oder in der fachlichen Doku knapp begruendet.

### ISTQB-Begriffe fuer Überdeckung verwenden

In Prompts und Testkommentaren die Bezeichnungen `Anweisungsueberdeckung` und `Zweigueberdeckung` nach ISTQB verwenden; gemischte Eigenformulierungen sind nicht erlaubt.

### 100 % Anweisungsüberdeckung als Mindestziel

Bei neuer Testerstellung sollen alle ausfuehrbaren Anweisungen des betroffenen Codes mindestens einmal ausgefuehrt werden. Fehlende Ausfuehrungspfade sind zuerst durch zusaetzliche Testfaelle zu schliessen, bevor weitere Verfeinerungen erfolgen.

### Zweigüberdeckung gezielt ergaenzen

Zusaetzliche Testfaelle fuer Zweigüberdeckung werden dort ergaenzt, wo Alternativ-, Fehler-, Fallback-, Grenz- oder Verwerfungszweige fachlich oder technisch relevant sind. Kein pauschales Verdoppeln von Tests ohne erkennbaren neuen Entscheidungszweig.

### Kommentare pro Testfall eindeutig halten

Jeder `it`-Block bekommt genau eine kurze Kommentarzeile direkt darueber. Fuer die Klassifikation gilt: Alle Tests einer Quelldatei werden in fester Reihenfolge analysiert, waehrend die bisher abgedeckten Statement-IDs gesammelt werden. Ein Test wird als `Anweisungsüberdeckung` bezeichnet, sobald er mindestens eine neue Statement-ID zur 100-%-Anweisungsueberdeckung der Quelldatei beiträgt. Nur wenn er keine neue Statement-ID beiträgt, aber einen zusaetzlichen fachlich oder technisch relevanten Pfad testet, wird er als `Zweigüberdeckung` bezeichnet. Eine zusaetzliche Zweipruefung aendert die Bezeichnung nicht, wenn der Test zugleich neue Statements abdeckt. Gemischte Bezeichnungen werden nicht verwendet.

## Coverage

Coverage wird mit Vitest und V8 erzeugt. Der Coverage-Report wird im Ordner `coverage/` abgelegt.

Coverage-Zahlen dienen als Orientierung und ergaenzen die fachliche Testfallauswahl. Sie ersetzen diese nicht.

## Rolle des Testers

Die fachliche Herleitung der Testfaelle bleibt Aufgabe des Testers.

Der Tester:

- waehlt ein geeignetes Testobjekt aus dem bestehenden Code aus,
- entscheidet, welche Testdesign-Technik fachlich sinnvoll ist,
- identifiziert relevante Testbedingungen, Risiken und Eingabeklassen,
- definiert konkrete Testfaelle und erwartete Ergebnisse,
- prueft die Resultate und verbessert die Tests bei Bedarf.

## Best Practices

- **Fixtures und Mocks gezielt wiederverwenden:** Vor neuen Hilfsdaten oder Testdoubles immer zuerst im vorhandenen `tests/fixtures`- und `tests/mocks`-Bereich nachsehen. Existiert dort schon ein passendes Beispiel, wird es bevorzugt genutzt oder erweitert, statt ein neues Duplikat anzulegen.
- **Einmaligkeit vor Ordnung:** Eine neue Fixture oder ein neuer Mock wird nur angelegt, wenn wirklich kein vorhandenes Beispiel passt und die Wiederverwendung unpraktisch waere.

## Weiteres

- `docs/ai-prompts.md` fuer allgemeine Prompt-Richtlinien
- `README.md` fuer Projektkontext und Tech Stack
- `docs/ai-prompt-examples.md` fuer konkrete Prompt-Beispiele nach Rolle
