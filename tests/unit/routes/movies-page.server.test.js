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
	return new URL(`https://example.com/movies${search}`);
}

function createMessages() {
	return {
		apiKeyMissing: 'API key missing',
		moviesLoadError: 'Could not load movies'
	};
}

function createMovieDetails(overrides = {}) {
	return {
		id: mappedFixtures.details.id,
		mediaType: 'movie',
		title: mappedFixtures.details.title,
		releaseDate: '1994-09-10',
		overview: mappedFixtures.details.overview,
		homepage: mappedFixtures.details.homepage,
		genres: mappedFixtures.details.genres,
		imageUrl: '/images/pulp-fiction.jpg',
		posterUrl: '/posters/pulp-fiction.jpg',
		...overrides
	};
}

describe('movies page route load', () => {
	beforeEach(() => {
		vi.resetModules();
		vi.clearAllMocks();
		mockResolveLocale.mockReturnValue('de-DE');
		mockGetLocaleText.mockReturnValue({ messages: createMessages() });
	});

	// Anweisungsüberdeckung: Die Movie-Route lädt alle angeforderten Trending-Seiten und nutzt den bevorzugten Featured-Auswahlpfad ab Index 1.
	it('lädt mehrere Movie-Seiten und nutzt den bevorzugten Featured-Kandidaten', async () => {
		const api = {
			getTrendingMovies: vi
				.fn()
				.mockResolvedValueOnce({
					results: [
						{ id: 550, mediaType: 'movie', title: 'Fight Club' },
						{ id: 680, mediaType: 'movie', title: 'Pulp Fiction' },
						{ id: 13, mediaType: 'movie', title: 'Forrest Gump' }
					],
					hasMore: true
				})
				.mockResolvedValueOnce({
					results: [{ id: 603, mediaType: 'movie', title: 'The Matrix' }],
					hasMore: false
				}),
			getMovieDetails: vi.fn().mockResolvedValue(createMovieDetails())
		};
		mockCreateTmdbApi.mockReturnValue(api);
		const { load } = await import('../../../src/routes/movies/+page.server.js');

		const result = await load({ fetch: vi.fn(), url: createUrl('?page=2&locale=de') });

		expect(api.getTrendingMovies).toHaveBeenNthCalledWith(1, 1);
		expect(api.getTrendingMovies).toHaveBeenNthCalledWith(2, 2);
		expect(api.getMovieDetails).toHaveBeenCalledWith(680);
		expect(result).toEqual({
			featured: createMovieDetails(),
			cards: [
				{ id: 550, mediaType: 'movie', title: 'Fight Club' },
				{ id: 680, mediaType: 'movie', title: 'Pulp Fiction' },
				{ id: 13, mediaType: 'movie', title: 'Forrest Gump' },
				{ id: 603, mediaType: 'movie', title: 'The Matrix' }
			],
			page: 2,
			hasMore: false,
			error: null
		});
	});

	// Anweisungsüberdeckung: Fehlt der bevorzugte Featured-Kandidat, fällt die Route auf den nächsten verfügbaren Index zurück.
	it('fällt bei der Featured-Auswahl auf Index 2 und dann 0 zurück', async () => {
		const api = {
			getTrendingMovies: vi
				.fn()
				.mockResolvedValueOnce({
					results: [
						{ id: 550, mediaType: 'movie', title: 'Fight Club' },
						undefined,
						{ id: 13, mediaType: 'movie', title: 'Forrest Gump' }
					],
					hasMore: true
				})
				.mockResolvedValueOnce({
					results: [],
					hasMore: false
				}),
			getMovieDetails: vi.fn().mockResolvedValue(createMovieDetails({ id: 13, title: 'Forrest Gump' }))
		};
		mockCreateTmdbApi.mockReturnValue(api);
		const { load } = await import('../../../src/routes/movies/+page.server.js');

		const result = await load({ fetch: vi.fn(), url: createUrl('?page=2') });

		expect(api.getMovieDetails).toHaveBeenCalledWith(13);
		expect(result.featured).toMatchObject({ id: 13, title: 'Forrest Gump' });
	});

	// Anweisungsüberdeckung: Schlägt nur das Featured-Detail fehl, bleiben Kartenliste und Seitendaten erhalten.
	it('behält Karten bei, wenn Featured-Movie-Details fehlschlagen', async () => {
		const api = {
			getTrendingMovies: vi.fn().mockResolvedValue({
				results: [{ id: 680, mediaType: 'movie', title: 'Pulp Fiction' }],
				hasMore: true
			}),
			getMovieDetails: vi.fn().mockRejectedValue(new Error('details failed'))
		};
		mockCreateTmdbApi.mockReturnValue(api);
		const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		const { load } = await import('../../../src/routes/movies/+page.server.js');

		const result = await load({ fetch: vi.fn(), url: createUrl('?page=1') });

		expect(result).toEqual({
			featured: null,
			cards: [{ id: 680, mediaType: 'movie', title: 'Pulp Fiction' }],
			page: 1,
			hasMore: true,
			error: null
		});
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			'Featured movie details could not be loaded:',
			expect.any(Error)
		);
	});

	// Anweisungsüberdeckung: Schlägt die Movie-Listenladung fehl, gibt die Route den lokalisierten Fehlerzustand zurück.
	it('liefert bei fehlgeschlagener Movie-Listenladung einen Fehlerzustand zurück', async () => {
		const api = {
			getTrendingMovies: vi.fn().mockRejectedValue(new Error('list failed')),
			getMovieDetails: vi.fn()
		};
		mockCreateTmdbApi.mockReturnValue(api);
		const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		const { load } = await import('../../../src/routes/movies/+page.server.js');

		const result = await load({ fetch: vi.fn(), url: createUrl('?page=4') });

		expect(result).toEqual({
			featured: null,
			cards: [],
			page: 4,
			hasMore: false,
			error: 'Could not load movies'
		});
		expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load movies:', expect.any(Error));
	});
});
