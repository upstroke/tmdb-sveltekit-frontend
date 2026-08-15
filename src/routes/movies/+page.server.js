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
			Array.from({ length: lastPage }, (_, index) => api.getTrendingMovies(index + 1))
		);

		const firstPage = pages[0];

		const source =
			firstPage?.results?.[2] ?? firstPage?.results?.[1] ?? firstPage?.results?.[0] ?? null;

		let featured = null;

		if (source) {
			featured = {
				id: source.id,
				mediaType: 'movie',
				title: source.title ?? 'N/A',
				releaseDate: source.date ?? 'N/A',
				overview: '',
				homepage: '',
				genres: source.genres ?? [],
				imageUrl: source.imageUrl
			};

			try {
				const details = await api.getDetails('movie', source.id);

				featured = {
					...featured,
					...api.mapFeaturedItem(details, 'movie')
				};
			} catch (error) {
				console.error('Featured movie details could not be loaded:', error);
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
		console.error('Failed to load movies:', error);

		return {
			featured: null,
			cards: [],
			page: lastPage,
			hasMore: false,
			error: 'Filme konnten nicht geladen werden'
		};
	}
}
