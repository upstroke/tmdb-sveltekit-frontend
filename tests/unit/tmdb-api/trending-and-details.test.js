import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTmdbApi } from '$lib/services/tmdb-api';
import { rawResponses, mappedFixtures } from '$tests/fixtures/tmdb/tmdb.fixtures';

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

describe('tmdb api trending and details', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	describe('getTrendingAll', () => {
		// Statement coverage: trending lists are loaded via the all-day endpoint and returned as a card list.
		it('loads the daily trending list via the all endpoint', async () => {
			const fetchFn = vi
				.fn()
				.mockResolvedValueOnce(
					createJsonResponse({
						...rawResponses.movieList,
						results: [
							{
								...rawResponses.movieList.results[0],
								media_type: 'movie'
							}
						],
						total_pages: 1
					})
				)
				.mockResolvedValueOnce(createJsonResponse(rawResponses.movieGenres))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.emptyTvGenres))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.movieCertification));
			const api = createTmdbApi(fetchFn, 'test-api-key', 'en-US');

			const result = await api.getTrendingAll();

			expect(result.results).toHaveLength(1);
			expect(result.results[0].mediaType).toBe('movie');
			expect(result.results[0].certification).toBe('PG');
			expect(fetchFn.mock.calls[0][0]).toContain('/trending/all/day');
		});
	});

	describe('getTrendingMovies', () => {
		// Statement coverage: movie trends are loaded via the movie-day endpoint and returned normalized including certification.
		it('loads the daily trending movie list via the movie endpoint', async () => {
			const fetchFn = vi
				.fn()
				.mockResolvedValueOnce(createJsonResponse(rawResponses.movieList))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.movieGenres))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.emptyTvGenres))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.movieCertification));
			const api = createTmdbApi(fetchFn, 'test-api-key', 'en-US');

			const result = await api.getTrendingMovies();

			expect(result).toMatchObject({
				page: 1,
				hasMore: true,
				results: [
					{
						id: 550,
						mediaType: 'movie',
						title: 'Fight Club',
						certification: 'PG'
					}
				]
			});
			expect(fetchFn.mock.calls[0][0]).toContain('/trending/movie/day');
		});
	});

	describe('getTrendingTVShows', () => {
		it('loads the daily trending TV show list via the tv endpoint', async () => {
			const fetchFn = vi
				.fn()
				.mockResolvedValueOnce(createJsonResponse(rawResponses.tvList))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.movieGenres))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.tvGenres))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.tvCertification));
			const api = createTmdbApi(fetchFn, 'test-api-key', 'en-US');

			const result = await api.getTrendingTVShows();

			expect(result).toMatchObject({
				page: 1,
				hasMore: false,
				results: [
					{
						id: 421,
						mediaType: 'tv',
						title: 'The Fly',
						certification: 'PG'
					}
				]
			});
			expect(fetchFn.mock.calls[0][0]).toContain('/trending/tv/day');
		});
	});

	describe('getPopularMovies', () => {
		// Statement coverage: the popular movie list is loaded via the movie-popular endpoint and returned enriched.
		it('loads the popular movie list via the popular endpoint', async () => {
			const fetchFn = vi
				.fn()
				.mockResolvedValueOnce(createJsonResponse(rawResponses.movieList))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.movieGenres))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.emptyTvGenres))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.movieCertification));
			const api = createTmdbApi(fetchFn, 'test-api-key', 'en-US');

			const result = await api.getPopularMovies();

			expect(result).toMatchObject({
				page: 1,
				hasMore: true,
				results: [
					{
						id: 550,
						mediaType: 'movie',
						title: 'Fight Club',
						certification: 'PG'
					}
				]
			});
			expect(fetchFn.mock.calls[0][0]).toContain('/movie/popular');
		});
	});

	describe('getTopRatedMovies', () => {
		// Statement coverage: the top-rated movie list is loaded via the movie-top-rated endpoint and returned with certification.
		it('loads the top-rated movie list via the top-rated endpoint', async () => {
			const fetchFn = vi
				.fn()
				.mockResolvedValueOnce(createJsonResponse(rawResponses.movieList))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.movieGenres))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.emptyTvGenres))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.movieCertification));
			const api = createTmdbApi(fetchFn, 'test-api-key', 'en-US');

			const result = await api.getTopRatedMovies();

			expect(result).toMatchObject({
				page: 1,
				hasMore: true,
				results: [
					{
						id: 550,
						mediaType: 'movie',
						title: 'Fight Club',
						certification: 'PG'
					}
				]
			});
			expect(fetchFn.mock.calls[0][0]).toContain('/movie/top_rated');
		});
	});

	describe('getPopularTVShows', () => {
		// Statement coverage: the popular TV show list is loaded via the tv-popular endpoint and normalized with TV rating.
		it('loads the popular TV show list via the popular endpoint', async () => {
			const fetchFn = vi
				.fn()
				.mockResolvedValueOnce(createJsonResponse(rawResponses.tvList))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.movieGenres))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.tvGenres))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.tvCertification));
			const api = createTmdbApi(fetchFn, 'test-api-key', 'en-US');

			const result = await api.getPopularTVShows();

			expect(result).toMatchObject({
				page: 1,
				hasMore: false,
				results: [
					{
						id: 421,
						mediaType: 'tv',
						title: 'The Fly',
						certification: 'PG'
					}
				]
			});
			expect(fetchFn.mock.calls[0][0]).toContain('/tv/popular');
		});
	});

	describe('getTopRatedTVShows', () => {
		// Statement coverage: the top-rated TV show list is loaded via the tv-top-rated endpoint and returned as a TV card list.
		it('loads the top-rated TV show list via the top-rated endpoint', async () => {
			const fetchFn = vi
				.fn()
				.mockResolvedValueOnce(createJsonResponse(rawResponses.tvList))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.movieGenres))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.tvGenres))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.tvCertification));
			const api = createTmdbApi(fetchFn, 'test-api-key', 'en-US');

			const result = await api.getTopRatedTVShows();

			expect(result).toMatchObject({
				page: 1,
				hasMore: false,
				results: [
					{
						id: 421,
						mediaType: 'tv',
						title: 'The Fly',
						certification: 'PG'
					}
				]
			});
			expect(fetchFn.mock.calls[0][0]).toContain('/tv/top_rated');
		});
	});

	describe('getFeaturedToday', () => {
		// Statement coverage: today's featured item is selected from the trending list, loaded in detail, and fully enriched.
		it("loads today's featured movie from the trending list including details and providers", async () => {
			const fetchFn = vi
				.fn()
				.mockResolvedValueOnce(createJsonResponse(rawResponses.featuredTodayMovieList))
				.mockResolvedValueOnce(
					createJsonResponse({
						...mappedFixtures.details,
						media_type: 'movie',
						credits: { cast: [], crew: [] }
					})
				)
				.mockResolvedValueOnce(createJsonResponse(rawResponses.movieCertification))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.movieWatchProviders));
			const api = createTmdbApi(fetchFn, 'test-api-key', 'en-US');

			await expect(api.getFeaturedToday()).resolves.toMatchObject({
				id: 680,
				mediaType: 'movie',
				title: 'Pulp Fiction',
				certification: 'PG',
				providers: {
					link: 'https://example.com/watch/de',
					providers: [
						{
							providerId: 8,
							providerName: 'Netflix',
							type: 'flatrate',
							link: 'https://example.com/watch/de'
						}
					]
				},
				trailerUrls: [
					'https://www.youtube.com/watch?v=firstTrailer',
					'https://www.youtube.com/watch?v=secondTrailer'
				]
			});
			expect(fetchFn.mock.calls[0][0]).toContain('/trending/all/day');
			expect(fetchFn.mock.calls[1][0]).toContain('/movie/680');
		});

		// Branch coverage: an empty trending list returns no featured item without further detail requests.
		it('returns null when the trending list contains no featured item', async () => {
			const fetchFn = vi.fn().mockResolvedValueOnce(createJsonResponse({ results: [] }));
			const api = createTmdbApi(fetchFn, 'test-api-key', 'de-DE');

			await expect(api.getFeaturedToday()).resolves.toBeNull();
			expect(fetchFn).toHaveBeenCalledTimes(1);
			expect(fetchFn.mock.calls[0][0]).toContain('/trending/all/day');
		});
	});

	describe('getMovieDetails', () => {
		// Statement coverage: movie details are fully enriched including certification and providers.
		it('loads movie details including certification and watch providers', async () => {
			const fetchFn = vi
				.fn()
				.mockResolvedValueOnce(
					createJsonResponse({
						...mappedFixtures.details,
						media_type: 'movie',
						episode_run_time: [],
						credits: {
							cast: [],
							crew: []
						}
					})
				)
				.mockResolvedValueOnce(createJsonResponse(rawResponses.movieCertification))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.movieWatchProviders));
			const api = createTmdbApi(fetchFn, 'test-api-key', 'en-US');

			await expect(api.getMovieDetails(680)).resolves.toMatchObject({
				id: 680,
				mediaType: 'movie',
				title: 'Pulp Fiction',
				certification: 'PG',
				providers: {
					link: 'https://example.com/watch/de',
					providers: [
						{
							providerId: 8,
							providerName: 'Netflix',
							type: 'flatrate',
							link: 'https://example.com/watch/de'
						}
					]
				},
				trailerUrls: [
					'https://www.youtube.com/watch?v=firstTrailer',
					'https://www.youtube.com/watch?v=secondTrailer'
				]
			});
		});
	});

	describe('getTVShowDetails', () => {
		// Statement coverage: TV details are fully enriched including content rating and providers.
		it('loads TV details including certification and watch providers', async () => {
			const fetchFn = vi
				.fn()
				.mockResolvedValueOnce(
					createJsonResponse({
						...mappedFixtures.featuredItem,
						media_type: 'tv',
						vote_average: 8.2,
						episode_run_time: [45],
						production_companies: [{ id: 1, name: 'Wiedemann & Berg' }],
						videos: {
							results: [{ site: 'YouTube', type: 'Trailer', key: 'darkTrailer' }]
						},
						credits: {
							cast: [],
							crew: []
						}
					})
				)
				.mockResolvedValueOnce(createJsonResponse(rawResponses.tvCertification))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.tvWatchProviders));
			const api = createTmdbApi(fetchFn, 'test-api-key', 'en-US');

			await expect(api.getTVShowDetails(420)).resolves.toMatchObject({
				id: 420,
				mediaType: 'tv',
				title: 'Dark',
				certification: 'PG',
				providers: {
					link: 'https://example.com/watch/dark',
					providers: [
						{
							providerId: 119,
							providerName: 'Amazon Video',
							type: 'buy',
							link: 'https://example.com/watch/dark'
						}
					]
				},
				trailerUrls: ['https://www.youtube.com/watch?v=darkTrailer']
			});
		});
	});
});
