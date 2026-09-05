import { describe, expect, it } from 'vitest';
import { deduplicateMedia } from '$lib/utils/deduplicateMedia';

/**
 * Test strategy: statement coverage and branch coverage.
 * The tests cover valid elements, invalid keys,
 * duplicates, and same IDs with different media types.
 */
describe('deduplicateMedia', () => {
	// Statement coverage: a valid media element is preserved.
	it('preserves a valid media element', () => {
		expect(deduplicateMedia([{ id: 1, mediaType: 'movie' }])).toEqual([
			{ id: 1, mediaType: 'movie' }
		]);
	});

	// Statement coverage: duplicate mediaType/ID combinations are deduplicated.
	it('removes later duplicates with the same mediaType and id', () => {
		expect(
			deduplicateMedia([
				{ id: 1, mediaType: 'movie' },
				{ id: 1, mediaType: 'movie' }
			])
		).toEqual([{ id: 1, mediaType: 'movie' }]);
	});

	// Statement coverage: invalid elements are discarded.
	it('removes elements without a valid key', () => {
		expect(deduplicateMedia([{ id: 1 }, { mediaType: 'movie' }, null])).toEqual([]);
	});

	// Statement coverage: different media types with the same ID remain separate.
	it('preserves same ids with different mediaType', () => {
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
