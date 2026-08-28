# AI-Prompts für die Entwicklung

Diese Datei dokumentiert bewehrte Prompt-Muster für KI-gesttzte Entwicklung im Projekt.

## Grundprinzipien

- **Klare Struktur:** Verwende Abschnitte mit berschriften wie `## Rolle`, `## Aufgabe`, `## Kontext`, `## Beispiele` und `## Ausgabeformat`.
- **Ziel zuerst:** Definiere die eine klare Aufgabe und die Erfolgskriterien.
- **Kontext zuerst:** Nenne Tech Stack, relevante Dateien, bestehende Muster und fachliche Randbedingungen früh.
- **Beispiele nutzen:** 2–3 Beispiele der gewnüschten Ausgabe sind oft hilfreicher als lange Erklärungen.
- **Iterativ und minimal arbeiten:** Starte mit einer knappen, klaren Anfrage und ergänze nur das, was für ein besseres Ergebnis wirklich fehlt.

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

Wichtige Browser-Ziele:

- letzte 2 Browserversionen
- Marktanteil ber 0,5 %
- keine veralteten Browser

Lokal verfügbare CLI-Werkzeuge:

- `rg` (ripgrep) für schnelle Textsuche
- `fd` für schnelle Datei- und Ordnersuche
- `fzf` für interaktive Auswahl und Filterung
- `bat` für lesbares Anzeigen von Dateien
- `delta` für gut lesbare Git-Diffs
- `sd` für einfache, gezielte Textnderungen
- `just` für projektbezogene Befehle aus dem `justfile`

## Session-Start-Prompt

Dieser Prompt dient als empfohlene Startvorlage für neue KI-Sessions in diesem Projekt.

```text
Wir arbeiten im Projekt tmdb-sveltekit-frontend.

Bitte lies zuerst README.md, package.json, justfile und bei Testthemen zusätzlich playwright.config.js.

Wichtige Arbeitsregeln:
- Vor Änderungen erst Ziel, betroffene Dateien und Lösungsweg kurz abstimmen.
- Änderungen nur in kleinen, nachvollziehbaren Schritten umsetzen.
- Wenn es Bedenken, Alternativen oder unklare Annahmen gibt, zuerst kurz erklären und nicht direkt umbauen.
- Vereinheitlichungen nur vorschlagen, nicht ohne Rücksprache umsetzen.
- Die Ordnerstruktur hat ihren Sinn und wird nicht ohne Rücksprache umorganisiert.

Hinweise zur Ausführung:
- Wenn die angegebenen CLI-Werkzeuge nicht lokal installiert sind - prüfe ob diese installiert werden, Rücksprache am Anfang der Session nehmen.
- Sind die Werkzeuge lokal installiert, können sie verwendet werden.
- Wenn weitere lokal installierbare Werkzeuge die Arbeit spürbar beschleunigen würden, soll das aktiv angesprochen und kurz begründet werden.
- Wenn eine Aufgabe voraussichtlich mehr Bearbeitungsschritte braucht, als in einem Durchlauf sinnvoll sind, soll das früh gesagt und in kleine Pakete aufgeteilt werden.

Fehler- und Retry-Umgang:
- Wenn ein Tool-Aufruf abbricht oder fehlschlägt, soll das sofort klar benannt werden, inklusive vermuteter Ursache, Auswirkung und nächstem sinnvollen Schritt.
- Nach einem abgebrochenen Tool-Aufruf keine stillen Annahmen treffen, sondern entweder sauber neu ansetzen oder kurz Rücksprache halten.
- Flaky Befehle dürfen gezielt erneut ausgeführt werden, aber nicht endlos: zuerst kurzer Retry, dann kurz einordnen, und bei wiederholtem Fehlschlag Ursache eingrenzen statt blind weiter zu machen.
- Vor gezielten Datei-Edits den aktuellen Dateistand exakt lesen und Suchtexte 1:1 aus der Datei übernehmen.
- Wenn ein Edit an einem exakten Match scheitert, erst neu einlesen und dann den kleinsten sicheren Änderungsweg wählen.
- Wenn etwas schiefgeht oder nicht vollständig beendet wurde, sofort offen sagen, damit an genau dieser Stelle erneut angesetzt werden kann.

Strategie bei Code-Erzeugung und Code-Änderungen:
- Vorhandene Muster, Konventionen und Architektur bevorzugen.
- Best Practices für SvelteKit- und Svelte-Projekte anwenden; dazu gehören saubere Fehlerbehandlung und passende Nutzung bestehender Hooks-Strukturen.
- JavaScript soll gut lesbar, transparent und für Menschen leicht nachvollziehbar bleiben.
- Kein TypeScript verwenden, sofern nicht ausdrücklich anders abgestimmt.
- Mit dem arbeiten, was im Projekt und lokal bereits vorhanden ist; zuerst vorhandene Browser-APIs nutzen, zusätzliche Libraries oder Tools nicht ungefragt einführen oder installieren.
- Vorschläge für sinnvolle zusätzliche Libraries oder Tools können gemacht werden, aber Nutzung oder Installation nur nach Rücksprache.
- Wenn `switch`/`case` die Logik klarer und transparenter macht, soll diese Struktur bevorzugt werden.
- Neu erstellte oder wesentlich geänderte Funktionen mit JSDoc dokumentieren.
- Die zu einer Methode oder Funktion zugehörige JSDoc-Dokumentation wird als Einheit betrachtet.
- Bei Dokumentationsaufgaben nur Doku ergänzen und keine Logik nebenbei umbauen.
- JSDoc mit Augenmaß einsetzen: wichtige oder nicht sofort selbsterklärende Funktionen dokumentieren, triviale Dateien nicht künstlich aufblähen.
- Semantisches HTML bevorzugen, unnötige `div`-Elemente vermeiden und auf Screenreader, Tastaturnavigation sowie sinnvolle ARIA-Attribute achten.
- Sass/CSS lesbar halten und Verschachtelung auf höchstens drei Ebenen begrenzen.
- Imports anderer CSS- oder Sass-Libraries zunächst unangetastet lassen, da sie meist zentral ber Imports geregelt werden.
- Nach jedem sinnvollen Schritt kurz Ergebnis und nächste Option nennen.
- Änderungen anschließend gezielt prüfen und passende Tests ausführen.

Allgemein:
- Bitte arbeite knapp, strukturiert und projektbezogen.
- Antworten standardmäßig kurz halten.
- Wenn möglich Aufgaben kurz mit Ziel, betroffenen Dateien und gewünschtem Modus formulieren, zum Beispiel: analysieren, Vorschlag machen, umsetzen oder prüfen.
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
- Verwende sprechende `describe`- und `it`-Blöcke
- Kommentare sind erlaubt, wenn sie das fachliche Ziel knapp erkälren

Output: Eine `.test.js`-Datei im passenden Testordner.
```

### CSS-Änderung

```text
Ändere das CSS in `src/css/app.scss` für [Ziel].

Anforderungen:
- Verwende unsere Sass-Variablen und Mixins
- Achte auf Browser-Kompatibilität gemäß Projektkonfiguration
- Halte die Verschachtelung auf maximal drei Ebenen

Output: Die geänderte SCSS-Datei.
```

### Refactoring

```text
Refaktorisiere [Funktion/Komponente] für bessere Lesbarkeit.

Ziel:
- [konkretes Ziel, z. B. „weniger Verschachtelung" oder „bessere Fehlerbehandlung"]

Anforderungen:
- Behalte bestehende Patterns und Konventionen bei
- Keine neuen Libraries einführen
- JSDoc bei wichtigen oder nicht sofort selbsterklärenden Funktionen

Output: Die refaktorisierte Datei.
```

## Dos and Don'ts

### Dos

- Klare, spezifische Aufgaben formulieren.
- Tech Stack und Kontext früh nennen.
- Beispiele für gewünschte Ausgabe geben.
- Iterativ vorgehen und Zwischenergebnisse prüfen.
- KI-generierten Code wie externen Code reviewen.

### Don'ts

- Keine Secrets oder API-Keys in Prompts verwenden.
- Keine vagen Aufgaben wie „mach das besser" formulieren.
- Keine langen, unstrukturierten Prompts ohne Ziel und Kontext schreiben.
- Keine Annahmen über nicht genannte Dateien oder Projektteile treffen.

## Security-Hinweise

- **Keine Secrets:** API-Keys, Passwörter oder andere sensible Daten niemals in Prompts verwenden.
- **Review-Pflicht:** Jeder KI-generierte Code muss vor dem Merge geprüft werden.
- **CI-Scans:** Automatische SAST- und Secret-Scans für KI-beeinflusste Änderungen sind sinnvoll.

## Weiteres

- `docs/testing.md` für das Testvorgehen im Projekt
- `README.md` für Projektkontext und Tech Stack
