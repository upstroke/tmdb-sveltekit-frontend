# AI-Prompt-Beispiele

Diese Datei enthält konkrete Prompt-Beispiele für häufige Aufgaben im Projekt.

## Grundstruktur

Jeder Prompt sollte folgende Abschnitte enthalten:

```md
## Rolle
[Rolle und Expertise]

## Aufgabe
[Was zu tun ist]

## Kontext
[Projekt, Dateien, Rahmenbedingungen]

## Beispiele
[Was gut oder schlecht wäre]

## Ausgabeformat
[Wie die Antwort aussehen soll]
```

---

## Beispiele nach Rolle

### Senior Frontend-Entwickler

```md
## Rolle
Du bist Senior Frontend-Entwickler mit Fokus auf SvelteKit und Accessibility.
Du achtest auf saubere, wartbare Komponenten und semantisches HTML.

## Aufgabe
Erstelle eine neue Svelte-5-Komponente für einen Filmbanner.

## Kontext
Projekt: tmdb-sveltekit-frontend
Dateien zur Orientierung:
- src/lib/components/CardDefault.svelte
- src/css/_variables.scss

Rahmenbedingungen:
- semantisches HTML
- kein TypeScript
- Sass-Verschachtelung maximal 3 Ebenen

## Beispiele
Gutes Ergebnis:
- klare Props
- gut lesbares Markup
- sinnvolle ARIA-Attribute

Nicht gewünscht:
- Inline-Styles
- unnötige div-Container
- neue Dependency

## Ausgabeformat
Liefere:
1. den vollständigen Code für die neue `.svelte`-Datei
2. eine kurze Liste der betroffenen Dateien
3. 2–3 Sätze zur Begründung der Struktur
```

---

### Code-Reviewer

```md
## Rolle
Du bist Code-Reviewer mit Fokus auf Sicherheit und Performance.
Prüfe den Code auf Schwachstellen, ineffiziente Muster und unklare Logik.

## Aufgabe
Analysiere die Datei `src/lib/components/MovieCard.svelte` auf:
- Sicherheitsprobleme (XSS, unsichere Datenverarbeitung)
- Performance-Probleme (unnötige Reaktivität, ineffiziente Loops)
- Code-Qualität (Lesbarkeit, Wartbarkeit)

## Kontext
Datei: src/lib/components/MovieCard.svelte
Projekt: tmdb-sveltekit-frontend
Tech Stack: SvelteKit 2.63, Svelte 5, Sass

## Beispiele
Gutes Ergebnis:
- konkrete Fundstellen mit Zeilennummern
- klare Bewertung (kritisch, mittel, gering)
- praktische Vorschläge zur Verbesserung

Nicht gewünscht:
- vage Aussagen ohne Bezug zum Code
- pauschale Empfehlungen ohne Kontext

## Ausgabeformat
Liefere:
1. eine Tabelle mit Fundstellen, Bewertung und Empfehlung
2. priorisierte Liste der wichtigsten Punkte
3. bei kritischen Problemen: konkrete Code-Beispiele für das Fixen des Problems.
```

---

### Technical Writer

```md
## Rolle
Du bist Technical Writer für Entwickler-Dokumentation.
Schreibe klare, knappe und technisch korrekte Doku.

## Aufgabe
Erstelle eine README-Dokumentation für die neue `MovieService`-Klasse.

## Kontext
Datei: src/lib/services/MovieService.js
Projekt: tmdb-sveltekit-frontend
Zielgruppe: Entwickler im Team

Die Klasse bietet:
- Film-Suche nach Titel
- Film-Details nach ID
- Genre-Filterung
- Paginierung

## Beispiele
Gutes Ergebnis:
- klare Überschriften
- Code-Beispiele für typische Anwendungsfälle
- kurze Erklärung der Parameter und Rückgabewerte

Nicht gewünscht:
- ausführliche Einleitungen ohne Mehrwert
- technische Details ohne Praxisbezug
- unvollständige API-Beschreibung

## Ausgabeformat
Liefere:
1. eine README-Datei mit Installation, Usage und API-Referenz
2. mindestens 2 Code-Beispiele für typische Anwendungsfälle
3. kurze Hinweise zu Fehlerbehandlung und Randfällen
```

---

### Test-Automatisierer

```md
## Rolle
Du bist Test-Automatisierer mit Fokus auf Playwright.
Erstelle robuste, wartbare Tests mit sinnvollen Selectoren.

## Aufgabe
Erstelle einen Playwright-Acceptance-Test für die Film-Suche.

## Kontext
Seite: /search
Projekt: tmdb-sveltekit-frontend
Test-Framework: Playwright

Test-Szenario:
1. Nutzer gibt Suchbegriff ein
2. Ergebnisse werden angezeigt
3. Nutzer klickt auf einen Film
4. Film-Details werden angezeigt

## Beispiele
Gutes Ergebnis:
- stabile Selectoren (data-testid, Rollen, Labels)
- sinnvolle Wartezeiten (waitFor, toBeVisible)
- klare Test-Beschreibung im Code

Nicht gewünscht:
- fragile CSS-Selektoren
- harte Wartezeiten (setTimeout)
- unklare Test-Namen

## Ausgabeformat
Liefere:
1. eine `.test.js`-Datei im Ordner `tests/acceptance/`
2. den kompletten Test-Code mit sinnvollen Comments
3. kurze Erklärung der gewählten Selectoren und Wartezeiten
```

---

### Refactoring-Spezialist

```md
## Rolle
Du bist Refactoring-Spezialist mit Fokus auf Code-Qualität und Wartbarkeit.
Du vereinfachst komplexe Logik ohne Änderung des Verhaltens.

## Aufgabe
Refaktorisiere die Funktion `calculateMovieScore` in `src/lib/utils/scoreCalculator.js`.

## Kontext
Datei: src/lib/utils/scoreCalculator.js
Projekt: tmdb-sveltekit-frontend

Probleme:
- zu viele verschachtelte if-else-Blöcke
- unklare Variablennamen
- fehlende Fehlerbehandlung
- keine JSDoc-Dokumentation

## Beispiele
Gutes Ergebnis:
- klare, benannte Funktionen
- frühe Returns statt tiefer Verschachtelung
- sinnvolle Fehlerbehandlung
- JSDoc für wichtige Funktionen

Nicht gewünscht:
- Änderung des Verhaltens
- neue Dependencies
- Über-Engineering (z. B. unnötige Abstraktionen)

## Ausgabeformat
Liefere:
1. die refaktorisierte Datei
2. eine kurze Liste der wichtigsten Änderungen
3. Hinweise auf verbleibende Probleme oder offene Fragen
```

---

### Performance-Optimierer

```md
## Rolle
Du bist Performance-Optimierer mit Fokus auf Ladezeiten und Runtime-Performance.
Du identifizierst Engpässe und schlägst konkrete Optimierungen vor.

## Aufgabe
Analysiere die Startseite `/` auf Performance-Probleme.

## Kontext
Seite: / (Startseite)
Projekt: tmdb-sveltekit-frontend

Beobachtete Probleme:
- langsame erste Darstellung (LCP > 2.5s)
- viele Netzwerkanfragen
- unoptimierte Bilder

## Beispiele
Gutes Ergebnis:
- konkrete Messwerte (LCP, FCP, TTI)
- priorisierte Liste der wichtigsten Optimierungen
- praktische Umsetzungsvorschläge

Nicht gewünscht:
- pauschale Empfehlungen ohne Bezug zum Projekt
- Optimierungen mit geringem Impact
- Vorschläge, die die Wartbarkeit verschlechtern

## Ausgabeformat
Liefere:
1. eine priorisierte Liste der wichtigsten Optimierungen
2. konkrete Code-Beispiele für die Top-3-Maßnahmen
3. Hinweise auf erwartete Verbesserung (Messgrößen)
```

---

## Tipps zur Rollenzuweisung

- **Rolle vor Aufgabe:** Die Rolle sollte immer am Anfang stehen, damit das Modell den Kontext versteht.
- **Spezifisch sein:** Statt "Du bist ein Entwickler" besser "Du bist Senior Frontend-Entwickler mit Fokus auf SvelteKit".
- **Prioritäten nennen:** Welche Aspekte sind besonders wichtig (z. B. Accessibility, Performance, Sicherheit)?
- **Rolle zur Aufgabe passend:** Wähle die Rolle basierend auf der Aufgabe (z. B. Technical Writer für Doku, Tester für Tests).

## Weitere Ressourcen

- `docs/ai-prompts.md` für allgemeine Prompt-Richtlinien
- `docs/testing.md` für Testvorgehen im Projekt
- `README.md` für Projektkontext und Tech Stack
