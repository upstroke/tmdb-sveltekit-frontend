import { describe, expect, it, vi } from 'vitest';
import { createTmdbApi } from '$lib/services/tmdb-api';

/**
 * Creates a mock JSON response object for fetch operations.
 *
 * @param {any} data - The data to be returned by the mocked json() method.
 * @returns {{ ok: boolean, json: import('vitest').Mock<() => Promise<any>> }}
 */
function createJsonResponse(data) {
	return {
		ok: true,
		json: vi.fn().mockResolvedValue(data)
	};
}

describe('tmdb api request', () => {
	describe('request', () => {
		// Statement coverage: base URL, api_key, and language are constructed for a standard request.
		it('constructs a TMDB request with base URL, API key, and language', async () => {
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

		// Statement coverage: additional query parameters are adopted as strings.
		it('adds additional query parameters to the request', async () => {
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

		// Statement coverage: empty or unset parameters are not included in the request.
		it('ignores undefined, null, and empty string parameters', async () => {
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

		// Statement coverage: failed HTTP responses are passed as an error.
		it('throws an error when the TMDB request fails', async () => {
			const fetchFn = vi.fn().mockResolvedValue({
				ok: false,
				status: 500,
				statusText: 'Internal Server Error'
			});
			const api = createTmdbApi(fetchFn, 'test-api-key', 'en-US');

			await expect(api.request('/movie/popular')).rejects.toThrow(
				'TMDB request failed: 500 Internal Server Error'
			);
		});
	});
});
