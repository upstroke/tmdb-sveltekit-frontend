import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTmdbApi } from '$lib/services/tmdb-api';
import { rawResponses } from '$tests/fixtures/tmdb/tmdb.fixtures.js';

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
		// Anweisungsüberdeckung: Eine Listenabfrage wird vollständig gemappt und mit Zertifizierungen angereichert.
		it('lädt eine Liste, mappt die Karten und reichert sie mit Zertifizierungen an', async () => {
			const fetchFn = vi
				.fn()
				.mockResolvedValueOnce(createJsonResponse(rawResponses.movieList))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.movieGenres))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.emptyTvGenres))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.movieCertification));
			const api = createTmdbApi(fetchFn, 'test-api-key', 'de-DE');

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
						certification: 'FSK 16'
					}
				],
				hasMore: true
			});
		});
	});

	describe('searchMedia', () => {
		// Anweisungsüberdeckung: Eine Suche liefert nur normalisierte Treffer für unterstützte Medientypen zurück.
		it('liefert nur unterstützte Medientypen als normalisierte Suchtreffer zurück', async () => {
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
