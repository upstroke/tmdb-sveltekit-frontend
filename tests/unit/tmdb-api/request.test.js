import { describe, expect, it, vi } from 'vitest';
import { createTmdbApi } from '$lib/services/tmdb-api';

function createJsonResponse(data) {
	return {
		ok: true,
		json: vi.fn().mockResolvedValue(data)
	};
}

describe('tmdb api request', () => {
	describe('request', () => {
		// Anweisungsüberdeckung: Basis-URL, api_key und language werden für eine Standardanfrage aufgebaut.
		it('baut eine TMDB-Anfrage mit Basis-URL, API-Key und Sprache auf', async () => {
			const fetchFn = vi.fn().mockResolvedValue(createJsonResponse({ results: [] }));
			const api = createTmdbApi(fetchFn, 'test-api-key', 'de-DE');

			await expect(api.request('/movie/popular')).resolves.toEqual({ results: [] });
			expect(fetchFn).toHaveBeenCalledTimes(1);

			const requestUrl = new URL(fetchFn.mock.calls[0][0]);
			expect(requestUrl.origin).toBe('https://api.themoviedb.org');
			expect(requestUrl.pathname).toBe('/3/movie/popular');
			expect(requestUrl.searchParams.get('api_key')).toBe('test-api-key');
			expect(requestUrl.searchParams.get('language')).toBe('de-DE');
		});

		// Zweigüberdeckung: Zusätzliche Query-Parameter werden als Strings übernommen.
		it('fügt zusätzliche Query-Parameter zur Anfrage hinzu', async () => {
			const fetchFn = vi.fn().mockResolvedValue(createJsonResponse({ page: 2 }));
			const api = createTmdbApi(fetchFn, 'test-api-key', 'en-US');

			await api.request('/search/multi', {
				query: 'dark',
				page: 2,
				include_adult: false
			});

			const requestUrl = new URL(fetchFn.mock.calls[0][0]);
			expect(requestUrl.searchParams.get('query')).toBe('dark');
			expect(requestUrl.searchParams.get('page')).toBe('2');
			expect(requestUrl.searchParams.get('include_adult')).toBe('false');
		});

		// Zweigüberdeckung: Leere oder nicht gesetzte Parameter werden nicht in die Anfrage übernommen.
		it('ignoriert undefined-, null- und Leerstring-Parameter', async () => {
			const fetchFn = vi.fn().mockResolvedValue(createJsonResponse({ page: 1 }));
			const api = createTmdbApi(fetchFn, 'test-api-key', 'de-DE');

			await api.request('/search/multi', {
				query: '',
				region: null,
				watch_region: undefined,
				page: 1
			});

			const requestUrl = new URL(fetchFn.mock.calls[0][0]);
			expect(requestUrl.searchParams.get('query')).toBeNull();
			expect(requestUrl.searchParams.get('region')).toBeNull();
			expect(requestUrl.searchParams.get('watch_region')).toBeNull();
			expect(requestUrl.searchParams.get('page')).toBe('1');
		});

		// Zweigüberdeckung: Fehlerhafte HTTP-Antworten werden als Error weitergegeben.
		it('wirft einen Fehler, wenn die TMDB-Anfrage fehlschlägt', async () => {
			const fetchFn = vi.fn().mockResolvedValue({
				ok: false,
				status: 500,
				statusText: 'Internal Server Error'
			});
			const api = createTmdbApi(fetchFn, 'test-api-key', 'de-DE');

			await expect(api.request('/movie/popular')).rejects.toThrow(
				'TMDB-Anfrage fehlgeschlagen: 500 Internal Server Error'
			);
		});
	});
});
