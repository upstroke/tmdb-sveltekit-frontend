import { describe, expect, it } from 'vitest';
import { formatDate } from '$lib/utils/formatDate';

/**
 * Die Tests decken leere, ungültige, unvollständige und gültige Datumswerte
 * mit unterschiedlichen Locales ab und sichern die neuen Hilfsfunktionen
 * indirekt über verschiedene formatDate-Fälle ab.
 */
describe('formatDate', () => {
	// Anweisungsüberdeckung: Leerer Wert führt zum leeren String.
	it('liefert bei leerem Wert einen leeren String zurück', () => {
		expect(formatDate('')).toBe('');
	});

	// Zweigüberdeckung: Nicht parsebarer String führt zum Originalwert.
	it('gibt den Originalwert bei einem nicht parsebaren String zurück', () => {
		expect(formatDate('kein-datum')).toBe('kein-datum');
	});

	// Zweigüberdeckung: Strikte ISO-Prüfung lehnt ungültigen Kalendertag ab, Fallback formatiert jedoch weiter.
	it('formatiert einen ungültigen Kalendertag über den allgemeinen Date-Fallback', () => {
		expect(formatDate('2024-02-30')).toBe('1.3.2024');
	});

	// Zweigüberdeckung: Leere ISO-Segmente werden in der Ziffernprüfung verworfen und unverändert zurückgegeben.
	it('gibt den Originalwert bei einem ISO-artigen Datum mit leerem Segment zurück', () => {
		expect(formatDate('2024--15')).toBe('2024--15');
	});

	// Zweigüberdeckung: Ungültiger Monat bleibt auch im Fallback ungültig.
	it('gibt den Originalwert bei einem ungültigen Monat zurück', () => {
		expect(formatDate('2024-13-15')).toBe('2024-13-15');
	});

	// Zweigüberdeckung: Unvollständiges Jahr-Monat-Format wird vom allgemeinen Date-Fallback formatiert.
	it('formatiert ein unvollständiges ISO-Datum im Jahr-Monat-Format über den allgemeinen Date-Fallback', () => {
		expect(formatDate('2024-01')).toBe('1.1.2024');
	});

	// Zweigüberdeckung: Unvollständiges Jahr-Format wird vom allgemeinen Date-Fallback formatiert.
	it('formatiert ein unvollständiges ISO-Datum im Jahr-Format über den allgemeinen Date-Fallback', () => {
		expect(formatDate('2024')).toBe('1.1.2024');
	});

	// Zweigüberdeckung: Ungültige Uhrzeit führt zum Originalwert.
	it('gibt den Originalwert bei einem Datum mit ungültiger Uhrzeit zurück', () => {
		expect(formatDate('2024-01-15T25:00:00')).toBe('2024-01-15T25:00:00');
	});

	// Zweigüberdeckung: Stunde 24 wird vom allgemeinen Date-Fallback in den Folgetag überführt.
	it('formatiert ein Datum mit Stunde 24 über den allgemeinen Date-Fallback', () => {
		expect(formatDate('2024-01-15T24:00:00')).toBe('16.1.2024');
	});

	// Zweigüberdeckung: Ungültige Minute führt zum Originalwert.
	it('gibt den Originalwert bei einem Datum mit ungültiger Minute zurück', () => {
		expect(formatDate('2024-01-15T10:60:00')).toBe('2024-01-15T10:60:00');
	});

	// Zweigüberdeckung: Ungültige Sekunden führen zum Originalwert.
	it('gibt den Originalwert bei einem Datum mit ungültigen Sekunden zurück', () => {
		expect(formatDate('2024-01-15T10:00:60')).toBe('2024-01-15T10:00:60');
	});

	// Zweigüberdeckung: Ungültige Zeitzone führt zum Originalwert.
	it('gibt den Originalwert bei einem Datum mit ungültiger Zeitzone zurück', () => {
		expect(formatDate('2024-01-15T10:00:00+25:00')).toBe('2024-01-15T10:00:00+25:00');
	});

	// Zweigüberdeckung: Nicht zweistellige Segmente landen im Fallback und werden dort parsebar.
	it('formatiert ISO-ähnliche Daten ohne zweistelligen Monat oder Tag über den allgemeinen Date-Fallback', () => {
		expect(formatDate('2024-1-15')).toBe('15.1.2024');
		expect(formatDate('2024-01-5')).toBe('5.1.2024');
	});

	// Anweisungsüberdeckung: Vollständiges ISO-Datum mit UTC-Zeit wird formatiert.
	it('formatiert ein vollständiges ISO-Datum mit UTC-Zeit', () => {
		expect(formatDate('2024-01-15T10:00:00Z', 'de-DE')).toBe('15.1.2024');
	});

	// Anweisungsüberdeckung: Vollständiges ISO-Datum mit Offset wird formatiert.
	it('formatiert ein vollständiges ISO-Datum mit Zeitzonen-Offset', () => {
		expect(formatDate('2024-01-15T10:00:00+02:00', 'de-DE')).toBe('15.1.2024');
	});

	// Anweisungsüberdeckung: Parsebares Datum wird mit übergebener Locale formatiert.
	it('formatiert ein parsebares Datum mit der übergebenen Locale', () => {
		expect(formatDate('2024-01-15', 'de-DE')).toBe('15.1.2024');
	});


	// Zweigüberdeckung: Nicht-String-Werte werden bereits in der ersten Validierung verworfen.
	it('gibt bei einem nicht als String übergebenen Wert den leeren String zurück', () => {
		expect(formatDate(null)).toBe('');
	});

	// Anweisungsüberdeckung: Ein vollständiges ISO-Datum mit negativem Offset bleibt gültig und wird formatiert.
	it('formatiert ein vollständiges ISO-Datum mit negativem Zeitzonen-Offset', () => {
		expect(formatDate('2024-01-15T10:00:00-05:00', 'de-DE')).toBe('15.1.2024');
	});

	// Zweigüberdeckung: Ein Zeitanteil mit zu wenigen Segmenten bleibt ungültig und wird unverändert zurückgegeben.
	it('gibt den Originalwert bei einem Datum mit unvollständigem Zeitanteil zurück', () => {
		expect(formatDate('2024-01-15T10')).toBe('2024-01-15T10');
	});

	// Zweigüberdeckung: Nichtnumerische Zeitsegmente bleiben ungültig und werden unverändert zurückgegeben.
	it('gibt den Originalwert bei einem Datum mit nichtnumerischen Zeitsegmenten zurück', () => {
		expect(formatDate('2024-01-15TAB:00:00')).toBe('2024-01-15TAB:00:00');
	});
});
