import { TMDB_API_KEY } from '$env/static/private';
import { resolveLocale } from '$lib/i18n/helpers';
import { getLocaleText } from '$lib/i18n/resolver';
import { createTmdbApi } from '$lib/services/tmdb-api.js';

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
export async function load({ fetch, params, url }) {
	const locale = resolveLocale(url.searchParams.get('locale'));
	const { messages } = getLocaleText(locale);
	if (!TMDB_API_KEY) {
		return {
			movie: null,
			error: messages.apiKeyMissing
		};
	}

	try {
		const api = createTmdbApi(fetch, TMDB_API_KEY, locale);

		const details = await api.getDetails('movie', params.id);

		return {
			movie: details,
			error: null
		};
	} catch (error) {
		console.error('Failed to load movie details:', error);

		return {
			movie: null,
			error: messages.movieLoadError
		};
	}
}
