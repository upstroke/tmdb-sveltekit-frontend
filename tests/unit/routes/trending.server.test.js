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
 * Creates a test URL for the trending route.
 *
 * @param {string} [search] - Search query string.
 * @returns {URL}
 */
function createUrl(search = '') {
	return new URL(`https://example.com/trending${search}`);
}

/**
 * Creates a mock messages object for i18n.
 *
 * @returns {{ apiKeyMissing: string, loadMoreError: string }}
 */
function createMessages() {
	return {
		apiKeyMissing: 'API key missing',
		loadMoreError: 'More content could not be loaded.'
	};
}

describe('trending server route GET', () => {
	beforeEach(() => {
		vi.resetModules();
		vi.clearAllMocks();
		mockResolveLocale.mockReturnValue('en-US');
		mockGetLocaleText.mockReturnValue({ messages: createMessages() });
	});

	// Statement coverage: the route loads mixed trending content and returns it without deduplication with paging data.
	it('loads trending content with paging data', async () => {
		const api = {
			getTrendingAll: vi.fn().mockResolvedValue({
				results: [
					{ id: 680, mediaType: 'movie', title: 'Pulp Fiction' },
					{ id: 420, mediaType: 'tv', title: 'Dark' },
					{ id: 680, mediaType: 'movie', title: 'Pulp Fiction Duplicate' }
				],
				page: 2,
				hasMore: true
			})
		};
		mockCreateTmdbApi.mockReturnValue(api);
		const { GET } = await import('../../../src/routes/trending/+server.js');

		const response = await GET({
			fetch: vi.fn(),
			url: createUrl('?page=2&locale=en')
		});

		expect(mockResolveLocale).toHaveBeenCalledWith('en');
		expect(api.getTrendingAll).toHaveBeenCalledWith(2);
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({
			cards: [
				{ id: 680, mediaType: 'movie', title: 'Pulp Fiction' },
				{ id: 420, mediaType: 'tv', title: 'Dark' },
				{ id: 680, mediaType: 'movie', title: 'Pulp Fiction Duplicate' }
			],
			page: 2,
			hasMore: true,
			error: null
		});
	});

	// Statement coverage: invalid page numbers are normalized to page one and missing API page values fall back to the request value.
	it('normalizes invalid page numbers to one', async () => {
		const api = {
			getTrendingAll: vi.fn().mockResolvedValue({
				results: [{ id: 13, mediaType: 'movie', title: 'Forrest Gump' }],
				hasMore: false
			})
		};
		mockCreateTmdbApi.mockReturnValue(api);
		const { GET } = await import('../../../src/routes/trending/+server.js');

		const response = await GET({
			fetch: vi.fn(),
			url: createUrl('?page=NaN')
		});

		expect(api.getTrendingAll).toHaveBeenCalledWith(1);
		expect(await response.json()).toEqual({
			cards: [{ id: 13, mediaType: 'movie', title: 'Forrest Gump' }],
			page: 1,
			hasMore: false,
			error: null
		});
	});

	// Statement coverage: if trending loading fails, the route returns status 500 and the localized error message.
	it('returns a localized error message when loading fails', async () => {
		const api = {
			getTrendingAll: vi.fn().mockRejectedValue(new Error('trending failed'))
		};
		mockCreateTmdbApi.mockReturnValue(api);
		const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		const { GET } = await import('../../../src/routes/trending/+server.js');

		const response = await GET({
			fetch: vi.fn(),
			url: createUrl('?page=7')
		});

		expect(response.status).toBe(500);
		expect(await response.json()).toEqual({
			cards: [],
			page: 7,
			hasMore: false,
			error: 'More content could not be loaded.'
		});
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			'Failed to load trending content:',
			expect.any(Error)
		);
	});
});
