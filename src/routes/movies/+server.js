import { json } from '@sveltejs/kit';
import { resolveLocale } from '$lib/i18n/helpers';
import { getLocaleText } from '$lib/i18n/resolver';
import { TMDB_API_KEY } from '$env/static/private';
import { createTmdbApi } from '$lib/services/tmdb-api.js';

/**
 * Loads another page of movies.
 *
 * The route expects the query parameter `page`, loads the corresponding
 * movie page via the TMDB API, and returns deduplicated cards along with paging info.
 *
 * @param {{ fetch: Function, url: URL }} event - SvelteKit request context.
 * @returns {Promise<Response>} JSON response with cards, page number, and error status.
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
		const api = createTmdbApi(fetch, TMDB_API_KEY, locale);

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
