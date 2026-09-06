import { json } from '@sveltejs/kit';
import { resolveLocale } from '$lib/i18n/helpers';
import { getLocaleText } from '$lib/i18n/resolver';
import { TMDB_API_KEY } from '$env/static/private';
import { createTmdbApi } from '$lib/services/tmdb-api.js';

/**
 * Loads a page of trending content.
 *
 * The route expects the query parameter `page` and returns the next
 * batch of mixed content for the homepage.
 *
 * @param {{ fetch: Function, url: URL }} event - SvelteKit request context.
 * @returns {Promise<Response>} JSON response with cards and paging status.
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
