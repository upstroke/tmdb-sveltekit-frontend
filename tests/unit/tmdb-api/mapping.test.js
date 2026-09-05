import { describe, expect, it, vi } from 'vitest';
import notAvailableImage from '$lib/assets/not-available.png';
import { createTmdbApi } from '$lib/services/tmdb-api';
import { mappedFixtures } from '$tests/fixtures/tmdb/tmdb.fixtures.js';

/**
 * Creates a TMDB API instance with a mocked fetch function.
 *
 * @returns {ReturnType<typeof createTmdbApi>}
 */
function createApi() {
	return createTmdbApi(vi.fn(), 'test-api-key');
}

describe('tmdb api mapping', () => {
	describe('mapCardItem', () => {
		// Branch coverage: invalid cards without an ID are discarded.
		it('returns null if the entry has no valid ID or unsupported media type', () => {
			const api = createApi();

			expect(api.mapCardItem(mappedFixtures.invalidCardItem)).toBeNull();
		});

		// Statement coverage: a complete movie entry is mapped to the card format.
		it('maps a complete movie entry to the internal card format', () => {
			const api = createApi();

			expect(api.mapCardItem(mappedFixtures.movieCardItem)).toEqual({
				id: 550,
				mediaType: 'movie',
				title: 'Fight Club',
				date: '1999-10-15',
				rating: 8.4,
				genres: [
					{ id: 18, name: 'Drama' },
					{ id: 53, name: 'Thriller' }
				],
				imageUrl: 'https://image.tmdb.org/t/p/w500/fight-club-poster.jpg',
				posterUrl: 'https://image.tmdb.org/t/p/w342/fight-club-poster.jpg'
			});
		});

		// Branch coverage: missing titles, genres, and image paths are normalized to fallback values.
		it('sets fallback values when title, genres, and image paths are missing', () => {
			const api = createApi();

			expect(api.mapCardItem(mappedFixtures.fallbackCardItem, 'tv')).toEqual({
				id: 77,
				mediaType: 'tv',
				title: 'N/A',
				date: '',
				rating: 0,
				genres: [{ id: 'na', name: 'N/A' }],
				imageUrl: notAvailableImage,
				posterUrl: notAvailableImage
			});
		});
	});

	describe('resolveGenres', () => {
		// Statement coverage: genre IDs are resolved to readable objects using the loaded genre maps.
		it('resolves genre IDs to genre objects based on the media type', async () => {
			const fetchFn = vi
				.fn()
				.mockResolvedValueOnce({
					ok: true,
					json: vi.fn().mockResolvedValue({ genres: [{ id: 18, name: 'Drama' }] })
				})
				.mockResolvedValueOnce({
					ok: true,
					json: vi.fn().mockResolvedValue({ genres: [{ id: 9648, name: 'Mystery' }] })
				});
			const api = createTmdbApi(fetchFn, 'test-api-key', 'de-DE');

			await api.loadGenreMaps();

			expect(api.resolveGenres([18], 'movie')).toEqual([{ id: 18, name: 'Drama' }]);
			expect(api.resolveGenres([9648], 'tv')).toEqual([{ id: 9648, name: 'Mystery' }]);
		});

		// Branch coverage: repeated loading with filled caches exits the function immediately without further requests.
		it('does not load genre maps a second time after initial population', async () => {
			const fetchFn = vi
				.fn()
				.mockResolvedValueOnce({
					ok: true,
					json: vi.fn().mockResolvedValue({ genres: [{ id: 18, name: 'Drama' }] })
				})
				.mockResolvedValueOnce({
					ok: true,
					json: vi.fn().mockResolvedValue({ genres: [{ id: 9648, name: 'Mystery' }] })
				});
			const api = createTmdbApi(fetchFn, 'test-api-key', 'de-DE');

			await api.loadGenreMaps();
			await api.loadGenreMaps();

			expect(fetchFn).toHaveBeenCalledTimes(2);
		});
	});

	describe('mapFeaturedItem', () => {
		// Statement coverage: featured data is transformed to the UI format.
		it('maps featured data with backdrop and poster images correctly', () => {
			const api = createApi();

			expect(api.mapFeaturedItem(mappedFixtures.featuredItem)).toEqual({
				id: 420,
				mediaType: 'tv',
				title: 'Dark',
				releaseDate: '2017-12-01',
				overview: 'A missing child brings dark secrets to light.',
				homepage: 'https://example.com/dark',
				genres: [{ id: 9648, name: 'Mystery' }],
				imageUrl: 'https://image.tmdb.org/t/p/w780/dark-backdrop.jpg',
				posterUrl: 'https://image.tmdb.org/t/p/w342/dark-poster.jpg'
			});
		});
	});

	describe('getTrailerUrls', () => {
		// Statement coverage: all matching YouTube trailers are retained in their original order.
		it('returns all matching YouTube trailers in their existing order', () => {
			const api = createApi();

			expect(api.getTrailerUrls(mappedFixtures.details)).toEqual([
				'https://www.youtube.com/watch?v=firstTrailer',
				'https://www.youtube.com/watch?v=secondTrailer'
			]);
		});

		// Branch coverage: a single matching YouTube trailer is returned as a single-entry list.
		it('returns exactly one entry when only one matching YouTube trailer exists', () => {
			const api = createApi();

			expect(api.getTrailerUrls(mappedFixtures.trailerDetailsWithSingleMatch)).toEqual([
				'https://www.youtube.com/watch?v=youtubeSingle'
			]);
		});

		// Branch coverage: an empty list is returned when no matching YouTube trailer exists.
		it('returns an empty list when no matching YouTube trailer exists', () => {
			const api = createApi();

			expect(api.getTrailerUrls(mappedFixtures.trailerDetailsWithoutMatch)).toEqual([]);
		});
	});

	describe('mapCast', () => {
		// Branch coverage: the cast list is limited to a maximum of twenty people and provided with an image fallback.
		it('limits the cast list to twenty entries and sets the fallback for missing profile images', () => {
			const api = createApi();
			const mappedCast = api.mapCast(mappedFixtures.cast);

			expect(mappedCast).toHaveLength(20);
			expect(mappedCast[0]).toEqual({
				id: 1,
				creditId: 'cast-1',
				name: 'Cast Person 1',
				character: 'Character 1',
				order: 0,
				profilePath: '',
				imageUrl: notAvailableImage
			});
			expect(mappedCast[19]).toEqual({
				id: 20,
				creditId: 'cast-20',
				name: 'Cast Person 20',
				character: 'Character 20',
				order: 19,
				profilePath: '/cast-20.jpg',
				imageUrl: 'https://image.tmdb.org/t/p/w185/cast-20.jpg'
			});
		});
	});

	describe('mapCrew', () => {
		// Branch coverage: the crew list is limited to a maximum of twenty entries and normalizes optional fields.
		it('limits the crew list to twenty entries and normalizes missing fields', () => {
			const api = createApi();
			const mappedCrew = api.mapCrew(mappedFixtures.crew);

			expect(mappedCrew).toHaveLength(20);
			expect(mappedCrew[0]).toEqual({
				id: 1,
				creditId: 'crew-1',
				name: 'Crew Person 1',
				job: '',
				department: '',
				profilePath: '',
				imageUrl: notAvailableImage
			});
			expect(mappedCrew[19]).toEqual({
				id: 20,
				creditId: 'crew-20',
				name: 'Crew Person 20',
				job: 'Job 20',
				department: 'Department 20',
				profilePath: '/crew-20.jpg',
				imageUrl: 'https://image.tmdb.org/t/p/w185/crew-20.jpg'
			});
		});
	});

	describe('mapDetails', () => {
		// Statement coverage: detail data including trailer list, cast, crew, and certification is fully mapped.
		it('maps complete detail data to the internal detail format', () => {
			const api = createApi();

			expect(api.mapDetails(mappedFixtures.detailsWithCredits, 'movie')).toEqual({
				id: 680,
				mediaType: 'movie',
				title: 'Pulp Fiction',
				releaseDate: '1994-09-10',
				overview: 'Multiple stories intertwine in Los Angeles.',
				homepage: 'https://example.com/pulp-fiction',
				trailerUrls: [
					'https://www.youtube.com/watch?v=firstTrailer',
					'https://www.youtube.com/watch?v=secondTrailer'
				],
				genres: [{ id: 53, name: 'Thriller' }],
				rating: 8.5,
				runtime: 154,
				episodeRunTime: [45],
				productionCompanies: [{ id: 14, name: 'Miramax' }],
				imageUrl: 'https://image.tmdb.org/t/p/w1280/pulp-fiction-backdrop.jpg',
				posterUrl: 'https://image.tmdb.org/t/p/w342/pulp-fiction-poster.jpg',
				cast: api.mapCast(mappedFixtures.cast),
				crew: api.mapCrew(mappedFixtures.crew),
				certification: 'PG'
			});
		});
	});
});
