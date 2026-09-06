import { TMDB_API_KEY } from '$env/static/private';
import { resolveLocale } from '$lib/i18n/helpers';
import { getLocaleText } from '$lib/i18n/resolver';
import { createTmdbApi } from '$lib/services/tmdb-api.js';

/**
 * Loads the server data for a movie detail page.
 *
 * The function reads the movie ID from the route parameters, loads the
 * detail data via the TMDB API, and returns a mapped movie object.
 * If no API key is available, an empty record with an error message
 * is returned.
 *
 * @param {{ fetch: Function, params: { id: string } }} event - SvelteKit load context.
 * @returns {Promise<{ movie: Record<string, unknown> | null, error: string | null }>} Movie object for the detail page.
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

		const [details, providers] = await Promise.all([
			api.getMovieDetails(params.id),
			api.getWatchProviders('movie', params.id)
		]);

		return {
			movie: {
				...details,
				trailerUrls: details.trailerUrls ?? []
			},
			providers,
			error: null
		};
	} catch (error) {
		console.error('Failed to load movie details:', error);

		return {
			movie: null,
			error: error instanceof Error ? error.message : messages.movieLoadError
		};
	}
}
