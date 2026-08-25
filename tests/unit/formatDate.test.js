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

	it('gibt den Originalwert bei ungültigem Datum zurück', () => {
		expect(formatDate('kein-datum')).toBe('kein-datum');
	});

	it('formatiert ein parsebares Datum mit der übergebenen Locale', () => {
		expect(formatDate('2024-01-15', 'de-DE')).toBe('15.1.2024');
	});

	it('formatiert ein parsebares Datum auch mit einer anderen Locale', () => {
		expect(formatDate('2024-01-15', 'en-US')).toBe('1/15/2024');
	});
});
