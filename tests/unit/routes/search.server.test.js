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

function createUrl(search = '') {
	return new URL(`https://example.com/search${search}`);
}

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
		mockResolveLocale.mockReturnValue('de-DE');
		mockGetLocaleText.mockReturnValue({ messages: createMessages() });
	});

	// Anweisungsüberdeckung: Fehlt die Query oder ist sie kürzer als vier Zeichen, liefert die Route sofort leere Ergebnislisten zurück.
	it('liefert bei leerer oder zu kurzer Query leere Ergebnislisten zurück', async () => {
		const { GET } = await import('../../../src/routes/search/+server.js');

		const shortQueryResponse = await GET({
			fetch: vi.fn(),
			url: createUrl('?q=abc&locale=de')
		});
		const missingQueryResponse = await GET({
			fetch: vi.fn(),
			url: createUrl('?locale=de')
		});

		expect(mockResolveLocale).toHaveBeenCalledWith('de');
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

	// Anweisungsüberdeckung: Die Route trennt die gemischten Suchtreffer in Filme, TV-Shows und die Gesamtliste auf.
	it('trennt Suchergebnisse in Filme und TV-Shows auf', async () => {
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

	// Anweisungsüberdeckung: Schlägt die Suche fehl, liefert die Route eine lokalisierte Fehlermeldung mit Status 500 zurück.
	it('liefert bei Suchfehlern eine lokalisierte Fehlermeldung zurück', async () => {
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
