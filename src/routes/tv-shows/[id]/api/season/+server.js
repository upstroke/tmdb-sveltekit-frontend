import { json, error } from '@sveltejs/kit';
import { TMDB_API_KEY } from '$env/static/private';

/**
 * GET /tv-shows/[id]/api/season?seasonNumber=1
 *
 * Proxies the TMDB season detail endpoint and returns the episodes array.
 *
 * @param {import('@sveltejs/kit').RequestEvent} event
 * @returns {Promise<Response>}
 */
export async function GET({ params, url, fetch }) {
	const seasonNumber = url.searchParams.get('seasonNumber');

	if (!seasonNumber) {
		throw error(400, 'Missing seasonNumber query parameter');
	}

	const res = await fetch(
		`https://api.themoviedb.org/3/tv/${params.id}/season/${seasonNumber}?api_key=${TMDB_API_KEY}`
	);

	if (!res.ok) {
		throw error(res.status, 'Failed to fetch season details');
	}

	const data = await res.json();

	return json({ episodes: data.episodes ?? [] });
}
