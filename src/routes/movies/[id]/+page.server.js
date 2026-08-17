import { TMDB_API_KEY } from '$env/static/private';
import { TmdbAPI } from '$lib/services/tmdb-api.js';

/**
 * Lädt die Serverdaten für eine Film-Detailseite.
 *
 * Die Funktion liest die Film-ID aus den Routenparametern, lädt die
 * Detaildaten über die TMDB-API und gibt ein gemapptes Filmobjekt zurück.
 * Falls kein API-Schlüssel vorhanden ist, wird ein leerer Datensatz
 * mit einer Fehlermeldung zurückgegeben.
 *
 * @param {{ fetch: Function, params: { id: string } }} event - SvelteKit-Load-Kontext.
 * @returns {Promise<{ movie: Record<string, unknown> | null, error: string | null }>} Filmobjekt für die Detailseite.
 */
export async function load({ fetch, params }) {
	if (!TMDB_API_KEY) {
		return {
			movie: null,
			error: 'TMDB_API_KEY fehlt'
		};
	}

	try {
		const api = new TmdbAPI(fetch, TMDB_API_KEY);

		const details = await api.getDetails('movie', params.id);

		return {
			movie: api.mapDetails(details, 'movie'),
			error: null
		};
	} catch (error) {
		console.error('Failed to load movie details:', error);

		return {
			movie: null,
			error: 'Film konnte nicht geladen werden'
		};
	}
}