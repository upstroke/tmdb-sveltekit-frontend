import { describe, expect, it } from 'vitest';
import { formatHomepageLabel } from '$lib/utils/formatHomepageLabel';

/**
 * Teststrategie: Anweisungsüberdeckung (Statement Coverage).
 * Die Tests decken fehlende URLs, beide Protokolle sowie URLs
 * mit Pfad, Query und Fragment ab.
 */
describe('formatHomepageLabel', () => {
	it('liefert bei fehlender URL einen leeren String zurück', () => {
		expect(formatHomepageLabel()).toBe('');
	});

	it('entfernt das https-Protokoll', () => {
		expect(formatHomepageLabel('https://example.com')).toBe('example.com');
	});

	it('entfernt das http-Protokoll', () => {
		expect(formatHomepageLabel('http://example.com')).toBe('example.com');
	});

	it('entfernt nur das führende Protokoll und erhält den restlichen Pfad', () => {
		expect(formatHomepageLabel('https://example.com/films?id=42#details')).toBe(
			'example.com/films?id=42#details'
		);
	});

	it('lässt URLs ohne http- oder https-Protokoll unverändert', () => {
		expect(formatHomepageLabel('www.example.com')).toBe('www.example.com');
	});
});
