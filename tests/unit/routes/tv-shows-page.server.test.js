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
 * Creates a test URL for the TV shows route.
 *
 * @param {string} [search] - Search query string.
 * @returns {URL}
 */
function createUrl(search = '') {
	return new URL(`https://example.com/tv-shows${search}`);
}

/**
 * Creates a mock messages object for i18n.
 *
 * @returns {{ apiKeyMissing: string, tvShowsLoadError: string }}
 */
function createMessages() {
	return {
		apiKeyMissing: 'API key missing',
		tvShowsLoadError: 'Could not load tv shows'
	};
}

/**
 * Creates a mock TV details object with optional overrides.
 *
 * @param {Object} [overrides] - Properties to override.
 * @returns {Object}
 */
function createTvDetails(overrides = {}) {
	return {
		id: mappedFixtures.featuredItem.id,
		mediaType: 'tv',
		title: mappedFixtures.featuredItem.name,
		releaseDate: '2017-12-01',
		overview: mappedFixtures.featuredItem.overview,
		homepage: mappedFixtures.featuredItem.homepage,
		genres: mappedFixtures.featuredItem.genres,
		imageUrl: '/images/dark.jpg',
		posterUrl: '/posters/dark.jpg',
		...overrides
	};
}

describe('tv shows page route load', () => {
	beforeEach(() => {
		vi.resetModules();
		vi.clearAllMocks();
		mockResolveLocale.mockReturnValue('en-US');
		mockGetLocaleText.mockReturnValue({ messages: createMessages() });
	});

	// Statement coverage: the TV route loads multiple pages, removes duplicate cards by id-mediaType, and builds the featured object from the preferred candidate.
	it('loads multiple TV pages, deduplicates cards, and sets featured', async () => {
		const api = {
			getTrendingTVShows: vi
				.fn()
				.mockResolvedValueOnce({
					results: [
						{ id: 99, mediaType: 'tv', title: 'First Placeholder' },
						{ id: 420, mediaType: 'tv', title: 'Dark' }
					],
					hasMore: true
				})
				.mockResolvedValueOnce({
					results: [
						{ id: 420, mediaType: 'tv', title: 'Dark' },
						{ id: 777, mediaType: 'tv', title: 'Severance Clone' }
					],
					hasMore: false
				}),
			getTVShowDetails: vi.fn().mockResolvedValue(createTvDetails())
		};
		mockCreateTmdbApi.mockReturnValue(api);
		const { load } = await import('../../../src/routes/tv-shows/+page.server.js');

		const result = await load({ fetch: vi.fn(), url: createUrl('?page=2&locale=en') });

		expect(api.getTrendingTVShows).toHaveBeenNthCalledWith(1, 1);
		expect(api.getTrendingTVShows).toHaveBeenNthCalledWith(2, 2);
		expect(api.getTVShowDetails).toHaveBeenCalledWith(420);
		expect(result).toEqual({
			featured: createTvDetails(),
			cards: [
				{ id: 99, mediaType: 'tv', title: 'First Placeholder' },
				{ id: 420, mediaType: 'tv', title: 'Dark' },
				{ id: 777, mediaType: 'tv', title: 'Severance Clone' }
			],
			page: 2,
			hasMore: false,
			error: null
		});
	});

	// Branch coverage: if the preferred featured candidate is missing, the TV route falls back to the first available index.
	it('falls back to the first index for TV featured selection', async () => {
		const fallbackDetails = createTvDetails({ id: 99, title: 'First Placeholder' });
		const api = {
			getTrendingTVShows: vi.fn().mockResolvedValue({
				results: [{ id: 99, mediaType: 'tv', title: 'First Placeholder' }],
				hasMore: false
			}),
			getTVShowDetails: vi.fn().mockResolvedValue(fallbackDetails)
		};
		mockCreateTmdbApi.mockReturnValue(api);
		const { load } = await import('../../../src/routes/tv-shows/+page.server.js');

		const result = await load({ fetch: vi.fn(), url: createUrl('?page=1') });

		expect(api.getTVShowDetails).toHaveBeenCalledWith(99);
		expect(result.featured).toEqual(fallbackDetails);
	});

	// Branch coverage: if only the featured detail fails, the deduplicated card list is preserved.
	it('preserves deduplicated cards when TV featured details fail', async () => {
		const api = {
			getTrendingTVShows: vi.fn().mockResolvedValue({
				results: [
					{ id: 420, mediaType: 'tv', title: 'Dark' },
					{ id: 420, mediaType: 'tv', title: 'Dark' }
				],
				hasMore: true
			}),
			getTVShowDetails: vi.fn().mockRejectedValue(new Error('details failed'))
		};
		mockCreateTmdbApi.mockReturnValue(api);
		const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		const { load } = await import('../../../src/routes/tv-shows/+page.server.js');

		const result = await load({ fetch: vi.fn(), url: createUrl('?page=1') });

		expect(result).toEqual({
			featured: null,
			cards: [{ id: 420, mediaType: 'tv', title: 'Dark' }],
			page: 1,
			hasMore: true,
			error: null
		});
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			'Featured TV-show details could not be loaded:',
			expect.any(Error)
		);
	});

	// Branch coverage: if the TV list loading fails, the route returns the localized error state.
	it('returns an error state when TV list loading fails', async () => {
		const api = {
			getTrendingTVShows: vi.fn().mockRejectedValue(new Error('list failed')),
			getTVShowDetails: vi.fn()
		};
		mockCreateTmdbApi.mockReturnValue(api);
		const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		const { load } = await import('../../../src/routes/tv-shows/+page.server.js');

		const result = await load({ fetch: vi.fn(), url: createUrl('?page=5') });

		expect(result).toEqual({
			featured: null,
			cards: [],
			page: 5,
			hasMore: false,
			error: 'Could not load tv shows'
		});
		expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load tv shows:', expect.any(Error));
	});
});
