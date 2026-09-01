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
	return new URL(`https://example.com/movies${search}`);
}

function createMessages() {
	return {
		apiKeyMissing: 'API key missing',
		moreMoviesLoadError: 'More movies could not be loaded.'
	};
}

describe('movies server route GET', () => {
	beforeEach(() => {
		vi.resetModules();
		vi.clearAllMocks();
		mockResolveLocale.mockReturnValue('de-DE');
		mockGetLocaleText.mockReturnValue({ messages: createMessages() });
	});

	// Anweisungsüberdeckung: Die Route lädt eine Filmseite, dedupliziert Karten per id-mediaType und gibt Paging-Daten zurück.
	it('lädt Filme dedupliziert mit Paging-Daten', async () => {
		const api = {
			getTrendingMovies: vi.fn().mockResolvedValue({
				results: [
					{ id: 550, mediaType: 'movie', title: 'Fight Club' },
					{ id: 550, mediaType: 'movie', title: 'Fight Club Duplicate' },
					{ id: 680, mediaType: 'movie', title: 'Pulp Fiction' }
				],
				page: 3,
				hasMore: true
			})
		};
		mockCreateTmdbApi.mockReturnValue(api);
		const { GET } = await import('../../../src/routes/movies/+server.js');

		const response = await GET({
			fetch: vi.fn(),
			url: createUrl('?page=3&locale=de')
		});

		expect(mockResolveLocale).toHaveBeenCalledWith('de');
		expect(api.getTrendingMovies).toHaveBeenCalledWith(3);
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({
			cards: [
				{ id: 550, mediaType: 'movie', title: 'Fight Club Duplicate' },
				{ id: 680, mediaType: 'movie', title: 'Pulp Fiction' }
			],
			page: 3,
			hasMore: true,
			error: null
		});
	});

	// Anweisungsüberdeckung: Ungültige Seitenzahlen werden auf Seite eins normalisiert und fehlende API-Seitenangaben fallen auf den Request-Wert zurück.
	it('normalisiert ungültige Seitenzahlen auf eins', async () => {
		const api = {
			getTrendingMovies: vi.fn().mockResolvedValue({
				results: [{ id: 13, mediaType: 'movie', title: 'Forrest Gump' }],
				hasMore: false
			})
		};
		mockCreateTmdbApi.mockReturnValue(api);
		const { GET } = await import('../../../src/routes/movies/+server.js');

		const response = await GET({
			fetch: vi.fn(),
			url: createUrl('?page=0')
		});

		expect(api.getTrendingMovies).toHaveBeenCalledWith(1);
		expect(await response.json()).toEqual({
			cards: [{ id: 13, mediaType: 'movie', title: 'Forrest Gump' }],
			page: 1,
			hasMore: false,
			error: null
		});
	});

	// Anweisungsüberdeckung: Schlägt die Filmladung fehl, liefert die Route Status 500 und die lokalisierte Fehlermeldung zurück.
	it('liefert bei Ladefehlern eine lokalisierte Fehlermeldung zurück', async () => {
		const api = {
			getTrendingMovies: vi.fn().mockRejectedValue(new Error('movie page failed'))
		};
		mockCreateTmdbApi.mockReturnValue(api);
		const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		const { GET } = await import('../../../src/routes/movies/+server.js');

		const response = await GET({
			fetch: vi.fn(),
			url: createUrl('?page=5')
		});

		expect(response.status).toBe(500);
		expect(await response.json()).toEqual({
			cards: [],
			page: 5,
			hasMore: false,
			error: 'More movies could not be loaded.'
		});
		expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load more movies:', expect.any(Error));
	});
});
