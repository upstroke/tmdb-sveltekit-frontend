# AI-Prompts für die Entwicklung

Diese Datei dokumentiert bewaehrte Prompt-Muster fuer KI-gestuetzte Entwicklung im Projekt.

## Grundprinzipien

- **Klare Struktur:** Verwende Abschnitte mit Ueberschriften wie `## Rolle`, `## Aufgabe`, `## Kontext`, `## Beispiele` und `## Ausgabeformat`.
- **Ziel zuerst:** Definiere die eine klare Aufgabe und die Erfolgskriterien.
- **Kontext zuerst:** Nenne Tech Stack, relevante Dateien, bestehende Muster und fachliche Randbedingungen frueh.
- **Beispiele nutzen:** 2–3 Beispiele der gewuenschten Ausgabe sind oft hilfreicher als lange Erklaerungen.
- **Iterativ und minimal arbeiten:** Starte mit einer knappen, klaren Anfrage und ergaenze nur das, was fuer ein besseres Ergebnis wirklich fehlt.

`docs/ai-prompt-examples.md` fuer konkrete Prompt-Beispiele nach Rolle

## Projektkontext

Dieses Projekt nutzt:

- SvelteKit 2.63 mit Svelte 5
- Vite als Build-Tool
- Sass/SCSS fuer Styles
- PostCSS mit Autoprefixer
- Fomantic UI / Semantic UI Klassen
- Playwright fuer Acceptance-Tests
- Vitest fuer Komponenten-, Integrations- und Unit-Tests

Wichtige Projektpfade:

- `src/routes` fuer Routen
- `src/lib/components` fuer UI-Komponenten
- `src/lib` fuer gemeinsam genutzte Logik
- `src/css` fuer globale Styles

## Wichtige Browser-Ziele

- letzte 2 Browserversionen
- Marktanteil ueber 0,5 %
- keine veralteten Browser

## Lokal verfuegbare CLI-Werkzeuge

- `rg` (ripgrep) fuer schnelle Textsuche
- `fd` fuer schnelle Datei- und Ordnersuche
- `fzf` fuer interaktive Auswahl und Filterung
- `bat` fuer lesbares Anzeigen von Dateien
- `delta` fuer gut lesbare Git-Diffs
- `sd` fuer einfache, gezielte Textaenderungen

## Session-Start-Prompt

Dieser Prompt dient als empfohlene Startvorlage fuer neue KI-Sessions in diesem Projekt.

```text
Bitte lies zuerst README.md, package.json, justfile und bei Testthemen zusaetzlich playwright.config.js.

Wichtige Arbeitsregeln:
- Vor Aenderungen erst Ziel, betroffene Dateien und Loesungsweg kurz abstimmen.
- Aenderungen nur in kleinen, nachvollziehbaren Schritten umsetzen.
- Wenn es Bedenken, Alternativen oder unklare Annahmen gibt, zuerst kurz erklaeren und nicht direkt umbauen.
- Vereinheitlichungen nur vorschlagen, nicht ohne Ruecksprache umsetzen.
- Die Ordnerstruktur hat ihren Sinn und wird nicht ohne Ruecksprache umorganisiert.

Hinweise zur Ausfuehrung:
- Wenn die angegebenen CLI-Werkzeuge nicht lokal installiert sind - pruefe ob diese installiert werden, Ruecksprache am Anfang der Session nehmen.
- Sind die Werkzeuge lokal installiert, koennen sie verwendet werden.
- Wenn weitere lokal installierbare Werkzeuge die Arbeit spuerbar beschleunigen wuerden, soll das aktiv angesprochen und kurz begruendet werden.
- Wenn eine Aufgabe voraussichtlich mehr Bearbeitungsschritte braucht, als in einem Durchlauf sinnvoll sind, soll das frueh gesagt und in kleine Pakete aufgeteilt werden.

Fehler- und Retry-Umgang:
- Wenn ein Tool-Aufruf abbricht oder fehlschlaegt, soll das sofort klar benannt werden, inklusive vermuteter Ursache, Auswirkung und naechstem sinnvollen Schritt.
- Nach einem abgebrochenen Tool-Aufruf keine stillen Annahmen treffen, sondern entweder sauber neu ansetzen oder kurz Ruecksprache halten.
- Flaky Befehle duerfen gezielt erneut ausgefuehrt werden, aber nicht endlos: zuerst kurzer Retry, dann kurz einordnen, und bei wiederholtem Fehlschlag Ursache eingrenzen statt blind weiter zu machen.
- Vor gezielten Datei-Edits den aktuellen Dateistand exakt lesen und Suchtexte 1:1 aus der Datei uebernehmen.
- Wenn ein Edit an einem exakten Match scheitert, erst neu einlesen und dann den kleinsten sicheren Aenderungsweg waehlen.
- Wenn etwas schiefgeht oder nicht vollstaendig beendet wurde, sofort offen sagen, damit an genau dieser Stelle erneut angesetzt werden kann.

Strategie bei Code-Erzeugung und Code-Aenderungen:
- Vorhandene Muster, Konventionen und Architektur bevorzugen.
- Best Practices fuer SvelteKit- und Svelte-Projekte anwenden; dazu gehoeren saubere Fehlerbehandlung und passende Nutzung bestehender Hooks-Strukturen.
- JavaScript soll gut lesbar, transparent und fuer Menschen leicht nachvollziehbar bleiben.
- Kein TypeScript verwenden, sofern nicht ausdruecklich anders abgestimmt.
- Mit dem arbeiten, was im Projekt und lokal bereits vorhanden ist; zuerst vorhandene Browser-APIs nutzen, zusaetzliche Libraries oder Tools nicht ungefragt einfuehren oder installieren.
- Vorschlaege fuer sinnvolle zusaetzliche Libraries oder Tools koennen gemacht werden, aber Nutzung oder Installation nur nach Ruecksprache.
- Wenn `switch`/`case` die Logik klarer und transparenter macht, soll diese Struktur bevorzugt werden.
- Neu erstellte oder wesentlich geaenderte Funktionen mit JSDoc dokumentieren.
- Die zu einer Methode oder Funktion zugehoerige JSDoc-Dokumentation wird als Einheit betrachtet.
- Bei Dokumentationsaufgaben nur Doku ergaenzen und keine Logik nebenbei umbauen.
- JSDoc mit Augenmass einsetzen: wichtige oder nicht sofort selbsterklaerende Funktionen dokumentieren, triviale Dateien nicht kuenstlich aufblaehen.
- Semantisches HTML bevorzugen, unnoetige `div`-Elemente vermeiden und auf Screenreader, Tastaturnavigation sowie sinnvolle ARIA-Attribute achten.
- Sass/CSS lesbar halten und Verschachtelung auf hoechstens drei Ebenen begrenzen.
- Imports anderer CSS- oder Sass-Libraries zunaechst unangetastet lassen, da sie meist zentral ueber Imports geregelt werden.
- Nach jedem sinnvollen Schritt kurz Ergebnis und naechste Option nennen.
- Aenderungen anschliessend gezielt pruefen und passende Tests ausfuehren.

Allgemein:
- Bitte arbeite knapp, strukturiert und projektbezogen.
- Antworten standardmaessig kurz halten.
- Wenn moeglich Aufgaben kurz mit Ziel, betroffenen Dateien und gewuenschem Modus formulieren, zum Beispiel: analysieren, Vorschlag machen, umsetzen oder pruefen.
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
Erstelle einen Vitest-Test fuer [Funktion/Komponente].

Kontext:
- Die Funktion befindet sich in `src/lib/...`
- Bestehende Tests sind in `tests/unit/` bzw. `tests/components/`

Anforderungen:
- Beschreibe das Verhalten direkt in der Testdatei
- Verwende sprechende `describe`- und `it`-Bloecke
- Kommentare sind erlaubt, wenn sie das fachliche Ziel knapp erklaeren

Output: Eine `.test.js`-Datei im passenden Testordner.
```

### CSS-Aenderung

```text
Aendere das CSS in `src/css/app.scss` fuer [Ziel].

Anforderungen:
- Verwende unsere Sass-Variablen und Mixins
- Achte auf Browser-Kompatibilitaet gemaess Projektkonfiguration
- Halte die Verschachtelung auf maximal drei Ebenen

Output: Die geaenderte SCSS-Datei.
```

### Refactoring

```text
Refaktorisiere [Funktion/Komponente] fuer bessere Lesbarkeit.

Ziel:
- [konkretes Ziel, z. B. „weniger Verschachtelung" oder „bessere Fehlerbehandlung"]

Anforderungen:
- Behalte bestehende Patterns und Konventionen bei
- Keine neuen Libraries einfuehren
- JSDoc bei wichtigen oder nicht sofort selbsterklaerenden Funktionen

Output: Die refaktorisierte Datei.
```

### Internationalisierung (i18n)

```text
Fuege neue UI-Texte in `src/lib/i18n/ui.json` hinzu.

Anforderungen:
- Immer alle unterstuetzten Locales aktualisieren (de-DE, en-US, es-ES, fr-FR, vi-VN)
- Kurze, praegnante Formulierungen verwenden
- Keine Hardcoded Strings im Code - immer i18n-Keys verwenden
- Bei Unsicherheit zur Uebersetzung: kurze Ruecksprache halten

Output: Geaenderte ui.json mit Eintraegen in allen Locales.
```

## Dos and Don'ts

### Dos

- Klare, spezifische Aufgaben formulieren.
- Tech Stack und Kontext frueh nennen.
- Beispiele fuer gewuenschte Ausgabe geben.
- Iterativ vorgehen und Zwischenergebnisse pruefen.
- KI-generierten Code wie externen Code reviewen.

### Don'ts

- Keine Secrets oder API-Keys in Prompts verwenden.
- Keine vagen Aufgaben wie „mach das besser" formulieren.
- Keine langen, unstrukturierten Prompts ohne Ziel und Kontext schreiben.
- Keine Annahmen ueber nicht genannte Dateien oder Projektteile treffen.

## Security-Hinweise

- **Keine Secrets:** API-Keys, Passwoerter oder andere sensible Daten niemals in Prompts verwenden.
- **Review-Pflicht:** Jeder KI-generierte Code muss vor dem Merge geprueft werden.
- **CI-Scans:** Automatische SAST- und Secret-Scans fuer KI-beeinflusste Aenderungen sind sinnvoll.

## Weiteres

- `docs/testing.md` fuer das Testvorgehen im Projekt
- `README.md` fuer Projektkontext und Tech Stack
- `docs/ai-prompt-examples.md` fuer konkrete Prompt-Beispiele nach Rolle
