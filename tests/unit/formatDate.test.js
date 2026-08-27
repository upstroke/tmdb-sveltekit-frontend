import { describe, expect, it } from 'vitest';
import { formatDate } from '$lib/utils/formatDate';

/**
 * Teststrategie: Anweisungsüberdeckung (Statement Coverage).
 * Die Tests decken leere, ungültige und gültige Datumswerte
 * mit unterschiedlichen Locales ab.
 */
describe('formatDate', () => {
	it('liefert bei leerem Wert einen leeren String zurück', () => {
		expect(formatDate('')).toBe('');
	});

	it('gibt den Originalwert bei einem nicht parsebaren String zurück', () => {
		expect(formatDate('kein-datum')).toBe('kein-datum');
	});

	it('gibt den Originalwert bei einem ungültigen Kalendertag zurück', () => {
		expect(formatDate('2024-02-30')).toBe('2024-02-30');
	});

	it('gibt den Originalwert bei einem ungültigen Monat zurück', () => {
		expect(formatDate('2024-13-15')).toBe('2024-13-15');
	});

	it('gibt den Originalwert bei einem unvollständigen ISO-Datum zurück', () => {
		expect(formatDate('2024-01')).toBe('2024-01');
	});

	it('gibt den Originalwert bei einem Datum mit ungültiger Uhrzeit zurück', () => {
		expect(formatDate('2024-01-15T25:00:00')).toBe('2024-01-15T25:00:00');
	});

	it('formatiert ein parsebares Datum mit der übergebenen Locale', () => {
		expect(formatDate('2024-01-15', 'de-DE')).toBe('15.1.2024');
	});

	it('formatiert ein parsebares Datum auch mit einer anderen Locale', () => {
		expect(formatDate('2024-01-15', 'en-US')).toBe('1/15/2024');
	});
});
