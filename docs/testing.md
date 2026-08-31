# Testdokumentation

Diese Datei beschreibt das pragmatische Vorgehen für Tests in diesem Projekt.

## Testarten

Das Projekt nutzt vier Testarten:

- Acceptance-Tests in `tests/acceptance/` mit Playwright
- Komponenten-Tests in `tests/components/` mit Vitest
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

## Vorgehen bei Unit-Tests

Unit-Tests werden direkt als normale Vitest-Tests in `tests/unit/*.test.js` geschrieben.

Dabei gilt:

- Ein Test beschreibt sein Verhalten direkt in der Testdatei.
- Fachliche Varianten werden über sprechende `describe`- und `it`-Blöcke abgebildet.
- Zusätzliche Metadateien oder ein Testgenerator werden nicht verwendet.
- Kommentare im Test sind erlaubt, wenn sie das fachliche Ziel eines Falls knapp erklären.
- Die Testdokumentation in der Testdatei soll die Testtechnik nennen und zusätzlich kurz zwischen Happy Path und negativen bzw. Fallback-Fällen unterscheiden.

## Testdesign-Techniken

Je nach Funktion kommen unter anderem diese Techniken zum Einsatz:

- Äquivalenzklassen
- Grenzwertanalyse
- Anweisungsüberdeckung
- Zweigüberdeckung
- Zustandsbasierte Tests

Nicht jede Funktion benötigt alle Techniken. Die gewählte Technik wird bei Bedarf direkt im Test oder in der fachlichen Doku knapp begründet.

## Coverage

Coverage wird mit Vitest und V8 erzeugt. Der Coverage-Report wird im Ordner `coverage/` abgelegt.

Coverage-Zahlen dienen als Orientierung und ergänzen die fachliche Testfallauswahl. Sie ersetzen diese nicht.

## Rolle des Testers

Die fachliche Herleitung der Testfälle bleibt Aufgabe des Testers.

Der Tester:

- wählt ein geeignetes Testobjekt aus dem bestehenden Code aus,
- entscheidet, welche Testdesign-Technik fachlich sinnvoll ist,
- identifiziert relevante Testbedingungen, Risiken und Eingabeklassen,
- definiert konkrete Testfälle und erwartete Ergebnisse,
- prüft die Resultate und verbessert die Tests bei Bedarf.
