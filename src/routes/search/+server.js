import { json } from '@sveltejs/kit';
import { TMDB_API_KEY } from '$env/static/private';
import { TmdbAPI } from '$lib/services/tmdb-api.js';

export async function GET({ fetch, url }) {
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
				error: 'TMDB_API_KEY fehlt'
			},
			{ status: 500 }
		);
	}

	try {
		const api = new TmdbAPI(fetch, TMDB_API_KEY);

		const results = await api.searchMulti(query);

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
				error: 'Suche konnte nicht geladen werden.'
			},
			{ status: 500 }
		);
	}
}
