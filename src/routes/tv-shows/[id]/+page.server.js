import { TMDB_API_KEY } from '$env/static/private';
import { resolveLocale } from '$lib/i18n/helpers';
import { getLocaleText } from '$lib/i18n/resolver';
import { createTmdbApi } from '$lib/services/tmdb-api.js';

/**
 * Loads the server data for a TV show detail page.
 *
 * The function reads the TV show ID from the route parameters, loads the
 * detail data via the TMDB API, and returns a mapped TV show object with
 * seasons including their episodes.
 * If no API key is available, an empty record with an error message
 * is returned.
 *
 * @param {{ fetch: Function, params: { id: string }, url: URL }} event - SvelteKit load context.
 * @returns {Promise<{ tvShow: Record<string, unknown> | null, providers: Object | null, error: string | null }>} TV show object for the detail page.
 */
export async function load({ fetch, params, url }) {
	const locale = resolveLocale(url.searchParams.get('locale'));
	const { messages } = getLocaleText(locale);

	if (!TMDB_API_KEY) {
		return {
			tvShow: null,
			error: messages.apiKeyMissing
		};
	}

	try {
		const api = createTmdbApi(fetch, TMDB_API_KEY, locale);

		const [details, providers] = await Promise.all([
			api.getTVShowDetails(params.id),
			api.getWatchProviders('tv', params.id)
		]);

		// Fetch episodes for each season
		const seasonsWithEpisodes = await Promise.all(
			(details.seasons || []).map(async (season) => {
				try {
					const seasonDetails = await api.getTVSeasonDetails(params.id, season.season_number);
					return {
						...season,
						episodes: seasonDetails.episodes
					};
				} catch (err) {
					console.warn(`Failed to fetch season ${season.season_number}:`, err.message);
					return {
						...season,
						episodes: []
					};
				}
			})
		);

		return {
			tvShow: {
				...details,
				seasons: seasonsWithEpisodes
			},
			providers,
			error: null
		};
	} catch (error) {
		console.error('Failed to load tv details:', error);

		return {
			tvShow: null,
			error: messages.tvShowLoadError
		};
	}
}
