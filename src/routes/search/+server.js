import { json } from '@sveltejs/kit';
import { DEFAULT_LOCALE } from '$lib/i18n/config';
import { getLocaleText } from '$lib/i18n/resolver';
import { TMDB_API_KEY } from '$env/static/private';
import { TmdbAPI } from '$lib/services/tmdb-api.js';

const { messages } = getLocaleText(DEFAULT_LOCALE);

/**
 * Sucht nach Filmen und TV-Shows anhand eines Suchbegriffs.
 *
 * Die Route erwartet den Query-Parameter `q`, prüft dessen Mindestlänge
 * und liefert getrennte Listen für Filme und TV-Shows zurück.
 *
 * @param {{ fetch: Function, url: URL }} event - SvelteKit-Request-Kontext.
 * @returns {Promise<Response>} JSON-Antwort mit Suchergebnissen.
 */
export async function GET({ fetch, url }) {
	const query = url.searchParams.get('q')?.trim();

	if (!query || query.length < 4) {
		return json({
			movies: [],
			tvShows: [],
			results: []
		});
	}

	if (!TMDB_API_KEY) {
		return json(
			{
				movies: [],
				tvShows: [],
				results: [],
				error: messages.apiKeyMissing
			},
			{ status: 500 }
		);
	}

	try {
		const api = new TmdbAPI(fetch, TMDB_API_KEY);

		const results = await api.searchMulti(query);

		return json({
			movies: results.filter((item) => item.mediaType === 'movie'),
			tvShows: results.filter((item) => item.mediaType === 'tv'),
			results
		});
	} catch (error) {
		console.error('Search failed:', error);

		return json(
			{
				movies: [],
				tvShows: [],
				results: [],
				error: messages.searchError
			},
			{ status: 500 }
		);
	}
}
