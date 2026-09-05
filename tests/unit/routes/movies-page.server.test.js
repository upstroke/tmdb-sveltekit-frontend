import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mappedFixtures } from '$tests/fixtures/tmdb/tmdb.fixtures';

const mockResolveLocale = vi.fn();
const mockGetLocaleText = vi.fn();
const mockCreateTmdbApi = vi.fn();

vi.mock('$env/static/private', () => ({
	TMDB_API_KEY: 'test-api-key'
}));

vi.mock('$lib/i18n/helpers', () => ({
	resolveLocale: mockResolveLocale
}));

vi.mock('$lib/i18n/resolver', () => ({
	getLocaleText: mockGetLocaleText
}));

vi.mock('$lib/services/tmdb-api.js', () => ({
	createTmdbApi: mockCreateTmdbApi
}));

/**
 * Creates a test URL for the movies route.
 *
 * @param {string} [search] - Search query string.
 * @returns {URL}
 */
function createUrl(search = '') {
	return new URL(`https://example.com/movies${search}`);
}

/**
 * Creates a mock messages object for i18n.
 *
 * @returns {{ apiKeyMissing: string, moviesLoadError: string }}
 */
function createMessages() {
	return {
		apiKeyMissing: 'API key missing',
		moviesLoadError: 'Could not load movies'
	};
}

/**
 * Creates a mock movie details object with optional overrides.
 *
 * @param {Object} [overrides] - Properties to override.
 * @returns {Object}
 */
function createMovieDetails(overrides = {}) {
	return {
		id: mappedFixtures.details.id,
		mediaType: 'movie',
		title: mappedFixtures.details.title,
		releaseDate: '1994-09-10',
		overview: mappedFixtures.details.overview,
		homepage: mappedFixtures.details.homepage,
		genres: mappedFixtures.details.genres,
		imageUrl: '/images/pulp-fiction.jpg',
		posterUrl: '/posters/pulp-fiction.jpg',
		...overrides
	};
}

describe('movies page route load', () => {
	beforeEach(() => {
		vi.resetModules();
		vi.clearAllMocks();
		mockResolveLocale.mockReturnValue('en-US');
		mockGetLocaleText.mockReturnValue({ messages: createMessages() });
	});

	// Statement coverage: the movie route loads all requested trending pages and uses the preferred featured selection path from index 1.
	it('loads multiple movie pages and uses the preferred featured candidate', async () => {
		const api = {
			getTrendingMovies: vi
				.fn()
				.mockResolvedValueOnce({
					results: [
						{ id: 550, mediaType: 'movie', title: 'Fight Club' },
						{ id: 680, mediaType: 'movie', title: 'Pulp Fiction' },
						{ id: 13, mediaType: 'movie', title: 'Forrest Gump' }
					],
					hasMore: true
				})
				.mockResolvedValueOnce({
					results: [{ id: 603, mediaType: 'movie', title: 'The Matrix' }],
					hasMore: false
				}),
			getMovieDetails: vi.fn().mockResolvedValue(createMovieDetails())
		};
		mockCreateTmdbApi.mockReturnValue(api);
		const { load } = await import('../../../src/routes/movies/+page.server.js');

		const result = await load({ fetch: vi.fn(), url: createUrl('?page=2&locale=en') });

		expect(api.getTrendingMovies).toHaveBeenNthCalledWith(1, 1);
		expect(api.getTrendingMovies).toHaveBeenNthCalledWith(2, 2);
		expect(api.getMovieDetails).toHaveBeenCalledWith(680);
		expect(result).toEqual({
			featured: createMovieDetails(),
			cards: [
				{ id: 550, mediaType: 'movie', title: 'Fight Club' },
				{ id: 680, mediaType: 'movie', title: 'Pulp Fiction' },
				{ id: 13, mediaType: 'movie', title: 'Forrest Gump' },
				{ id: 603, mediaType: 'movie', title: 'The Matrix' }
			],
			page: 2,
			hasMore: false,
			error: null
		});
	});

	// Statement coverage: if the preferred featured candidate is missing, the route falls back to the next available index.
	it('falls back to index 2 and then 0 for featured selection', async () => {
		const api = {
			getTrendingMovies: vi
				.fn()
				.mockResolvedValueOnce({
					results: [
						{ id: 550, mediaType: 'movie', title: 'Fight Club' },
						undefined,
						{ id: 13, mediaType: 'movie', title: 'Forrest Gump' }
					],
					hasMore: true
				})
				.mockResolvedValueOnce({
					results: [],
					hasMore: false
				}),
			getMovieDetails: vi
				.fn()
				.mockResolvedValue(createMovieDetails({ id: 13, title: 'Forrest Gump' }))
		};
		mockCreateTmdbApi.mockReturnValue(api);
		const { load } = await import('../../../src/routes/movies/+page.server.js');

		const result = await load({ fetch: vi.fn(), url: createUrl('?page=2') });

		expect(api.getMovieDetails).toHaveBeenCalledWith(13);
		expect(result.featured).toMatchObject({ id: 13, title: 'Forrest Gump' });
	});

	// Statement coverage: if only the featured detail fails, the card list and page data are preserved.
	it('preserves cards when featured movie details fail', async () => {
		const api = {
			getTrendingMovies: vi.fn().mockResolvedValue({
				results: [{ id: 680, mediaType: 'movie', title: 'Pulp Fiction' }],
				hasMore: true
			}),
			getMovieDetails: vi.fn().mockRejectedValue(new Error('details failed'))
		};
		mockCreateTmdbApi.mockReturnValue(api);
		const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		const { load } = await import('../../../src/routes/movies/+page.server.js');

		const result = await load({ fetch: vi.fn(), url: createUrl('?page=1') });

		expect(result).toEqual({
			featured: null,
			cards: [{ id: 680, mediaType: 'movie', title: 'Pulp Fiction' }],
			page: 1,
			hasMore: true,
			error: null
		});
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			'Featured movie details could not be loaded:',
			expect.any(Error)
		);
	});

	// Statement coverage: if the movie list loading fails, the route returns the localized error state.
	it('returns an error state when movie list loading fails', async () => {
		const api = {
			getTrendingMovies: vi.fn().mockRejectedValue(new Error('list failed')),
			getMovieDetails: vi.fn()
		};
		mockCreateTmdbApi.mockReturnValue(api);
		const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		const { load } = await import('../../../src/routes/movies/+page.server.js');

		const result = await load({ fetch: vi.fn(), url: createUrl('?page=4') });

		expect(result).toEqual({
			featured: null,
			cards: [],
			page: 4,
			hasMore: false,
			error: 'Could not load movies'
		});
		expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load movies:', expect.any(Error));
	});
});
