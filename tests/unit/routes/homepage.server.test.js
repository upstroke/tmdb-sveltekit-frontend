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
 * Creates a test URL with optional search params.
 *
 * @param {string} search - Search query string.
 * @returns {URL}
 */
function createUrl(search = '') {
	return new URL(`https://example.com/${search}`);
}

/**
 * Creates a mock messages object for i18n.
 *
 * @returns {{ apiKeyMissing: string, contentLoadError: string }}
 */
function createMessages() {
	return {
		apiKeyMissing: 'API key missing',
		contentLoadError: 'Could not load homepage'
	};
}

/**
 * Creates a mock featured details object with optional overrides.
 *
 * @param {Object} [overrides] - Properties to override.
 * @returns {Object}
 */
function createFeaturedDetails(overrides = {}) {
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

describe('homepage route load', () => {
	beforeEach(() => {
		vi.resetModules();
		vi.clearAllMocks();
		mockResolveLocale.mockReturnValue('de-DE');
		mockGetLocaleText.mockReturnValue({ messages: createMessages() });
	});

	// Statement coverage: the homepage loads all requested trending pages and derives featured and card data.
	it('successfully loads the homepage with multiple trending pages', async () => {
		const api = {
			getTrendingAll: vi
				.fn()
				.mockResolvedValueOnce({
					results: [
						{ id: 680, mediaType: 'movie', title: 'Pulp Fiction' },
						{ id: 420, mediaType: 'tv', title: 'Dark' }
					],
					hasMore: true
				})
				.mockResolvedValueOnce({
					results: [{ id: 550, mediaType: 'movie', title: 'Fight Club' }],
					hasMore: false
				}),
			getMovieDetails: vi.fn().mockResolvedValue(createFeaturedDetails()),
			getTVShowDetails: vi.fn()
		};
		mockCreateTmdbApi.mockReturnValue(api);
		const { load } = await import('../../../src/routes/+page.server.js');

		const result = await load({ fetch: vi.fn(), url: createUrl('?page=2&locale=de') });

		expect(mockResolveLocale).toHaveBeenCalledWith('de');
		expect(mockCreateTmdbApi).toHaveBeenCalledWith(expect.any(Function), 'test-api-key', 'de-DE');
		expect(api.getTrendingAll).toHaveBeenNthCalledWith(1, 1);
		expect(api.getTrendingAll).toHaveBeenNthCalledWith(2, 2);
		expect(api.getMovieDetails).toHaveBeenCalledWith(680);
		expect(api.getTVShowDetails).not.toHaveBeenCalled();
		expect(result).toEqual({
			featured: createFeaturedDetails(),
			cards: [
				{ id: 680, mediaType: 'movie', title: 'Pulp Fiction' },
				{ id: 420, mediaType: 'tv', title: 'Dark' },
				{ id: 550, mediaType: 'movie', title: 'Fight Club' }
			],
			page: 2,
			hasMore: false,
			error: null
		});
	});

	// Statement coverage: a TV featured entry uses the TV detail path instead of the movie detail path.
	it('loads featured details via the TV path for TV entries', async () => {
		const tvDetails = createFeaturedDetails({
			id: 420,
			mediaType: 'tv',
			title: 'Dark',
			releaseDate: '2017-12-01',
			imageUrl: '/images/dark.jpg',
			posterUrl: '/posters/dark.jpg'
		});
		const api = {
			getTrendingAll: vi.fn().mockResolvedValue({
				results: [{ id: 420, mediaType: 'tv', title: 'Dark' }],
				hasMore: false
			}),
			getMovieDetails: vi.fn(),
			getTVShowDetails: vi.fn().mockResolvedValue(tvDetails)
		};
		mockCreateTmdbApi.mockReturnValue(api);
		const { load } = await import('../../../src/routes/+page.server.js');

		const result = await load({ fetch: vi.fn(), url: createUrl('?page=1') });

		expect(api.getTVShowDetails).toHaveBeenCalledWith(420);
		expect(api.getMovieDetails).not.toHaveBeenCalled();
		expect(result.featured).toEqual(tvDetails);
	});

	// Statement coverage: if only the featured detail fails after list loading, the card list is preserved and featured becomes null.
	it('falls back to null when featured details fail to load', async () => {
		const api = {
			getTrendingAll: vi.fn().mockResolvedValue({
				results: [{ id: 680, mediaType: 'movie', title: 'Pulp Fiction' }],
				hasMore: true
			}),
			getMovieDetails: vi.fn().mockRejectedValue(new Error('details failed')),
			getTVShowDetails: vi.fn()
		};
		mockCreateTmdbApi.mockReturnValue(api);
		const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		const { load } = await import('../../../src/routes/+page.server.js');

		const result = await load({ fetch: vi.fn(), url: createUrl('?page=1') });

		expect(result).toEqual({
			featured: null,
			cards: [{ id: 680, mediaType: 'movie', title: 'Pulp Fiction' }],
			page: 1,
			hasMore: true,
			error: null
		});
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			'Featured details could not be loaded:',
			expect.any(Error)
		);
	});

	// Statement coverage: if the actual list loading fails, the route returns the localized error state.
	it('returns an error state when list loading fails', async () => {
		const api = {
			getTrendingAll: vi.fn().mockRejectedValue(new Error('list failed')),
			getMovieDetails: vi.fn(),
			getTVShowDetails: vi.fn()
		};
		mockCreateTmdbApi.mockReturnValue(api);
		const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		const { load } = await import('../../../src/routes/+page.server.js');

		const result = await load({ fetch: vi.fn(), url: createUrl('?page=3') });

		expect(result).toEqual({
			featured: null,
			cards: [],
			page: 3,
			hasMore: false,
			error: 'Could not load homepage'
		});
		expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load homepage:', expect.any(Error));
	});
});
