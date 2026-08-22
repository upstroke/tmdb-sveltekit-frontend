import { json } from '@sveltejs/kit';
import { DEFAULT_LOCALE } from '$lib/i18n/config';
import { getLocaleText } from '$lib/i18n/resolver';
import { TMDB_API_KEY } from '$env/static/private';
import { TmdbAPI } from '$lib/services/tmdb-api.js';

const { messages } = getLocaleText(DEFAULT_LOCALE);

/**
 * Lädt eine weitere Seite mit Filmen.
 *
 * Die Route erwartet den Query-Parameter `page`, lädt die entsprechende
 * Filmseite über die TMDB-API und gibt deduplizierte Karten sowie Paging-Infos zurück.
 *
 * @param {{ fetch: Function, url: URL }} event - SvelteKit-Request-Kontext.
 * @returns {Promise<Response>} JSON-Antwort mit Karten, Seitennummer und Fehlerstatus.
 */
export async function GET({ fetch, url }) {
	const page = Math.max(1, Number(url.searchParams.get('page') ?? '1') || 1);

	if (!TMDB_API_KEY) {
		return json(
			{
				cards: [],
				page,
				hasMore: false,
				error: messages.apiKeyMissing
			},
			{ status: 500 }
		);
	}

	try {
		const api = new TmdbAPI(fetch, TMDB_API_KEY);

		const movies = await api.getTrendingMovies(page);

		const cards = Array.from(
			new Map((movies.results ?? []).map((card) => [`${card.id}-${card.mediaType}`, card])).values()
		);

		return json({
			cards,
			page: movies.page ?? page,
			hasMore: movies.hasMore === true,
			error: null
		});
	} catch (error) {
		console.error('Failed to load more movies:', error);

		return json(
			{
				cards: [],
				page,
				hasMore: false,
				error: messages.moreMoviesLoadError
			},
			{ status: 500 }
		);
	}
}
