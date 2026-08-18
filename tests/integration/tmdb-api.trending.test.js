import { describe, expect, it, vi } from 'vitest';
import { TmdbAPI } from '$lib/services/tmdb-api.js';
import { trendingMoviesFixture } from '../fixtures/trendingMovies.fixture.js';

describe('TmdbAPI', () => {
	it('liefert Fixture-Daten über einen gemockten Fetch zurück', async () => {
		// Mock für fetch():
		// Statt eines echten HTTP-Requests liefern wir kontrolliert eine Antwort zurück.
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => trendingMoviesFixture
		});

		// Die API-Klasse bekommt den Mock statt echtem fetch übergeben.
		const api = new TmdbAPI(fetchMock, 'demo-key');

		// Führt die eigentliche Methode aus.
		const result = await api.request('/trending/movie/week');

		// Prüft, dass genau ein Request ausgeführt wurde.
		expect(fetchMock).toHaveBeenCalledTimes(1);

		// Prüft grob, ob der richtige API-Pfad angefragt wurde.
		expect(fetchMock.mock.calls[0][0]).toContain('/trending/movie/week');

		// Prüft, dass genau die Fixture-Daten zurückgegeben wurden.
		expect(result).toEqual(trendingMoviesFixture);
	});
});