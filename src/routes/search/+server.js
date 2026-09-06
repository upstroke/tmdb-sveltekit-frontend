import { json } from '@sveltejs/kit';
import { resolveLocale } from '$lib/i18n/helpers';
import { getLocaleText } from '$lib/i18n/resolver';
import { TMDB_API_KEY } from '$env/static/private';
import { createTmdbApi } from '$lib/services/tmdb-api.js';

/**
 * Searches for movies and TV shows based on a search term.
 *
 * The route expects the query parameter `q`, validates its minimum length,
 * and returns separate lists for movies and TV shows.
 *
 * @param {{ fetch: Function, url: URL }} event - SvelteKit request context.
 * @returns {Promise<Response>} JSON response with search results.
 */
export async function GET({ fetch, url }) {
	const locale = resolveLocale(url.searchParams.get('locale'));
	const { messages } = getLocaleText(locale);
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
		const api = createTmdbApi(fetch, TMDB_API_KEY, locale);

		const searchResult = await api.searchMedia(query);
		const results = searchResult.results ?? [];

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
