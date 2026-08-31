import { describe, expect, it } from 'vitest';
import { deduplicateById } from '$lib/utils/deduplicateById';

/**
 * Teststrategie: Anweisungs- und Zweigüberdeckung (Statement & Branch Coverage).
 * Die Tests decken gültige IDs, fehlende IDs und doppelte IDs ab.
 */
describe('deduplicateById', () => {
	// Anweisungs- und Zweigüberdeckung: Ein gültiges Element bleibt erhalten.
	it('behält ein Element mit gültiger ID', () => {
		expect(deduplicateById([{ id: 1 }])).toEqual([{ id: 1 }]);
	});

	// Anweisungs- und Zweigüberdeckung: Elemente ohne ID werden entfernt.
	it('entfernt ein Element ohne ID', () => {
		expect(deduplicateById([{}])).toEqual([]);
	});

	// Zweigüberdeckung: Spätere Duplikate mit derselben ID werden entfernt.
	it('entfernt ein späteres Element mit doppelter ID', () => {
		expect(deduplicateById([{ id: 1 }, { id: 1 }])).toEqual([{ id: 1 }]);
	});
});
