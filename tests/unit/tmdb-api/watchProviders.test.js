import { describe, expect, it, vi } from 'vitest';
import { createTmdbApi } from '$lib/services/tmdb-api';

/**
 * Creates a TMDB API instance with a mocked fetch function.
 *
 * @returns {ReturnType<typeof createTmdbApi>}
 */
function createApi() {
	return createTmdbApi(vi.fn(), 'test-api-key');
}

describe('tmdb api watch provider mapping', () => {
	describe('mapWatchProvider', () => {
		// Statement coverage: missing required fields result in null fallback.
		it('returns null when provider_id is missing', () => {
			const api = createApi();

			expect(
				api.mapWatchProvider(
					{
						provider_name: 'Netflix',
						logo_path: '/netflix.png',
						display_priority: 7
					},
					'flatrate',
					'https://example.com/providers'
				)
			).toBeNull();
		});

		// Statement coverage: missing required fields result in null fallback.
		it('returns null when provider_name is missing', () => {
			const api = createApi();

			expect(
				api.mapWatchProvider(
					{
						provider_id: 8,
						logo_path: '/prime.png',
						display_priority: 3
					},
					'rent',
					'https://example.com/providers'
				)
			).toBeNull();
		});

		// Statement coverage: a complete provider is transformed to the UI format.
		it('maps a complete watch provider to the internal format', () => {
			const api = createApi();

			expect(
				api.mapWatchProvider(
					{
						provider_id: 9,
						provider_name: 'Amazon Prime Video',
						logo_path: '/prime.png',
						display_priority: 3
					},
					'flatrate',
					'https://example.com/providers'
				)
			).toEqual({
				providerId: 9,
				providerName: 'Amazon Prime Video',
				type: 'flatrate',
				link: 'https://example.com/providers',
				logoPath: '/prime.png',
				displayPriority: 3
			});
		});

		// Statement coverage: optional fields are normalized to null.
		it('sets optional provider fields to null when not present', () => {
			const api = createApi();

			expect(
				api.mapWatchProvider(
					{
						provider_id: 337,
						provider_name: 'Disney Plus'
					},
					'buy',
					null
				)
			).toEqual({
				providerId: 337,
				providerName: 'Disney Plus',
				type: 'buy',
				link: null,
				logoPath: null,
				displayPriority: null
			});
		});
	});

	describe('mapWatchProviderList', () => {
		// Statement coverage: a provider list is fully transformed to the UI format.
		it('maps a list of valid watch providers', () => {
			const api = createApi();

			expect(
				api.mapWatchProviderList(
					[
						{
							provider_id: 8,
							provider_name: 'Netflix',
							logo_path: '/netflix.png',
							display_priority: 1
						},
						{
							provider_id: 9,
							provider_name: 'Amazon Prime Video',
							logo_path: '/prime.png',
							display_priority: 2
						}
					],
					'flatrate',
					'https://example.com/providers'
				)
			).toEqual([
				{
					providerId: 8,
					providerName: 'Netflix',
					type: 'flatrate',
					link: 'https://example.com/providers',
					logoPath: '/netflix.png',
					displayPriority: 1
				},
				{
					providerId: 9,
					providerName: 'Amazon Prime Video',
					type: 'flatrate',
					link: 'https://example.com/providers',
					logoPath: '/prime.png',
					displayPriority: 2
				}
			]);
		});

		// Statement coverage: invalid entries are filtered out during list mapping.
		it('filters invalid watch providers from the result list', () => {
			const api = createApi();

			expect(
				api.mapWatchProviderList(
					[
						{
							provider_id: 8,
							provider_name: 'Netflix',
							logo_path: '/netflix.png'
						},
						{
							provider_name: 'Invalid without ID'
						},
						{
							provider_id: 15
						}
					],
					'rent',
					'https://example.com/providers'
				)
			).toEqual([
				{
					providerId: 8,
					providerName: 'Netflix',
					type: 'rent',
					link: 'https://example.com/providers',
					logoPath: '/netflix.png',
					displayPriority: null
				}
			]);
		});

		// Statement coverage: a missing provider list returns an empty result list.
		it('returns an empty list when no providers are passed', () => {
			const api = createApi();

			expect(api.mapWatchProviderList(undefined, 'buy', 'https://example.com/providers')).toEqual(
				[]
			);
		});
	});
});
