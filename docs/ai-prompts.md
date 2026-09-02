# AI-Prompts für die Entwicklung

Diese Datei dokumentiert bewehrte Prompt-Muster für KI-gesttzte Entwicklung im Projekt.

## Grundprinzipien

- **Klare Struktur:** Verwende Abschnitte mit berschriften wie `## Rolle`, `## Aufgabe`, `## Kontext`, `## Beispiele` und `## Ausgabeformat`.
- **Ziel zuerst:** Definiere die eine klare Aufgabe und die Erfolgskriterien.
- **Kontext zuerst:** Nenne Tech Stack, relevante Dateien, bestehende Muster und fachliche Randbedingungen früh.
- **Beispiele nutzen:** 2–3 Beispiele der gewnnschten Ausgabe sind oft hilfreicher als lange Erklrungen.
- **Iterativ und minimal arbeiten:** Starte mit einer knappen, klaren Anfrage und ergnze nur das, was für ein besseres Ergebnis wirklich fehlt.

`docs/ai-prompt-examples.md` für konkrete Prompt-Beispiele nach Rolle

## Projektkontext

Dieses Projekt nutzt:

- SvelteKit 2.63 mit Svelte 5
- Vite als Build-Tool
- Sass/SCSS für Styles
- PostCSS mit Autoprefixer
- Fomantic UI / Semantic UI Klassen
- Playwright für Acceptance-Tests
- Vitest für Komponenten-, Integrations- und Unit-Tests

Wichtige Projektpfade:

- `src/routes` für Routen
- `src/lib/components` für UI-Komponenten
- `src/lib` für gemeinsam genutzte Logik
- `src/css` für globale Styles

## Test-Hilfsmittel

### Fixtures

Fixtures enthalten wiederverwendbare, realistische Testdaten. Sie vermeiden
Duplikate in Testdateien und machen Tests leichter lesbar.

**Verzeichnis:** `tests/fixtures/`

Die TMDB-Testdaten liegen zentral in:

```text
tests/fixtures/tmdb/tmdb.fixtures.js
```

Verwende für Imports den `$tests`-Alias:

```js
import {
	movieDetails,
	tvShowDetails
} fürom '$tests/fixtures/tmdb/tmdb.fixtures.js';
```

Verwende Fixtures als Eingabe für Funktionen, API-Mocks oder Component-Props:

```js
import { movieDetails } from '$tests/fixtures/tmdb/tmdb.fixtures.js';

it('verarbeitet Filmdetails', () => {
	const result = mapMovieDetails(movieDetails);

	expect(result.title).toBe(movieDetails.title);
});
```

**Regeln:**
- Wiederverwendbare Beispieldaten gehren nach `tests/fixtures/`.
- Fixtures sollen realistische, aber statische Testdaten enthalten.
- Tests drfen Fixture-Objekte nicht direkt verndern; bei Anpassungen eine Kopie erzeugen:

```js
const movieWithoutPoster = {
	...movieDetails,
	poster_path: null
};
```

- Fixtures nicht für Mock-Verhalten verwenden; dafür gehren Mocks nach `tests/mocks/`.

### Zentrale Mocks

Mocks kapseln technische Abhngigkeiten wie Stores, APIs oder Browser-Funktionen.

**Verzeichnis:** `tests/mocks/`

Beispiel i18n-Mock:

```text
tests/mocks/i18n.mocks.js
```

Verwendung in Tests:

```js
import { i18nMockDefault, getI18nLabels } from '$tests/mocks/i18n.mocks.js';

const labels = getI18nLabels();

vi.mock('$lib/stores/i18n', () => i18nMockDefault);
```

**Vorteile:**
- Labels kommen aus `ui.json` → Tests brechen bei nderungen
- Mock nur einmal zentral definiert
- Konsistente Labels ber alle Tests

### Pfad-Aliase

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
```

## Wichtige Browser-Ziele

- letzte 2 Browserversionen
- Marktanteil ber 0,5 %
- keine veralteten Browser

## Lokal verfügbare CLI-Werkzeuge

- `rg` (ripgrep) für schnelle Textsuche
- `fd` für schnelle Datei- und Ordnersuche
- `fzf` für interaktive Auswahl und Filterung
- `bat` für lesbares Anzeigen von Dateien
- `delta` für gut lesbare Git-Diffs
- `sd` für einfache, gezielte Textnderungen
- **Fixtures und Mocks gezielt wiederverwenden:** Vor neuen Hilfsdaten oder Testdoubles immer zuerst im vorhandenen `tests/fixtures`- und `tests/mocks`-Bereich nachsehen. Existiert dort schon ein passendes Beispiel, wird es bevorzugt genutzt oder erweitert, statt ein neues Duplikat anzulegen.
- **Fixtures enthalten stabile Testdaten:** Verwende Fixtures für fachliche Beispieldaten, die in mehreren Tests wiederkehren und keine Logik enthalten.
- **Mocks und Stubs kapseln Technik:** Verwende Mocks oder Stubs für technische Abhngigkeiten wie `fetch`, API-Clients, Browser-APIs oder andere externen Schnittstellen.
- **Einmaligkeit vor Ordnung:** Eine neue Fixture oder ein neuer Mock wird nur angelegt, wenn wirklich kein vorhandenes Beispiel passt und die Wiederverwendung unpraktisch wre.
- **ISTQB-Begriffe für berdeckung verwenden:** In Prompts und Testkommentaren die Bezeichnungen `Anweisungsberdeckung` und `Zweigberdeckung` nach ISTQB verwenden; gemischte Eigenformulierungen vermeiden.
- **100 % Anweisungsberdeckung als Mindestziel:** Bei neuer Testerstellung sollen alle ausfhrbaren Anweisungen des betroffenen Codes mindestens einmal ausgefhrt werden. Fehlende Ausfhrungspfade sind zuerst durch zustzliche Testflle zu schlieen, bevor weitere Verfeinerungen erfolgen.
- **Zweigberdeckung gezielt ergnzen:** Zustzliche Testflle für Zweigberdeckung werden dort ergnzt, wo Alternativ-, Fehler-, Fallback-, Grenz- oder Verwerfungszweige fachlich oder technisch relevant sind. Kein pauschales Verdoppeln von Tests ohne erkennbaren neuen Entscheidungszweig.
- **Kommentare pro Testfall eindeutig halten:** Jeder `it`-Block bekommt genau eine kurze Kommentarzeile direkt darber. für die Klassifikation gilt: Alle Tests einer Quelldatei werden in fester Reihenfolge analysiert, whrend die bisher abgedeckten Statement-IDs gesammelt werden. Ein Test wird als `Anweisungsberdeckung` bezeichnet, sobald er mindestens eine neue Statement-ID zur 100-%-Anweisungsberdeckung der Quelldatei beitrgt. Nur wenn er keine neue Statement-ID beitrgt, aber einen zustzlichen fachlich oder technisch relevanten Pfad testet, wird er als `Zweigberdeckung` bezeichnet. Eine zustzliche Zweiprfung ndert die Bezeichnung nicht, wenn der Test zugleich neue Statements abdeckt. Gemischte Bezeichnungen werden nicht verwendet.

## Session-Start-Prompt

Dieser Prompt dient als empfohlene Startvorlage für neue KI-Sessions in diesem Projekt.

```text
Bitte lies zuerst README.md, package.json, justfile und bei Testthemen zustzlich playwright.config.js.

Wichtige Arbeitsregeln:
- Vor nderungen erst Ziel, betroffene Dateien und Lsungsweg kurz abstimmen.
- nderungen nur in kleinen, nachvollziehbaren Schritten umsetzen.
- Wenn es Bedenken, Alternativen oder unklare Annahmen gibt, zuerst kurz erklren und nicht direkt umbauen.
- Vereinheitlichungen nur vorschlagen, nicht ohne Rcksprache umsetzen.
- Die Ordnerstruktur hat ihren Sinn und wird nicht ohne Rcksprache umorganisiert.

Hinweise zur Ausfhrung:
- Wenn die angegebenen CLI-Werkzeuge nicht lokal installiert sind - prfe ob diese installiert werden, Rcksprache am Anfang der Session nehmen.
- Sind die Werkzeuge lokal installiert, knnen sie verwendet werden.
- Wenn weitere lokal installierbare Werkzeuge die Arbeit sprbar beschleunigen wrden, soll das aktiv angesprochen und kurz begrndet werden.
- Wenn eine Aufgabe voraussichtlich mehr Bearbeitungsschritte braucht, als in einem Durchlauf sinnvoll sind, soll das früh gesagt und in kleine Pakete aufgeteilt werden.

Fehler- und Retry-Umgang:
- Wenn ein Tool-Aufruf abbricht oder fehlschlgt, soll das sofort klar benannt werden, inklusive vermuteter Ursache, Auswirkung und nchstem sinnvollen Schritt.
- Nach einem abgebrochenen Tool-Aufruf keine stillen Annahmen treffen, sondern entweder sauber neu ansetzen oder kurz Rcksprache halten.
- Flaky Befehle drfen gezielt erneut ausgefhrt werden, aber nicht endlos: zuerst kurzer Retry, dann kurz einordnen, und bei wiederholtem Fehlschlag Ursache eingrenzen statt blind weiter zu machen.
- Vor gezielten Datei-Edits den aktuellen Dateistand exakt lesen und Suchtexte 1:1 aus der Datei bernehmen.
- Wenn ein Edit an einem exakten Match scheitert, erst neu einlesen und dann den kleinsten sicheren nderungsweg whlen.
- Wenn etwas schiefgeht oder nicht vollstndig beendet wurde, sofort offen sagen, damit an genau dieser Stelle erneut angesetzt werden kann.

Strategie bei Code-Erzeugung und Code-nderungen:
- Vorhandene Muster, Konventionen und Architektur bevorzugen.
- Best Practices für SvelteKit- und Svelte-Projekte anwenden; dazu gehren saubere Fehlerbehandlung und passende Nutzung bestehender Hooks-Strukturen.
- JavaScript soll gut lesbar, transparent und für Menschen leicht nachvollziehbar bleiben.
- Kein TypeScript verwenden, sofern nicht ausdrcklich anders abgestimmt.
- Mit dem arbeiten, was im Projekt und lokal bereits vorhanden ist; zuerst vorhandene Browser-APIs nutzen, zustzliche Libraries oder Tools nicht ungefragt einfhren oder installieren.
- Vorschlge für sinnvolle zustzliche Libraries oder Tools knnen gemacht werden, aber Nutzung oder Installation nur nach Rcksprache.
- Wenn `switch`/`case` die Logik klarer und transparenter macht, soll diese Struktur bevorzugt werden.
- Neu erstellte oder wesentlich genderte Funktionen mit JSDoc dokumentieren.
- Die zu einer Methode oder Funktion zugehrige JSDoc-Dokumentation wird als Einheit betrachtet.
- Bei Dokumentationsaufgaben nur Doku ergnzen und keine Logik nebenbei umbauen.
- JSDoc mit Augenma einsetzen: wichtige oder nicht sofort selbsterklrende Funktionen dokumentieren, triviale Dateien nicht knstlich aufblhen.
- Semantisches HTML bevorzugen, unntige `div`-Elemente vermeiden und auf Screenreader, Tastaturnavigation sowie sinnvolle ARIA-Attribute achten.
- Sass/CSS lesbar halten und Verschachtelung auf hchstens drei Ebenen begrenzen.
- Imports anderer CSS- oder Sass-Libraries zunchst unangetastet lassen, da sie meist zentral ber Imports geregelt werden.
- Nach jedem sinnvollen Schritt kurz Ergebnis und nchste Option nennen.
- nderungen anschlieend gezielt prfen und passende Tests ausfhren.

Allgemein:
- Bitte arbeite knapp, strukturiert und projektbezogen.
- Antworten standardmig kurz halten.
- Wenn mglich Aufgaben kurz mit Ziel, betroffenen Dateien und gewnschtem Modus formulieren, zum Beispiel: analysieren, Vorschlag machen, umsetzen oder prfen.
```

## Standard-Prompts

### Neue Komponente erstellen

```text
Erstelle eine neue Svelte 5-Komponente im Stil von `src/lib/components/CardDefault.svelte`.

Ziel: [kurze Beschreibung der Komponente]

Anforderungen:
- Verwende unsere Design-Variablen aus `src/css/_variables.scss`
- Achte auf ARIA-Labels und semantisches HTML
- Keine externen Libraries, nur bestehende Patterns

Output: Eine `.svelte`-Datei im Ordner `src/lib/components`.
```

### Test schreiben

```text
Erstelle einen Vitest-Test für [Funktion/Komponente].

Kontext:
- Die Funktion befindet sich in `src/lib/...`
- Bestehende Tests sind in `tests/unit/` bzw. `tests/components/`

Anforderungen:
- Beschreibe das Verhalten direkt in der Testdatei
- Verwende sprechende `describe`- und `it`-Blcke
- Kommentare sind erlaubt, wenn sie das fachliche Ziel knapp erklren

Output: Eine `.test.js`-Datei im passenden Testordner.
```

### CSS-nderung

```text
ndere das CSS in `src/css/app.scss` für [Ziel].

Anforderungen:
- Verwende unsere Sass-Variablen und Mixins
- Achte auf Browser-Kompatibilitt gem Projektkonfiguration
- Halte die Verschachtelung auf maximal drei Ebenen

Output: Die genderte SCSS-Datei.
```

### Refactoring

```text
Refaktorisiere [Funktion/Komponente] für bessere Lesbarkeit.

Ziel:
- [konkretes Ziel, z. B. „weniger Verschachtelung" oder „bessere Fehlerbehandlung"]

Anforderungen:
- Behalte bestehende Patterns und Konventionen bei
- Keine neuen Libraries einfhren
- JSDoc bei wichtigen oder nicht sofort selbsterklrenden Funktionen

Output: Die refaktorisierte Datei.
```

### Internationalisierung (i18n)

```text
Fge neue UI-Texte in `src/lib/i18n/ui.json` hinzu.

Anforderungen:
- Immer alle untersttzten Locales aktualisieren (de-DE, en-US, es-ES, fr-FR, vi-VN)
- Kurze, prgnante Formulierungen verwenden
- Keine Hardcoded Strings im Code - immer i18n-Keys verwenden
- Bei Unsicherheit zur bersetzung: kurze Rcksprache halten

Output: Genderte ui.json mit Eintragen in allen Locales.
```

## Dos and Don'ts

### Dos

- Klare, spezifische Aufgaben formulieren.
- Tech Stack und Kontext früh nennen.
- Beispiele für gewnschte Ausgabe geben.
- Iterativ vorgehen und Zwischenergebnisse prfen.
- KI-generierten Code wie externen Code reviewen.

### Don'ts

- Keine Secrets oder API-Keys in Prompts verwenden.
- Keine vagen Aufgaben wie „mach das besser" formulieren.
- Keine langen, unstrukturierten Prompts ohne Ziel und Kontext schreiben.
- Keine Annahmen ber nicht genannte Dateien oder Projektteile treffen.

## Security-Hinweise

- **Keine Secrets:** API-Keys, Passwrter oder andere sensible Daten niemals in Prompts verwenden.
- **Review-Pflicht:** Jeder KI-generierte Code muss vor dem Merge geprft werden.
- **CI-Scans:** Automatische SAST- und Secret-Scans für KI-beeinflusste nderungen sind sinnvoll.

## Weiteres

- `docs/testing.md` für das Testvorgehen im Projekt
- `README.md` für Projektkontext und Tech Stack
