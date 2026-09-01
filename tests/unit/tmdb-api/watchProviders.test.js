import { describe, expect, it, vi } from 'vitest';
import { createTmdbApi } from '$lib/services/tmdb-api';

function createApi() {
	return createTmdbApi(vi.fn(), 'test-api-key');
}

describe('tmdb api watch provider mapping', () => {
	describe('mapWatchProvider', () => {
		// Zweigüberdeckung: Fehlende Pflichtfelder führen zum Null-Fallback.
		it('gibt null zurück, wenn die provider_id fehlt', () => {
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

		// Zweigüberdeckung: Fehlende Pflichtfelder führen zum Null-Fallback.
		it('gibt null zurück, wenn der provider_name fehlt', () => {
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

		// Anweisungsüberdeckung: Ein vollständiger Provider wird in das UI-Format überführt.
		it('mappt einen vollständigen Watch-Provider in das interne Format', () => {
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

		// Zweigüberdeckung: Optionale Felder werden auf null normalisiert.
		it('setzt optionale Provider-Felder auf null, wenn sie nicht vorhanden sind', () => {
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
		// Anweisungsüberdeckung: Eine Provider-Liste wird vollständig ins UI-Format überführt.
		it('mappt eine Liste gültiger Watch-Provider', () => {
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

		// Zweigüberdeckung: Ungültige Einträge werden beim Listen-Mapping herausgefiltert.
		it('filtert ungültige Watch-Provider aus der Ergebnisliste heraus', () => {
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
							provider_name: 'Ungültig ohne ID'
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

		// Zweigüberdeckung: Eine fehlende Providerliste liefert eine leere Ergebnisliste.
		it('gibt eine leere Liste zurück, wenn keine Provider übergeben werden', () => {
			const api = createApi();

			expect(api.mapWatchProviderList(undefined, 'buy', 'https://example.com/providers')).toEqual([]);
		});
	});
});
