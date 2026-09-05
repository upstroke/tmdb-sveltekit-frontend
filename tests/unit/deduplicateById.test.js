import { describe, expect, it } from 'vitest';
import { deduplicateById } from '$lib/utils/deduplicateById';

/**
 * Test strategy: statement coverage and branch coverage.
 * The tests cover valid IDs, missing IDs, and duplicate IDs.
 */
describe('deduplicateById', () => {
	// Statement coverage: a valid element with ID is preserved.
	it('preserves an element with a valid ID', () => {
		expect(deduplicateById([{ id: 1 }])).toEqual([{ id: 1 }]);
	});

	// Statement coverage: elements without an evaluable ID are discarded in the filter path.
	it('removes an element without an ID', () => {
		expect(deduplicateById([{}])).toEqual([]);
	});

	// Statement coverage: later duplicates with the same ID are removed.
	it('removes a later element with a duplicate ID', () => {
		expect(deduplicateById([{ id: 1 }, { id: 1 }])).toEqual([{ id: 1 }]);
	});
});
