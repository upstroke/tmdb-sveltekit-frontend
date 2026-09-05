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
 * @returns {{ apiKeyMissing: string, moreTvShowsLoadError: string }}
 */
function createMessages() {
	return {
		apiKeyMissing: 'API key missing',
		moreTvShowsLoadError: 'More TV shows could not be loaded.'
	};
}

describe('tv shows server route GET', () => {
	beforeEach(() => {
		vi.resetModules();
		vi.clearAllMocks();
		mockResolveLocale.mockReturnValue('en-US');
		mockGetLocaleText.mockReturnValue({ messages: createMessages() });
	});

	// Statement coverage: the route loads a TV page, deduplicates cards by id-mediaType, and returns paging data.
	it('loads TV shows deduplicated with paging data', async () => {
		const api = {
			getTrendingTVShows: vi.fn().mockResolvedValue({
				results: [
					{ id: 420, mediaType: 'tv', title: 'Dark' },
					{ id: 420, mediaType: 'tv', title: 'Dark Duplicate' },
					{ id: 1399, mediaType: 'tv', title: 'Game of Thrones' }
				],
				page: 4,
				hasMore: true
			})
		};
		mockCreateTmdbApi.mockReturnValue(api);
		const { GET } = await import('../../../src/routes/tv-shows/+server.js');

		const response = await GET({
			fetch: vi.fn(),
			url: createUrl('?page=4&locale=en')
		});

		expect(mockResolveLocale).toHaveBeenCalledWith('en');
		expect(api.getTrendingTVShows).toHaveBeenCalledWith(4);
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({
			cards: [
				{ id: 420, mediaType: 'tv', title: 'Dark Duplicate' },
				{ id: 1399, mediaType: 'tv', title: 'Game of Thrones' }
			],
			page: 4,
			hasMore: true,
			error: null
		});
	});

	// Statement coverage: invalid page numbers are normalized to page one and missing API page values fall back to the request value.
	it('normalizes invalid page numbers to one', async () => {
		const api = {
			getTrendingTVShows: vi.fn().mockResolvedValue({
				results: [{ id: 66732, mediaType: 'tv', title: 'Stranger Things' }],
				hasMore: false
			})
		};
		mockCreateTmdbApi.mockReturnValue(api);
		const { GET } = await import('../../../src/routes/tv-shows/+server.js');

		const response = await GET({
			fetch: vi.fn(),
			url: createUrl('?page=-2')
		});

		expect(api.getTrendingTVShows).toHaveBeenCalledWith(1);
		expect(await response.json()).toEqual({
			cards: [{ id: 66732, mediaType: 'tv', title: 'Stranger Things' }],
			page: 1,
			hasMore: false,
			error: null
		});
	});

	// Statement coverage: if TV loading fails, the route returns status 500 and the localized error message.
	it('returns a localized error message when loading fails', async () => {
		const api = {
			getTrendingTVShows: vi.fn().mockRejectedValue(new Error('tv page failed'))
		};
		mockCreateTmdbApi.mockReturnValue(api);
		const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		const { GET } = await import('../../../src/routes/tv-shows/+server.js');

		const response = await GET({
			fetch: vi.fn(),
			url: createUrl('?page=6')
		});

		expect(response.status).toBe(500);
		expect(await response.json()).toEqual({
			cards: [],
			page: 6,
			hasMore: false,
			error: 'More TV shows could not be loaded.'
		});
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			'Failed to load more tv shows:',
			expect.any(Error)
		);
	});
});
