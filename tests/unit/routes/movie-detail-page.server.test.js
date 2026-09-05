import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mappedFixtures, rawResponses } from '$tests/fixtures/tmdb/tmdb.fixtures';

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
 * Creates a test URL for the movie detail route.
 *
 * @param {string} [search] - Search query string.
 * @returns {URL}
 */
function createUrl(search = '') {
	return new URL(`https://example.com/movies/680${search}`);
}

/**
 * Creates a mock messages object for i18n.
 *
 * @returns {{ apiKeyMissing: string, movieLoadError: string }}
 */
function createMessages() {
	return {
		apiKeyMissing: 'API key missing',
		movieLoadError: 'Movie could not be loaded'
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
		trailerUrls: ['https://youtube.com/watch?v=secondTrailer'],
		imageUrl: '/images/pulp-fiction.jpg',
		posterUrl: '/posters/pulp-fiction.jpg',
		...overrides
	};
}

describe('movie detail route load', () => {
	beforeEach(() => {
		vi.resetModules();
		vi.clearAllMocks();
		mockResolveLocale.mockReturnValue('en-US');
		mockGetLocaleText.mockReturnValue({ messages: createMessages() });
	});

	// Statement coverage: the movie detail route loads details and providers in parallel and returns the movie object with trailer list.
	it('successfully loads movie details and providers', async () => {
		const providers = {
			link: rawResponses.movieWatchProviders.results.US.link,
			providers: [
				{
					providerId: 8,
					providerName: 'Netflix',
					type: 'flatrate',
					link: rawResponses.movieWatchProviders.results.US.link,
					logoPath: '/netflix.png',
					displayPriority: 1
				}
			]
		};
		const api = {
			getMovieDetails: vi.fn().mockResolvedValue(createMovieDetails()),
			getWatchProviders: vi.fn().mockResolvedValue(providers)
		};
		mockCreateTmdbApi.mockReturnValue(api);
		const { load } = await import('../../../src/routes/movies/[id]/+page.server.js');

		const result = await load({
			fetch: vi.fn(),
			params: { id: '680' },
			url: createUrl('?locale=en')
		});

		expect(mockResolveLocale).toHaveBeenCalledWith('en');
		expect(api.getMovieDetails).toHaveBeenCalledWith('680');
		expect(api.getWatchProviders).toHaveBeenCalledWith('movie', '680');
		expect(result).toEqual({
			movie: createMovieDetails(),
			providers,
			error: null
		});
	});

	// Statement coverage: if trailerUrls is missing in the details, the route adds an empty array as fallback.
	it('adds an empty trailer array as fallback', async () => {
		const providers = null;
		const movieDetailsWithoutTrailers = createMovieDetails({ trailerUrls: undefined });
		const api = {
			getMovieDetails: vi.fn().mockResolvedValue(movieDetailsWithoutTrailers),
			getWatchProviders: vi.fn().mockResolvedValue(providers)
		};
		mockCreateTmdbApi.mockReturnValue(api);
		const { load } = await import('../../../src/routes/movies/[id]/+page.server.js');

		const result = await load({
			fetch: vi.fn(),
			params: { id: '680' },
			url: createUrl()
		});

		expect(result.movie.trailerUrls).toEqual([]);
		expect(result.providers).toBeNull();
	});

	// Statement coverage: if detail or provider loading fails, the error message from the error object is returned.
	it('returns the error message when movie loading fails', async () => {
		const api = {
			getMovieDetails: vi.fn().mockRejectedValue(new Error('movie details failed')),
			getWatchProviders: vi.fn().mockResolvedValue(null)
		};
		mockCreateTmdbApi.mockReturnValue(api);
		const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		const { load } = await import('../../../src/routes/movies/[id]/+page.server.js');

		const result = await load({
			fetch: vi.fn(),
			params: { id: '680' },
			url: createUrl()
		});

		expect(result).toEqual({
			movie: null,
			error: 'movie details failed'
		});
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			'Failed to load movie details:',
			expect.any(Error)
		);
	});
});
