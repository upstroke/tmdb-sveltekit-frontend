import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mappedFixtures, rawResponses } from '$tests/fixtures/tmdb/tmdb.fixtures';

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
	return new URL(`https://example.com/movies/680${search}`);
}

function createMessages() {
	return {
		apiKeyMissing: 'API key missing',
		movieLoadError: 'Movie could not be loaded'
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
		trailerUrls: ['https://youtube.com/watch?v=secondTrailer'],
		imageUrl: '/images/pulp-fiction.jpg',
		posterUrl: '/posters/pulp-fiction.jpg',
		...overrides
	};
}

describe('movie detail route load', () => {
	beforeEach(() => {
		vi.resetModules();
		vi.clearAllMocks();
		mockResolveLocale.mockReturnValue('de-DE');
		mockGetLocaleText.mockReturnValue({ messages: createMessages() });
	});

	// Anweisungsüberdeckung: Die Movie-Detailroute lädt Details und Provider parallel und gibt das Filmobjekt mit Trailerliste zurück.
	it('lädt Movie-Details und Provider erfolgreich', async () => {
		const providers = {
			link: rawResponses.movieWatchProviders.results.DE.link,
			providers: [
				{
					providerId: 8,
					providerName: 'Netflix',
					type: 'flatrate',
					link: rawResponses.movieWatchProviders.results.DE.link,
					logoPath: '/netflix.png',
					displayPriority: 1
				}
			]
		};
		const api = {
			getMovieDetails: vi.fn().mockResolvedValue(createMovieDetails()),
			getWatchProviders: vi.fn().mockResolvedValue(providers)
		};
		mockCreateTmdbApi.mockReturnValue(api);
		const { load } = await import('../../../src/routes/movies/[id]/+page.server.js');

		const result = await load({
			fetch: vi.fn(),
			params: { id: '680' },
			url: createUrl('?locale=de')
		});

		expect(mockResolveLocale).toHaveBeenCalledWith('de');
		expect(api.getMovieDetails).toHaveBeenCalledWith('680');
		expect(api.getWatchProviders).toHaveBeenCalledWith('movie', '680');
		expect(result).toEqual({
			movie: createMovieDetails(),
			providers,
			error: null
		});
	});

	// Anweisungsüberdeckung: Fehlt trailerUrls in den Details, ergänzt die Route ein leeres Array als Fallback.
	it('ergänzt ein leeres Trailer-Array als Fallback', async () => {
		const providers = null;
		const movieDetailsWithoutTrailers = createMovieDetails({ trailerUrls: undefined });
		const api = {
			getMovieDetails: vi.fn().mockResolvedValue(movieDetailsWithoutTrailers),
			getWatchProviders: vi.fn().mockResolvedValue(providers)
		};
		mockCreateTmdbApi.mockReturnValue(api);
		const { load } = await import('../../../src/routes/movies/[id]/+page.server.js');

		const result = await load({
			fetch: vi.fn(),
			params: { id: '680' },
			url: createUrl()
		});

		expect(result.movie.trailerUrls).toEqual([]);
		expect(result.providers).toBeNull();
	});

	// Anweisungsüberdeckung: Schlägt die Detail- oder Providerladung fehl, wird die Fehlermeldung aus dem Error-Objekt zurückgegeben.
	it('gibt bei fehlgeschlagener Movie-Ladung die Error-Nachricht zurück', async () => {
		const api = {
			getMovieDetails: vi.fn().mockRejectedValue(new Error('movie details failed')),
			getWatchProviders: vi.fn().mockResolvedValue(null)
		};
		mockCreateTmdbApi.mockReturnValue(api);
		const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		const { load } = await import('../../../src/routes/movies/[id]/+page.server.js');

		const result = await load({
			fetch: vi.fn(),
			params: { id: '680' },
			url: createUrl()
		});

		expect(result).toEqual({
			movie: null,
			error: 'movie details failed'
		});
		expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load movie details:', expect.any(Error));
	});
});
