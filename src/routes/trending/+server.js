import { json } from '@sveltejs/kit';
import { resolveLocale } from '$lib/i18n/helpers';
import { getLocaleText } from '$lib/i18n/resolver';
import { TMDB_API_KEY } from '$env/static/private';
import { TmdbAPI } from '$lib/services/tmdb-api.js';

/**
 * Lädt eine Seite mit trending Inhalten.
 *
 * Die Route erwartet den Query-Parameter `page` und liefert die nächste
 * Portion gemischter Inhalte für die Startseite zurück.
 *
 * @param {{ fetch: Function, url: URL }} event - SvelteKit-Request-Kontext.
 * @returns {Promise<Response>} JSON-Antwort mit Karten und Paging-Status.
 */
export async function GET({ fetch, url }) {
	const locale = resolveLocale(url.searchParams.get('locale'));
	const { messages } = getLocaleText(locale);
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
		const api = new TmdbAPI(fetch, TMDB_API_KEY, locale);

		const trending = await api.getTrendingAll(page);

		return json({
			cards: trending.results ?? [],
			page: trending.page ?? page,
			hasMore: trending.hasMore === true,
			error: null
		});
	} catch (error) {
		console.error('Failed to load trending content:', error);

		return json(
			{
				cards: [],
				page,
				hasMore: false,
				error: messages.loadMoreError
			},
			{ status: 500 }
		);
	}
}
