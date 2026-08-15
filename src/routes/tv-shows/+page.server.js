import { TMDB_API_KEY } from '$env/static/private';
import { TmdbAPI } from '$lib/services/tmdb-api.js';

export async function load({ fetch, url }) {
	const lastPage = Math.max(1, Number(url.searchParams.get('page') ?? '1') || 1);

	if (!TMDB_API_KEY) {
		return {
			featured: null,
			cards: [],
			page: 1,
			hasMore: false,
			error: 'TMDB_API_KEY fehlt'
		};
	}

	const api = new TmdbAPI(fetch, TMDB_API_KEY);

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

		const featuredSource = firstPage?.results?.[0] ?? null;

		if (featuredSource) {
			try {
				const featuredDetails = await api.getDetails('tv', featuredSource.id);

				featured = api.mapFeaturedItem(featuredDetails, 'tv');
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
			error: 'TV-Shows konnten nicht geladen werden'
		};
	}
}
