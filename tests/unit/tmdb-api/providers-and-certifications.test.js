import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { createTmdbApi } from '$lib/services/tmdb-api';

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
		// Anweisungsüberdeckung: Providerdaten der gewählten Region werden gemappt und zusammengeführt.
		it('mappt Flatrate-, Leih- und Kaufanbieter der Sprachregion in ein gemeinsames Ergebnis', async () => {
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

		// Anweisungsüberdeckung: Die Antwort wird pro Medium und ID gecacht und nicht erneut geladen.
		it('liefert Watch-Provider beim zweiten Aufruf aus dem Cache', async () => {
			const fetchFn = vi.fn().mockResolvedValue(
				createJsonResponse({
					results: {
						DE: {
							link: 'https://example.com/watch/de',
							flatrate: [
								{ provider_id: 8, provider_name: 'Netflix', logo_path: '/netflix.png' }
							]
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

		// Anweisungsüberdeckung: Für die abgeleitete Region ohne Providerdaten wird null zurückgegeben.
		it('gibt null zurück, wenn für die Sprachregion keine Providerdaten vorhanden sind', async () => {
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

		// Anweisungsüberdeckung: Fehlerhafte Provider-Anfragen werden abgefangen und als null gecacht.
		it('fängt Fehler beim Laden der Watch-Provider ab und gibt null zurück', async () => {
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
		// Anweisungsüberdeckung: Filmfreigaben werden über release_dates für die Sprachregion ermittelt.
		it('liest die Filmzertifizierung aus den Release-Daten der Sprachregion aus', async () => {
			const fetchFn = vi.fn().mockResolvedValue(
				createJsonResponse({
					results: [
						{
							iso_3166_1: 'DE',
							release_dates: [
								{ certification: '' },
								{ certification: 'FSK 16' }
							]
						}
					]
				})
			);
			const api = createTmdbApi(fetchFn, 'test-api-key', 'de-DE');

			await expect(api.getCertification('movie', 550)).resolves.toBe('FSK 16');
		});

		// Anweisungsüberdeckung: Serienfreigaben werden über content_ratings für die Sprachregion ermittelt.
		it('liest die Serienzertifizierung aus den Content-Ratings der Sprachregion aus', async () => {
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

		// Anweisungsüberdeckung: Nicht unterstützte Medientypen liefern den leeren String als Fallback.
		it('gibt für nicht unterstützte Medientypen einen leeren String zurück', async () => {
			const fetchFn = vi.fn();
			const api = createTmdbApi(fetchFn, 'test-api-key', 'de-DE');

			await expect(api.getCertification('person', 1)).resolves.toBe('');
			expect(fetchFn).not.toHaveBeenCalled();
		});

		// Anweisungsüberdeckung: Zertifizierungen werden pro Medium und ID gecacht und nicht erneut geladen.
		it('liefert Zertifizierungen beim zweiten Aufruf aus dem Cache', async () => {
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

		// Anweisungsüberdeckung: Fehlerhafte Zertifizierungs-Anfragen werden abgefangen und liefern einen leeren String.
		it('fängt Fehler beim Laden der Zertifizierung ab und gibt einen leeren String zurück', async () => {
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
		// Anweisungsüberdeckung: Karten werden mit ihrer lokalen Zertifizierung angereichert.
		it('reichert Karten mit den Zertifizierungen ihrer Medientypen an', async () => {
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
