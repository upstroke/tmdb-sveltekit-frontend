import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	expectMissingApiKeyJsonResponse,
	expectMissingApiKeyLoadResult
} from '$tests/setup/missing-api-key.helper';

const mockResolveLocale = vi.fn();
const mockGetLocaleText = vi.fn();
const mockCreateTmdbApi = vi.fn();

vi.mock('$env/static/private', () => ({
	TMDB_API_KEY: ''
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
 * Creates a mock messages object for i18n.
 *
 * @returns {{
 *   apiKeyMissing: string,
 *   contentLoadError: string,
 *   movieLoadError: string,
 *   tvShowLoadError: string,
 *   moreMoviesLoadError: string,
 *   moreTvShowsLoadError: string,
 *   loadMoreError: string
 * }}
 */
function createMessages() {
	return {
		apiKeyMissing: 'API key missing',
		contentLoadError: 'Could not load homepage',
		movieLoadError: 'Could not load movie details.',
		tvShowLoadError: 'Could not load TV show details.',
		moreMoviesLoadError: 'More movies could not be loaded.',
		moreTvShowsLoadError: 'More TV shows could not be loaded.',
		loadMoreError: 'More content could not be loaded.'
	};
}

/**
 * Creates a test URL with path and optional search params.
 *
 * @param {string} path - URL path.
 * @param {string} [search] - Search query string.
 * @returns {URL}
 */
function createUrl(path, search = '') {
	return new URL(`https://example.com${path}${search}`);
}

describe('route missing API key handling', () => {
	beforeEach(() => {
		vi.resetModules();
		vi.clearAllMocks();
		mockResolveLocale.mockReturnValue('de-DE');
		mockGetLocaleText.mockReturnValue({ messages: createMessages() });
	});

	// Statement coverage: missing API key returns empty data with localized error message for the homepage.
	it('returns a localized error message for the homepage', async () => {
		const { load } = await import('../../../src/routes/+page.server.js');

		const result = await load({ fetch: vi.fn(), url: createUrl('/', '?page=3&locale=de') });

		expectMissingApiKeyLoadResult(result, {
			featured: null,
			cards: [],
			page: 1,
			hasMore: false,
			error: 'API key missing'
		});
		expect(mockResolveLocale).toHaveBeenCalledWith('de');
		expect(mockCreateTmdbApi).not.toHaveBeenCalled();
	});

	// Statement coverage: missing API key returns empty data with localized error message for the movies page.
	it('returns a localized error message for the movies page', async () => {
		const { load } = await import('../../../src/routes/movies/+page.server.js');

		const result = await load({ fetch: vi.fn(), url: createUrl('/movies', '?page=3&locale=de') });

		expectMissingApiKeyLoadResult(result, {
			featured: null,
			cards: [],
			page: 1,
			hasMore: false,
			error: 'API key missing'
		});
		expect(mockResolveLocale).toHaveBeenCalledWith('de');
		expect(mockCreateTmdbApi).not.toHaveBeenCalled();
	});

	// Statement coverage: missing API key returns empty data with localized error message for the TV shows page.
	it('returns a localized error message for the TV shows page', async () => {
		const { load } = await import('../../../src/routes/tv-shows/+page.server.js');

		const result = await load({ fetch: vi.fn(), url: createUrl('/tv-shows', '?page=3&locale=de') });

		expectMissingApiKeyLoadResult(result, {
			featured: null,
			cards: [],
			page: 1,
			hasMore: false,
			error: 'API key missing'
		});
		expect(mockResolveLocale).toHaveBeenCalledWith('de');
		expect(mockCreateTmdbApi).not.toHaveBeenCalled();
	});

	// Statement coverage: missing API key returns empty data with localized error message for the movie detail page.
	it('returns a localized error message for the movie detail page', async () => {
		const { load } = await import('../../../src/routes/movies/[id]/+page.server.js');

		const result = await load({
			fetch: vi.fn(),
			params: { id: '680' },
			url: createUrl('/movies/680', '?locale=de')
		});

		expectMissingApiKeyLoadResult(result, {
			movie: null,
			error: 'API key missing'
		});
		expect(mockResolveLocale).toHaveBeenCalledWith('de');
		expect(mockCreateTmdbApi).not.toHaveBeenCalled();
	});

	// Statement coverage: missing API key returns empty data with localized error message for the TV show detail page.
	it('returns a localized error message for the TV show detail page', async () => {
		const { load } = await import('../../../src/routes/tv-shows/[id]/+page.server.js');

		const result = await load({
			fetch: vi.fn(),
			params: { id: '420' },
			url: createUrl('/tv-shows/420', '?locale=de')
		});

		expectMissingApiKeyLoadResult(result, {
			tvShow: null,
			error: 'API key missing'
		});
		expect(mockResolveLocale).toHaveBeenCalledWith('de');
		expect(mockCreateTmdbApi).not.toHaveBeenCalled();
	});

	// Statement coverage: missing API key returns status 500 with localized error message for the search route.
	it('returns a localized error message for the search route', async () => {
		const { GET } = await import('../../../src/routes/search/+server.js');

		const response = await GET({ fetch: vi.fn(), url: createUrl('/search', '?q=dark&locale=de') });

		await expectMissingApiKeyJsonResponse(response, 500, {
			movies: [],
			tvShows: [],
			results: [],
			error: 'API key missing'
		});
		expect(mockResolveLocale).toHaveBeenCalledWith('de');
		expect(mockCreateTmdbApi).not.toHaveBeenCalled();
	});

	// Statement coverage: missing API key returns status 500 with localized error message for the movies API route.
	it('returns a localized error message for the movies API route', async () => {
		const { GET } = await import('../../../src/routes/movies/+server.js');

		const response = await GET({ fetch: vi.fn(), url: createUrl('/movies', '?page=3&locale=de') });

		await expectMissingApiKeyJsonResponse(response, 500, {
			cards: [],
			page: 3,
			hasMore: false,
			error: 'API key missing'
		});
		expect(mockResolveLocale).toHaveBeenCalledWith('de');
		expect(mockCreateTmdbApi).not.toHaveBeenCalled();
	});

	// Statement coverage: missing API key returns status 500 with localized error message for the TV shows API route.
	it('returns a localized error message for the TV shows API route', async () => {
		const { GET } = await import('../../../src/routes/tv-shows/+server.js');

		const response = await GET({
			fetch: vi.fn(),
			url: createUrl('/tv-shows', '?page=3&locale=de')
		});

		await expectMissingApiKeyJsonResponse(response, 500, {
			cards: [],
			page: 3,
			hasMore: false,
			error: 'API key missing'
		});
		expect(mockResolveLocale).toHaveBeenCalledWith('de');
		expect(mockCreateTmdbApi).not.toHaveBeenCalled();
	});

	// Statement coverage: missing API key returns status 500 with localized error message for the trending API route.
	it('returns a localized error message for the trending API route', async () => {
		const { GET } = await import('../../../src/routes/trending/+server.js');

		const response = await GET({
			fetch: vi.fn(),
			url: createUrl('/trending', '?page=3&locale=de')
		});

		await expectMissingApiKeyJsonResponse(response, 500, {
			cards: [],
			page: 3,
			hasMore: false,
			error: 'API key missing'
		});
		expect(mockResolveLocale).toHaveBeenCalledWith('de');
		expect(mockCreateTmdbApi).not.toHaveBeenCalled();
	});
});
