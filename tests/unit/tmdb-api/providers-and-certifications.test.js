import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
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

describe('tmdb api providers and certifications', () => {
	beforeEach(() => {
		vi.spyOn(console, 'warn').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('getWatchProviders', () => {
		// Statement coverage: provider data of the selected region is mapped and merged.
		it('maps flatrate, rent, and buy providers of the language region into a combined result', async () => {
			const fetchFn = vi.fn().mockResolvedValue(
				createJsonResponse({
					results: {
						DE: {
							link: 'https://example.com/watch/de',
							flatrate: [
								{
									provider_id: 8,
									provider_name: 'Netflix',
									logo_path: '/netflix.png',
									display_priority: 1
								}
							],
							rent: [
								{
									provider_id: 2,
									provider_name: 'Apple TV',
									logo_path: '/apple-tv.png',
									display_priority: 2
								}
							],
							buy: [
								{
									provider_id: 3,
									provider_name: 'Amazon Video',
									logo_path: '/amazon-video.png',
									display_priority: 3
								}
							]
						}
					}
				})
			);
			const api = createTmdbApi(fetchFn, 'test-api-key', 'de-DE');

			await expect(api.getWatchProviders('movie', 550)).resolves.toEqual({
				link: 'https://example.com/watch/de',
				providers: [
					{
						providerId: 8,
						providerName: 'Netflix',
						type: 'flatrate',
						link: 'https://example.com/watch/de',
						logoPath: '/netflix.png',
						displayPriority: 1
					},
					{
						providerId: 2,
						providerName: 'Apple TV',
						type: 'rent',
						link: 'https://example.com/watch/de',
						logoPath: '/apple-tv.png',
						displayPriority: 2
					},
					{
						providerId: 3,
						providerName: 'Amazon Video',
						type: 'buy',
						link: 'https://example.com/watch/de',
						logoPath: '/amazon-video.png',
						displayPriority: 3
					}
				]
			});
			expect(fetchFn).toHaveBeenCalledTimes(1);
		});

		// Statement coverage: the response is cached per medium and ID and not loaded again.
		it('returns watch providers from the cache on the second call', async () => {
			const fetchFn = vi.fn().mockResolvedValue(
				createJsonResponse({
					results: {
						DE: {
							link: 'https://example.com/watch/de',
							flatrate: [{ provider_id: 8, provider_name: 'Netflix', logo_path: '/netflix.png' }]
						}
					}
				})
			);
			const api = createTmdbApi(fetchFn, 'test-api-key', 'de-DE');

			const firstResult = await api.getWatchProviders('movie', 550);
			const secondResult = await api.getWatchProviders('movie', 550);

			expect(secondResult).toEqual(firstResult);
			expect(fetchFn).toHaveBeenCalledTimes(1);
		});

		// Statement coverage: null is returned for the derived region without provider data.
		it('returns null when no provider data exists for the language region', async () => {
			const fetchFn = vi.fn().mockResolvedValue(
				createJsonResponse({
					results: {
						US: {
							link: 'https://example.com/watch/us',
							flatrate: [{ provider_id: 8, provider_name: 'Netflix' }]
						}
					}
				})
			);
			const api = createTmdbApi(fetchFn, 'test-api-key', 'de-DE');

			await expect(api.getWatchProviders('movie', 550)).resolves.toBeNull();
		});

		// Statement coverage: failed provider requests are caught and cached as null.
		it('catches errors when loading watch providers and returns null', async () => {
			const fetchFn = vi.fn().mockResolvedValue({
				ok: false,
				status: 503,
				statusText: 'Service Unavailable'
			});
			const api = createTmdbApi(fetchFn, 'test-api-key', 'de-DE');

			await expect(api.getWatchProviders('movie', 550)).resolves.toBeNull();
			expect(console.warn).toHaveBeenCalledTimes(1);
		});
	});

	describe('getCertification', () => {
		// Statement coverage: movie certifications are determined via release_dates for the language region.
		it('reads the movie certification from the release dates of the language region', async () => {
			const fetchFn = vi.fn().mockResolvedValue(
				createJsonResponse({
					results: [
						{
							iso_3166_1: 'DE',
							release_dates: [{ certification: '' }, { certification: 'FSK 16' }]
						}
					]
				})
			);
			const api = createTmdbApi(fetchFn, 'test-api-key', 'de-DE');

			await expect(api.getCertification('movie', 550)).resolves.toBe('FSK 16');
		});

		// Statement coverage: TV certifications are determined via content_ratings for the language region.
		it('reads the TV certification from the content ratings of the language region', async () => {
			const fetchFn = vi.fn().mockResolvedValue(
				createJsonResponse({
					results: [
						{ iso_3166_1: 'US', rating: 'TV-MA' },
						{ iso_3166_1: 'DE', rating: '12' }
					]
				})
			);
			const api = createTmdbApi(fetchFn, 'test-api-key', 'de-DE');

			await expect(api.getCertification('tv', 1399)).resolves.toBe('12');
		});

		// Statement coverage: unsupported media types return an empty string as fallback.
		it('returns an empty string for unsupported media types', async () => {
			const fetchFn = vi.fn();
			const api = createTmdbApi(fetchFn, 'test-api-key', 'de-DE');

			await expect(api.getCertification('person', 1)).resolves.toBe('');
			expect(fetchFn).not.toHaveBeenCalled();
		});

		// Statement coverage: certifications are cached per medium and ID and not loaded again.
		it('returns certifications from the cache on the second call', async () => {
			const fetchFn = vi.fn().mockResolvedValue(
				createJsonResponse({
					results: [
						{
							iso_3166_1: 'DE',
							release_dates: [{ certification: 'FSK 12' }]
						}
					]
				})
			);
			const api = createTmdbApi(fetchFn, 'test-api-key', 'de-DE');

			const firstResult = await api.getCertification('movie', 550);
			const secondResult = await api.getCertification('movie', 550);

			expect(secondResult).toBe(firstResult);
			expect(fetchFn).toHaveBeenCalledTimes(1);
		});

		// Statement coverage: failed certification requests are caught and return an empty string.
		it('catches errors when loading certifications and returns an empty string', async () => {
			const fetchFn = vi.fn().mockResolvedValue({
				ok: false,
				status: 500,
				statusText: 'Internal Server Error'
			});
			const api = createTmdbApi(fetchFn, 'test-api-key', 'de-DE');

			await expect(api.getCertification('movie', 550)).resolves.toBe('');
			expect(console.warn).toHaveBeenCalledTimes(1);
		});
	});

	describe('enrichCardCertifications', () => {
		// Statement coverage: cards are enriched with their local certification.
		it('enriches cards with the certifications of their media types', async () => {
			const fetchFn = vi
				.fn()
				.mockResolvedValueOnce(
					createJsonResponse({
						results: [
							{
								iso_3166_1: 'DE',
								release_dates: [{ certification: 'FSK 16' }]
							}
						]
					})
				)
				.mockResolvedValueOnce(
					createJsonResponse({
						results: [{ iso_3166_1: 'DE', rating: '12' }]
					})
				);
			const api = createTmdbApi(fetchFn, 'test-api-key', 'de-DE');

			await expect(
				api.enrichCardCertifications([
					{ id: 550, mediaType: 'movie', title: 'Fight Club' },
					{ id: 420, mediaType: 'tv', title: 'Dark' }
				])
			).resolves.toEqual([
				{ id: 550, mediaType: 'movie', title: 'Fight Club', certification: 'FSK 16' },
				{ id: 420, mediaType: 'tv', title: 'Dark', certification: '12' }
			]);
		});
	});
});
