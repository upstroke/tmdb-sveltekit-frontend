import { describe, expect, it } from 'vitest';
import { deduplicateMedia } from '$lib/utils/deduplicateMedia';

/**
 * Teststrategie: Anweisungsüberdeckung und Zweigüberdeckung.
 * Die Tests decken gültige Elemente, ungültige Schlüssel,
 * Duplikate und gleiche IDs mit unterschiedlichem Medientyp ab.
 */
describe('deduplicateMedia', () => {
	// Anweisungsüberdeckung: Ein gültiges Media-Element bleibt erhalten.
	it('behält ein gültiges Media-Element', () => {
		expect(deduplicateMedia([{ id: 1, mediaType: 'movie' }])).toEqual([
			{ id: 1, mediaType: 'movie' }
		]);
	});

	// Zweigüberdeckung: Gleiche mediaType-/ID-Kombinationen werden dedupliziert.
	it('entfernt spätere Duplikate mit gleichem mediaType und id', () => {
		expect(
			deduplicateMedia([
				{ id: 1, mediaType: 'movie' },
				{ id: 1, mediaType: 'movie' }
			])
		).toEqual([{ id: 1, mediaType: 'movie' }]);
	});

	// Anweisungsüberdeckung: Ungültige Elemente werden verworfen.
	it('entfernt Elemente ohne gültigen Schlüssel', () => {
		expect(deduplicateMedia([{ id: 1 }, { mediaType: 'movie' }, null])).toEqual([]);
	});

	// Zweigüberdeckung: Unterschiedliche Medientypen mit gleicher ID bleiben getrennt.
	it('behält gleiche ids mit unterschiedlichem mediaType', () => {
		expect(
			deduplicateMedia([
				{ id: 1, mediaType: 'movie' },
				{ id: 1, mediaType: 'tv' }
			])
		).toEqual([
			{ id: 1, mediaType: 'movie' },
			{ id: 1, mediaType: 'tv' }
		]);
	});
});
