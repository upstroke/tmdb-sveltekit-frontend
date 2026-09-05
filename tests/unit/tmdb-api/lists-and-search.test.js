import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTmdbApi } from '$lib/services/tmdb-api';
import { rawResponses } from '$tests/fixtures/tmdb/tmdb.fixtures.js';

/**
 * Creates a mock JSON response object for fetch operations.
 *
 * @param {any} data - The data to be returned by the mocked json() method.
 * @returns {{ ok: boolean, json: import('vitest').Mock<() => Promise<any>> }}
 */
function createJsonResponse(data) {
	return {
		ok: true,
		json: vi.fn().mockResolvedValue(data)
	};
}

describe('tmdb api lists and search', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	describe('getList', () => {
		// Statement coverage: a list query is fully mapped and enriched with certifications.
		it('loads a list, maps the cards, and enriches them with certifications', async () => {
			const fetchFn = vi
				.fn()
				.mockResolvedValueOnce(createJsonResponse(rawResponses.movieList))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.movieGenres))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.emptyTvGenres))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.movieCertification));
			const api = createTmdbApi(fetchFn, 'test-api-key', 'en-US');

			await expect(api.getList('/movie/popular', 1, 'movie')).resolves.toEqual({
				page: 1,
				results: [
					{
						id: 550,
						mediaType: 'movie',
						title: 'Fight Club',
						date: '1999-10-15',
						rating: 8.4,
						genres: [{ id: 18, name: 'Drama' }],
						imageUrl: 'https://image.tmdb.org/t/p/w500/fight-club.jpg',
						posterUrl: 'https://image.tmdb.org/t/p/w342/fight-club.jpg',
						certification: 'PG'
					}
				],
				hasMore: true
			});
		});
	});

	describe('searchMedia', () => {
		// Statement coverage: a search returns only normalized matches for supported media types.
		it('returns only supported media types as normalized search results', async () => {
			const fetchFn = vi
				.fn()
				.mockResolvedValueOnce(createJsonResponse(rawResponses.multiSearch))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.movieGenres))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.tvGenres));
			const api = createTmdbApi(fetchFn, 'test-api-key', 'de-DE');

			await expect(api.searchMedia('dark')).resolves.toEqual({
				page: 1,
				results: [
					{
						id: 550,
						mediaType: 'movie',
						title: 'Fight Club',
						date: '1999-10-15',
						rating: 8.4,
						genres: [{ id: 18, name: 'Drama' }],
						imageUrl: 'https://image.tmdb.org/t/p/w500/fight-club.jpg',
						posterUrl: 'https://image.tmdb.org/t/p/w342/fight-club.jpg'
					},
					{
						id: 420,
						mediaType: 'tv',
						title: 'Dark',
						date: '2017-12-01',
						rating: 8.2,
						genres: [{ id: 9648, name: 'Mystery' }],
						imageUrl: 'https://image.tmdb.org/t/p/w500/dark.jpg',
						posterUrl: 'https://image.tmdb.org/t/p/w342/dark.jpg'
					}
				],
				hasMore: false
			});
		});
	});
});
