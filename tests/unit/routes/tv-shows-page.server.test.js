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

function createUrl(search = '') {
	return new URL(`https://example.com/tv-shows${search}`);
}

function createMessages() {
	return {
		apiKeyMissing: 'API key missing',
		tvShowsLoadError: 'Could not load tv shows'
	};
}

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
		mockResolveLocale.mockReturnValue('de-DE');
		mockGetLocaleText.mockReturnValue({ messages: createMessages() });
	});

	// Anweisungsüberdeckung: Die TV-Route lädt mehrere Seiten, entfernt doppelte Karten nach id-mediaType und baut das Featured-Objekt aus dem bevorzugten Kandidaten.
	it('lädt mehrere TV-Seiten, dedupliziert Karten und setzt Featured', async () => {
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

		const result = await load({ fetch: vi.fn(), url: createUrl('?page=2&locale=de') });

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

	// Zweigüberdeckung: Fehlt der bevorzugte Featured-Kandidat, fällt die TV-Route auf den ersten verfügbaren Index zurück.
	it('fällt bei der TV-Featured-Auswahl auf den ersten Index zurück', async () => {
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

	// Zweigüberdeckung: Schlägt nur das Featured-Detail fehl, bleibt die deduplizierte Kartenliste erhalten.
	it('behält deduplizierte Karten bei, wenn TV-Featured-Details fehlschlagen', async () => {
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

	// Zweigüberdeckung: Schlägt die TV-Listenladung fehl, gibt die Route den lokalisierten Fehlerzustand zurück.
	it('liefert bei fehlgeschlagener TV-Listenladung einen Fehlerzustand zurück', async () => {
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
