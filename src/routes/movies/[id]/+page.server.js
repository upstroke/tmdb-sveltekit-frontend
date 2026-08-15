import { TMDB_API_KEY } from '$env/static/private';
import { TmdbAPI } from '$lib/services/tmdb-api.js';

export async function load({ fetch, params }) {
	const api = new TmdbAPI(fetch, TMDB_API_KEY);

	const details = await api.getDetails('movie', params.id);

	return {
		movie: api.mapDetails(details, 'movie')
	};
}
