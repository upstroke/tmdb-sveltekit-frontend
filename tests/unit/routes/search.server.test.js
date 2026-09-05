import { beforeEach, describe, expect, it, vi } from 'vitest';

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
 * Creates a test URL for the search route.
 *
 * @param {string} [search] - Search query string.
 * @returns {URL}
 */
function createUrl(search = '') {
	return new URL(`https://example.com/search${search}`);
}

/**
 * Creates a mock messages object for i18n.
 *
 * @returns {{ apiKeyMissing: string, searchError: string }}
 */
function createMessages() {
	return {
		apiKeyMissing: 'API key missing',
		searchError: 'Search could not be loaded.'
	};
}

describe('search server route GET', () => {
	beforeEach(() => {
		vi.resetModules();
		vi.clearAllMocks();
		mockResolveLocale.mockReturnValue('en-US');
		mockGetLocaleText.mockReturnValue({ messages: createMessages() });
	});

	// Statement coverage: if the query is missing or shorter than four characters, the route immediately returns empty result lists.
	it('returns empty result lists for an empty or too short query', async () => {
		const { GET } = await import('../../../src/routes/search/+server.js');

		const shortQueryResponse = await GET({
			fetch: vi.fn(),
			url: createUrl('?q=abc&locale=en')
		});
		const missingQueryResponse = await GET({
			fetch: vi.fn(),
			url: createUrl('?locale=en')
		});

		expect(mockResolveLocale).toHaveBeenCalledWith('en');
		expect(mockCreateTmdbApi).not.toHaveBeenCalled();
		expect(await shortQueryResponse.json()).toEqual({
			movies: [],
			tvShows: [],
			results: []
		});
		expect(await missingQueryResponse.json()).toEqual({
			movies: [],
			tvShows: [],
			results: []
		});
	});

	// Statement coverage: the route separates mixed search results into movies, TV shows, and the combined list.
	it('separates search results into movies and TV shows', async () => {
		const results = [
			{ id: 680, mediaType: 'movie', title: 'Pulp Fiction' },
			{ id: 420, mediaType: 'tv', title: 'Dark' },
			{ id: 13, mediaType: 'movie', title: 'Forrest Gump' }
		];
		const api = {
			searchMedia: vi.fn().mockResolvedValue({ results })
		};
		mockCreateTmdbApi.mockReturnValue(api);
		const { GET } = await import('../../../src/routes/search/+server.js');

		const response = await GET({
			fetch: vi.fn(),
			url: createUrl('?q=pulp%20fiction&locale=de')
		});

		expect(api.searchMedia).toHaveBeenCalledWith('pulp fiction');
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({
			movies: [
				{ id: 680, mediaType: 'movie', title: 'Pulp Fiction' },
				{ id: 13, mediaType: 'movie', title: 'Forrest Gump' }
			],
			tvShows: [{ id: 420, mediaType: 'tv', title: 'Dark' }],
			results
		});
	});

	// Statement coverage: if the search fails, the route returns a localized error message with status 500.
	it('returns a localized error message when search fails', async () => {
		const api = {
			searchMedia: vi.fn().mockRejectedValue(new Error('search failed'))
		};
		mockCreateTmdbApi.mockReturnValue(api);
		const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		const { GET } = await import('../../../src/routes/search/+server.js');

		const response = await GET({
			fetch: vi.fn(),
			url: createUrl('?q=dark%20series')
		});

		expect(response.status).toBe(500);
		expect(await response.json()).toEqual({
			movies: [],
			tvShows: [],
			results: [],
			error: 'Search could not be loaded.'
		});
		expect(consoleErrorSpy).toHaveBeenCalledWith('Search failed:', expect.any(Error));
	});
});
