import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTmdbApi } from '$lib/services/tmdb-api';
import { rawResponses, mappedFixtures } from '$tests/fixtures/tmdb/tmdb.fixtures';

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
		// Anweisungsüberdeckung: Trendlisten werden über den All-Day-Endpunkt geladen und als Kartenliste zurückgegeben.
		it('lädt die Daily-Trending-Liste über den all-Endpunkt', async () => {
			const fetchFn = vi
				.fn()
				.mockResolvedValueOnce(createJsonResponse({
					...rawResponses.movieList,
					results: [
						{
							...rawResponses.movieList.results[0],
							media_type: 'movie'
						}
					],
					total_pages: 1
				}))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.movieGenres))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.emptyTvGenres))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.movieCertification));
			const api = createTmdbApi(fetchFn, 'test-api-key', 'de-DE');

			const result = await api.getTrendingAll();

			expect(result.results).toHaveLength(1);
			expect(result.results[0].mediaType).toBe('movie');
			expect(result.results[0].certification).toBe('FSK 16');
			expect(fetchFn.mock.calls[0][0]).toContain('/trending/all/day');
		});
	});

	describe('getTrendingMovies', () => {
		// Anweisungsüberdeckung: Film-Trends werden über den Movie-Day-Endpunkt geladen und inklusive Zertifizierung normalisiert zurückgegeben.
		it('lädt die Daily-Trending-Filmliste über den movie-Endpunkt', async () => {
			const fetchFn = vi
				.fn()
				.mockResolvedValueOnce(createJsonResponse(rawResponses.movieList))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.movieGenres))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.emptyTvGenres))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.movieCertification));
			const api = createTmdbApi(fetchFn, 'test-api-key', 'de-DE');

			const result = await api.getTrendingMovies();

			expect(result).toMatchObject({
				page: 1,
				hasMore: true,
				results: [
					{
						id: 550,
						mediaType: 'movie',
						title: 'Fight Club',
						certification: 'FSK 16'
					}
				]
			});
			expect(fetchFn.mock.calls[0][0]).toContain('/trending/movie/day');
		});
	});

	describe('getTrendingTVShows', () => {
		it('lädt die Daily-Trending-Serienliste über den tv-Endpunkt', async () => {
			const fetchFn = vi
				.fn()
				.mockResolvedValueOnce(createJsonResponse(rawResponses.tvList))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.movieGenres))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.tvGenres))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.tvCertification));
			const api = createTmdbApi(fetchFn, 'test-api-key', 'de-DE');

			const result = await api.getTrendingTVShows();

			expect(result).toMatchObject({
				page: 1,
				hasMore: false,
				results: [
					{
						id: 421,
						mediaType: 'tv',
						title: 'Die Fliege',
						certification: '16'
					}
				]
			});
			expect(fetchFn.mock.calls[0][0]).toContain('/trending/tv/day');
		});
	});


	describe('getPopularMovies', () => {
		// Anweisungsüberdeckung: Die Popular-Filmliste wird über den Movie-Popular-Endpunkt geladen und angereichert zurückgegeben.
		it('lädt die Popular-Filmliste über den popular-Endpunkt', async () => {
			const fetchFn = vi
				.fn()
				.mockResolvedValueOnce(createJsonResponse(rawResponses.movieList))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.movieGenres))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.emptyTvGenres))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.movieCertification));
			const api = createTmdbApi(fetchFn, 'test-api-key', 'de-DE');

			const result = await api.getPopularMovies();

			expect(result).toMatchObject({
				page: 1,
				hasMore: true,
				results: [
					{
						id: 550,
						mediaType: 'movie',
						title: 'Fight Club',
						certification: 'FSK 16'
					}
				]
			});
			expect(fetchFn.mock.calls[0][0]).toContain('/movie/popular');
		});
	});

	describe('getTopRatedMovies', () => {
		// Anweisungsüberdeckung: Die Top-Rated-Filmliste wird über den Movie-Top-Rated-Endpunkt geladen und mit Zertifizierung zurückgegeben.
		it('lädt die Top-Rated-Filmliste über den top-rated-Endpunkt', async () => {
			const fetchFn = vi
				.fn()
				.mockResolvedValueOnce(createJsonResponse(rawResponses.movieList))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.movieGenres))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.emptyTvGenres))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.movieCertification));
			const api = createTmdbApi(fetchFn, 'test-api-key', 'de-DE');

			const result = await api.getTopRatedMovies();

			expect(result).toMatchObject({
				page: 1,
				hasMore: true,
				results: [
					{
						id: 550,
						mediaType: 'movie',
						title: 'Fight Club',
						certification: 'FSK 16'
					}
				]
			});
			expect(fetchFn.mock.calls[0][0]).toContain('/movie/top_rated');
		});
	});

	describe('getPopularTVShows', () => {
		// Anweisungsüberdeckung: Die Popular-Serienliste wird über den TV-Popular-Endpunkt geladen und mit TV-Freigabe normalisiert.
		it('lädt die Popular-Serienliste über den popular-Endpunkt', async () => {
			const fetchFn = vi
				.fn()
				.mockResolvedValueOnce(createJsonResponse(rawResponses.tvList))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.movieGenres))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.tvGenres))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.tvCertification));
			const api = createTmdbApi(fetchFn, 'test-api-key', 'de-DE');

			const result = await api.getPopularTVShows();

			expect(result).toMatchObject({
				page: 1,
				hasMore: false,
				results: [
					{
						id: 421,
						mediaType: 'tv',
						title: 'Die Fliege',
						certification: '16'
					}
				]
			});
			expect(fetchFn.mock.calls[0][0]).toContain('/tv/popular');
		});
	});

	describe('getTopRatedTVShows', () => {
		// Anweisungsüberdeckung: Die Top-Rated-Serienliste wird über den TV-Top-Rated-Endpunkt geladen und als TV-Kartenliste zurückgegeben.
		it('lädt die Top-Rated-Serienliste über den top-rated-Endpunkt', async () => {
			const fetchFn = vi
				.fn()
				.mockResolvedValueOnce(createJsonResponse(rawResponses.tvList))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.movieGenres))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.tvGenres))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.tvCertification));
			const api = createTmdbApi(fetchFn, 'test-api-key', 'de-DE');

			const result = await api.getTopRatedTVShows();

			expect(result).toMatchObject({
				page: 1,
				hasMore: false,
				results: [
					{
						id: 421,
						mediaType: 'tv',
						title: 'Die Fliege',
						certification: '16'
					}
				]
			});
			expect(fetchFn.mock.calls[0][0]).toContain('/tv/top_rated');
		});
	});

	describe('getFeaturedToday', () => {
		// Anweisungsüberdeckung: Das heutige Featured-Element wird aus der Trending-Liste gewählt, im Detail nachgeladen und vollständig angereichert.
		it('lädt den heutigen Featured-Film aus der Trending-Liste samt Details und Providern', async () => {
			const fetchFn = vi
				.fn()
				.mockResolvedValueOnce(createJsonResponse(rawResponses.featuredTodayMovieList))
				.mockResolvedValueOnce(createJsonResponse({
					...mappedFixtures.details,
					media_type: 'movie',
					credits: { cast: [], crew: [] }
				}))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.movieCertification))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.movieWatchProviders));
			const api = createTmdbApi(fetchFn, 'test-api-key', 'de-DE');

			await expect(api.getFeaturedToday()).resolves.toMatchObject({
				id: 680,
				mediaType: 'movie',
				title: 'Pulp Fiction',
				certification: 'FSK 16',
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
				trailerUrls: ['https://www.youtube.com/watch?v=firstTrailer', 'https://www.youtube.com/watch?v=secondTrailer']
			});
			expect(fetchFn.mock.calls[0][0]).toContain('/trending/all/day');
			expect(fetchFn.mock.calls[1][0]).toContain('/movie/680');
		});

		// Zweigüberdeckung: Eine leere Trending-Liste liefert ohne weitere Detail-Requests kein Featured-Element.
		it('gibt null zurück, wenn die Trending-Liste kein Featured-Element enthält', async () => {
			const fetchFn = vi.fn().mockResolvedValueOnce(createJsonResponse({ results: [] }));
			const api = createTmdbApi(fetchFn, 'test-api-key', 'de-DE');

			await expect(api.getFeaturedToday()).resolves.toBeNull();
			expect(fetchFn).toHaveBeenCalledTimes(1);
			expect(fetchFn.mock.calls[0][0]).toContain('/trending/all/day');
		});
	});

	describe('getMovieDetails', () => {
		// Anweisungsüberdeckung: Filmdetails werden inklusive Zertifizierung und Providern vollständig angereichert.
		it('lädt Filmdetails samt Zertifizierung und Watch-Providern', async () => {
			const fetchFn = vi
				.fn()
				.mockResolvedValueOnce(createJsonResponse({
					...mappedFixtures.details,
					media_type: 'movie',
					episode_run_time: [],
					credits: {
						cast: [],
						crew: []
					}
				}))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.movieCertification))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.movieWatchProviders));
			const api = createTmdbApi(fetchFn, 'test-api-key', 'de-DE');

			await expect(api.getMovieDetails(680)).resolves.toMatchObject({
				id: 680,
				mediaType: 'movie',
				title: 'Pulp Fiction',
				certification: 'FSK 16',
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
				trailerUrls: ['https://www.youtube.com/watch?v=firstTrailer', 'https://www.youtube.com/watch?v=secondTrailer']
			});
		});
	});

	describe('getTVShowDetails', () => {
		// Anweisungsüberdeckung: Seriendetails werden inklusive Content-Rating und Providern vollständig angereichert.
		it('lädt TV-Details samt Zertifizierung und Watch-Providern', async () => {
			const fetchFn = vi
				.fn()
				.mockResolvedValueOnce(createJsonResponse({
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
				}))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.tvCertification))
				.mockResolvedValueOnce(createJsonResponse(rawResponses.tvWatchProviders));
			const api = createTmdbApi(fetchFn, 'test-api-key', 'de-DE');

			await expect(api.getTVShowDetails(420)).resolves.toMatchObject({
				id: 420,
				mediaType: 'tv',
				title: 'Dark',
				certification: '16',
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
