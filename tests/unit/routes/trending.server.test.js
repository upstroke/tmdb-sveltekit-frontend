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
	return new URL(`https://example.com/trending${search}`);
}

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
		mockResolveLocale.mockReturnValue('de-DE');
		mockGetLocaleText.mockReturnValue({ messages: createMessages() });
	});

	// Anweisungsüberdeckung: Die Route lädt gemischte Trending-Inhalte und gibt sie ohne Deduplizierung mit Paging-Daten zurück.
	it('lädt Trending-Inhalte mit Paging-Daten', async () => {
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
			url: createUrl('?page=2&locale=de')
		});

		expect(mockResolveLocale).toHaveBeenCalledWith('de');
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

	// Anweisungsüberdeckung: Ungültige Seitenzahlen werden auf Seite eins normalisiert und fehlende API-Seitenangaben fallen auf den Request-Wert zurück.
	it('normalisiert ungültige Seitenzahlen auf eins', async () => {
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

	// Anweisungsüberdeckung: Schlägt die Trending-Ladung fehl, liefert die Route Status 500 und die lokalisierte Fehlermeldung zurück.
	it('liefert bei Ladefehlern eine lokalisierte Fehlermeldung zurück', async () => {
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
		expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load trending content:', expect.any(Error));
	});
});
