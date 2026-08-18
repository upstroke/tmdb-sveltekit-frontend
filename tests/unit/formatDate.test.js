import { describe, it, expect } from 'vitest';
import { formatDate } from '$lib/utils/formatDate';

describe('formatDate', () => {
	it('gibt einen leeren String zurück, wenn kein Datum übergeben wird', () => {
		expect(formatDate('')).toBe('');
		expect(formatDate(null)).toBe('');
		expect(formatDate(undefined)).toBe('');
	});

	it('gibt den Originalwert zurück, wenn das Datum ungültig ist', () => {
		expect(formatDate('kein-datum', 'de-DE')).toBe('kein-datum');
	});

	it('formatiert ein gültiges Datum mit der angegebenen Locale', () => {
		expect(formatDate('2026-08-18', 'de-DE')).toBe(
			new Intl.DateTimeFormat('de-DE').format(new Date('2026-08-18'))
		);
	});

	it('formatiert ein gültiges Datum auch mit einer anderen Locale', () => {
		expect(formatDate('2026-08-18', 'en-US')).toBe(
			new Intl.DateTimeFormat('en-US').format(new Date('2026-08-18'))
		);
	});
});