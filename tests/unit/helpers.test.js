import { describe, expect, it } from 'vitest';

import { getDate, getImageUrl, getMediaType, getTitle } from '$lib/services/tmdb/helpers.js';

describe('tmdb/helpers', () => {
	it('returns the explicit fallback media type before item-derived values', () => {
		// Equivalence partitioning: an explicit fallback overrides media_type and title/name derivation.
		expect(getMediaType({ media_type: 'tv', title: 'Inception', name: 'Ignored' }, 'movie')).toBe(
			'movie'
		);
	});

	it('returns the item media_type when no fallback is provided', () => {
		// Equivalence partitioning: the existing media type from the record is adopted directly.
		expect(getMediaType({ media_type: 'tv', title: 'Ignored' })).toBe('tv');
	});

	it('derives movie when title is present and no explicit media type exists', () => {
		// Equivalence partitioning: an entry with title is recognized as a movie.
		expect(getMediaType({ title: 'Inception' })).toBe('movie');
	});

	it('derives tv when name is present and no title or explicit media type exists', () => {
		// Equivalence partitioning: an entry with name is recognized as a TV series.
		expect(getMediaType({ name: 'Dark' })).toBe('tv');
	});

	it('returns null when media type cannot be determined', () => {
		// Equivalence partitioning: without fallback, media_type, title, or name, no media type can be determined.
		expect(getMediaType({})).toBeNull();
	});

	it('returns title before name and falls back to an empty string', () => {
		// Equivalence partitioning: title takes precedence over name; without both fields, an empty string is returned.
		expect(getTitle({ title: 'Inception', name: 'Ignored' })).toBe('Inception');
		expect(getTitle({ name: 'Dark' })).toBe('Dark');
		expect(getTitle({})).toBe('');
	});

	it('returns release_date before first_air_date and falls back to an empty string', () => {
		// Equivalence partitioning: release_date takes precedence over first_air_date; without both fields, an empty string is returned.
		expect(getDate({ release_date: '2010-07-16', first_air_date: '2017-12-01' })).toBe(
			'2010-07-16'
		);
		expect(getDate({ first_air_date: '2017-12-01' })).toBe('2017-12-01');
		expect(getDate({})).toBe('');
	});

	it('returns an empty string for missing image paths and builds a full TMDB image URL otherwise', () => {
		// Statement coverage: an empty, missing, or undefined image path returns no URL; an existing path is combined with default and alternative sizes.
		expect(getImageUrl('')).toBe('');
		expect(getImageUrl(undefined)).toBe('');
		expect(getImageUrl(null)).toBe('');
		expect(getImageUrl('/poster.jpg')).toBe('https://image.tmdb.org/t/p/w500/poster.jpg');
		expect(getImageUrl('/poster.jpg', 'w780')).toBe('https://image.tmdb.org/t/p/w780/poster.jpg');
	});
});
