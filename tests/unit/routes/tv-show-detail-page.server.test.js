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
 * Creates a test URL for the TV show detail route.
 *
 * @param {string} [search] - Search query string.
 * @returns {URL}
 */
function createUrl(search = '') {
	return new URL(`https://example.com/tv-shows/420${search}`);
}

/**
 * Creates a mock messages object for i18n.
 *
 * @returns {{ apiKeyMissing: string, tvShowLoadError: string }}
 */
function createMessages() {
	return {
		apiKeyMissing: 'API key missing',
		tvShowLoadError: 'TV show could not be loaded'
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
		trailerUrls: ['https://youtube.com/watch?v=youtubeSingle'],
		imageUrl: '/images/dark.jpg',
		posterUrl: '/posters/dark.jpg',
		...overrides
	};
}

describe('tv show detail route load', () => {
	beforeEach(() => {
		vi.resetModules();
		vi.clearAllMocks();
		mockResolveLocale.mockReturnValue('en-US');
		mockGetLocaleText.mockReturnValue({ messages: createMessages() });
	});

	// Statement coverage: the TV detail route loads TV details and attaches the provider response to the result.
	it('successfully loads TV details and providers', async () => {
		const providers = {
			link: rawResponses.tvWatchProviders.results.US.link,
			providers: [
				{
					providerId: 119,
					providerName: 'Amazon Video',
					type: 'buy',
					link: rawResponses.tvWatchProviders.results.US.link,
					logoPath: '/amazon.png',
					displayPriority: 2
				}
			]
		};
		const api = {
			getTVShowDetails: vi.fn().mockResolvedValue(createTvDetails()),
			getWatchProviders: vi.fn().mockResolvedValue(providers)
		};
		mockCreateTmdbApi.mockReturnValue(api);
		const { load } = await import('../../../src/routes/tv-shows/[id]/+page.server.js');

		const result = await load({
			fetch: vi.fn(),
			params: { id: '420' },
			url: createUrl('?locale=en')
		});

		expect(mockResolveLocale).toHaveBeenCalledWith('en');
		expect(api.getTVShowDetails).toHaveBeenCalledWith('420');
		expect(api.getWatchProviders).toHaveBeenCalledWith('tv', '420');
		expect(result).toMatchObject({
			tvShow: createTvDetails(),
			error: null
		});
		expect(result.providers).toEqual(providers);
	});

	// Statement coverage: even an empty provider response is passed through to the result.
	it('passes through an empty provider response unchanged', async () => {
		const api = {
			getTVShowDetails: vi.fn().mockResolvedValue(createTvDetails({ trailerUrls: [] })),
			getWatchProviders: vi.fn().mockResolvedValue(null)
		};
		mockCreateTmdbApi.mockReturnValue(api);
		const { load } = await import('../../../src/routes/tv-shows/[id]/+page.server.js');

		const result = await load({
			fetch: vi.fn(),
			params: { id: '420' },
			url: createUrl()
		});

		expect(result.providers).toBeNull();
	});

	// Statement coverage: if the TV detail loading fails, the route returns the localized error message.
	it('returns the localized error message when TV loading fails', async () => {
		const api = {
			getTVShowDetails: vi.fn().mockRejectedValue(new Error('tv details failed')),
			getWatchProviders: vi.fn().mockResolvedValue(null)
		};
		mockCreateTmdbApi.mockReturnValue(api);
		const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		const { load } = await import('../../../src/routes/tv-shows/[id]/+page.server.js');

		const result = await load({
			fetch: vi.fn(),
			params: { id: '420' },
			url: createUrl()
		});

		expect(result).toEqual({
			tvShow: null,
			error: 'TV show could not be loaded'
		});
		expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load tv details:', expect.any(Error));
	});
});
