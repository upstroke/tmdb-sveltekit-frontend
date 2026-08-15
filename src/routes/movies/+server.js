import { json } from '@sveltejs/kit';
import { TMDB_API_KEY } from '$env/static/private';
import { TmdbAPI } from '$lib/services/tmdb-api.js';

export async function GET({ fetch, url }) {
	const page = Math.max(1, Number(url.searchParams.get('page') ?? '1') || 1);

	if (!TMDB_API_KEY) {
		return json(
			{
				cards: [],
				page,
				hasMore: false,
				error: 'TMDB_API_KEY fehlt'
			},
			{ status: 500 }
		);
	}

	try {
		const api = new TmdbAPI(fetch, TMDB_API_KEY);

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
				error: 'Weitere Filme konnten nicht geladen werden.'
			},
			{ status: 500 }
		);
	}
}
