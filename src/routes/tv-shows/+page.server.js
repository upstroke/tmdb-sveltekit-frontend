// @ts-check

import { TMDB_API_KEY } from '$env/static/private';
import { resolveLocale } from '$lib/i18n/helpers';
import { getLocaleText } from '$lib/i18n/resolver';
import { createTmdbApi } from '$lib/services/tmdb-api.js';
import { toFeatured } from '$lib/utils/toFeatured.js';

/** @typedef {import('$lib/types/tmdb.js').ListPageData} ListPageData */

/**
 * Loads the server data for the TV show list.
 *
 * The function determines the desired page from the URL, loads the
 * corresponding trending TV shows via the TMDB API, and prepares a
 * featured object as well as the card list for the page.
 *
 * @param {{ fetch: typeof globalThis.fetch, url: URL }} event - SvelteKit load context.
 * @returns {Promise<ListPageData>} Loaded page and card data.
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
			Array.from({ length: lastPage }, (_, index) => api.getTrendingTVShows(index + 1))
		);

		const firstPage = pages[0];

		const cards = Array.from(
			new Map(
				pages
					.flatMap((result) => result.results ?? [])
					.map((card) => [`${card.id}-${card.mediaType}`, card])
			).values()
		);

		let featured = null;

		const featuredSource =
			firstPage?.results?.[1] ?? firstPage?.results?.[2] ?? firstPage?.results?.[0] ?? null;

		if (featuredSource) {
			try {
				const featuredDetails = await api.getTVShowDetails(featuredSource.id);

				featured = toFeatured(featuredDetails);
			} catch (error) {
				console.error('Featured TV-show details could not be loaded:', error);
			}
		}

		return {
			featured,
			cards,
			page: lastPage,
			hasMore: pages.at(-1)?.hasMore === true,
			error: null
		};
	} catch (error) {
		console.error('Failed to load tv shows:', error);

		return {
			featured: null,
			cards: [],
			page: lastPage,
			hasMore: false,
			error: messages.tvShowsLoadError
		};
	}
}
