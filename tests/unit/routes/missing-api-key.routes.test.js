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

	// Anweisungsüberdeckung: Fehlt der API-Key, liefert die Startseite leere Daten mit lokalisierter Fehlermeldung zurück.
	it('liefert für die Startseite eine lokalisierte Fehlermeldung zurück', async () => {
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

	// Anweisungsüberdeckung: Fehlt der API-Key, liefert die Filmseite leere Daten mit lokalisierter Fehlermeldung zurück.
	it('liefert für die Filmseite eine lokalisierte Fehlermeldung zurück', async () => {
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

	// Anweisungsüberdeckung: Fehlt der API-Key, liefert die TV-Seite leere Daten mit lokalisierter Fehlermeldung zurück.
	it('liefert für die TV-Seite eine lokalisierte Fehlermeldung zurück', async () => {
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

	// Anweisungsüberdeckung: Fehlt der API-Key, liefert die Filmdetailseite eine lokalisierte Fehlermeldung zurück.
	it('liefert für die Filmdetailseite eine lokalisierte Fehlermeldung zurück', async () => {
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

	// Anweisungsüberdeckung: Fehlt der API-Key, liefert die TV-Detailseite eine lokalisierte Fehlermeldung zurück.
	it('liefert für die TV-Detailseite eine lokalisierte Fehlermeldung zurück', async () => {
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

	// Anweisungsüberdeckung: Fehlt der API-Key, liefert die Suchroute Status 500 mit lokalisierter Fehlermeldung zurück.
	it('liefert für die Suchroute eine lokalisierte Fehlermeldung zurück', async () => {
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

	// Anweisungsüberdeckung: Fehlt der API-Key, liefert die Movie-API-Route Status 500 mit lokalisierter Fehlermeldung zurück.
	it('liefert für die Movie-API-Route eine lokalisierte Fehlermeldung zurück', async () => {
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

	// Anweisungsüberdeckung: Fehlt der API-Key, liefert die TV-API-Route Status 500 mit lokalisierter Fehlermeldung zurück.
	it('liefert für die TV-API-Route eine lokalisierte Fehlermeldung zurück', async () => {
		const { GET } = await import('../../../src/routes/tv-shows/+server.js');

		const response = await GET({ fetch: vi.fn(), url: createUrl('/tv-shows', '?page=3&locale=de') });

		await expectMissingApiKeyJsonResponse(response, 500, {
			cards: [],
			page: 3,
			hasMore: false,
			error: 'API key missing'
		});
		expect(mockResolveLocale).toHaveBeenCalledWith('de');
		expect(mockCreateTmdbApi).not.toHaveBeenCalled();
	});

	// Anweisungsüberdeckung: Fehlt der API-Key, liefert die Trending-API-Route Status 500 mit lokalisierter Fehlermeldung zurück.
	it('liefert für die Trending-API-Route eine lokalisierte Fehlermeldung zurück', async () => {
		const { GET } = await import('../../../src/routes/trending/+server.js');

		const response = await GET({ fetch: vi.fn(), url: createUrl('/trending', '?page=3&locale=de') });

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
