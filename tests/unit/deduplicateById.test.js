import { describe, expect, it } from 'vitest';
import { deduplicateById } from '$lib/utils/deduplicateById';

/**
 * Teststrategie: Anweisungsüberdeckung (Statement Coverage).
 * Die Tests decken gültige IDs, fehlende IDs und doppelte IDs ab.
 */
describe('deduplicateById', () => {
	it('behält ein Element mit gültiger ID', () => {
		expect(deduplicateById([{ id: 1 }])).toEqual([{ id: 1 }]);
	});

	it('entfernt ein Element ohne ID', () => {
		expect(deduplicateById([{}])).toEqual([]);
	});

	it('entfernt ein späteres Element mit doppelter ID', () => {
		expect(deduplicateById([{ id: 1 }, { id: 1 }])).toEqual([{ id: 1 }]);
	});
});
