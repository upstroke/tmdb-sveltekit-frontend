import { TMDB_API_KEY } from '$env/static/private';
import { resolveLocale } from '$lib/i18n/helpers';
import { getLocaleText } from '$lib/i18n/resolver';
import { createTmdbApi } from '$lib/services/tmdb-api.js';

/**
 * Loads the server data for the homepage.
 *
 * The function determines the desired page from the URL, loads the
 * trending data for all media types, and prepares a featured object
 * as well as the card list for display.
 *
 * @param {{ fetch: Function, url: URL }} event - SvelteKit load context.
 * @returns {Promise<{
 *   featured: {
 *     id: number|string,
 *     mediaType: 'movie'|'tv'|string,
 *     title: string,
 *     releaseDate: string,
 *     overview: string,
 *     homepage: string,
 *     genres: Array<{id: number|string, name: string}>,
 *     imageUrl: string
 *   } | null,
 *   cards: Array<Record<string, unknown>>,
 *   page: number,
 *   hasMore: boolean,
 *   error: string | null
 * }>} Loaded page and card data.
 */

export async function load({ fetch, url }) {
	const locale = resolveLocale(url.searchParams.get('locale'));
	const { messages } = getLocaleText(locale);
	const lastPage = Math.max(1, Number(url.searchParams.get('page') ?? '1') || 1);

	if (!TMDB_API_KEY) {
		return {
			featured: null,
			cards: [],
			page: 1,
			hasMore: false,
			error: messages.apiKeyMissing
		};
	}

	const api = createTmdbApi(fetch, TMDB_API_KEY, locale);

	try {
		const pages = await Promise.all(
			Array.from({ length: lastPage }, (_, index) => api.getTrendingAll(index + 1))
		);

		const firstPage = pages[0];
		const source =
			firstPage?.results?.[0] ?? firstPage?.results?.[1] ?? firstPage?.results?.[2] ?? null;

		let featured = null;

		if (source) {
			try {
				const details =
					source.mediaType === 'tv'
						? await api.getTVShowDetails(source.id)
						: await api.getMovieDetails(source.id);

				featured = {
					id: details.id,
					mediaType: details.mediaType,
					title: details.title,
					releaseDate: details.releaseDate,
					overview: details.overview,
					homepage: details.homepage,
					genres: details.genres ?? [],
					imageUrl: details.imageUrl,
					posterUrl: details.posterUrl
				};
			} catch (error) {
				console.error('Featured details could not be loaded:', error);
			}
		}

		return {
			featured,
			cards: pages.flatMap((result) => result.results ?? []),
			page: lastPage,
			hasMore: pages.at(-1)?.hasMore === true,
			error: null
		};
	} catch (error) {
		console.error('Failed to load homepage:', error);

		return {
			featured: null,
			cards: [],
			page: lastPage,
			hasMore: false,
			error: messages.contentLoadError
		};
	}
}
