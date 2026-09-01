import { describe, expect, it } from 'vitest';
import { deduplicateById } from '$lib/utils/deduplicateById';

/**
 * Teststrategie: Anweisungsüberdeckung und Zweigüberdeckung.
 * Die Tests decken gültige IDs, fehlende IDs und doppelte IDs ab.
 */
describe('deduplicateById', () => {
	// Anweisungsüberdeckung: Ein gültiges Element bleibt erhalten.
	it('behält ein Element mit gültiger ID', () => {
		expect(deduplicateById([{ id: 1 }])).toEqual([{ id: 1 }]);
	});

	// Anweisungsüberdeckung: Elemente ohne auswertbare ID werden im Filterpfad verworfen.
	it('entfernt ein Element ohne ID', () => {
		expect(deduplicateById([{}])).toEqual([]);
	});

	// Anweisungsüberdeckung: Spätere Duplikate mit derselben ID werden entfernt.
	it('entfernt ein späteres Element mit doppelter ID', () => {
		expect(deduplicateById([{ id: 1 }, { id: 1 }])).toEqual([{ id: 1 }]);
	});
});
