const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

/**
 * Determines the media type of an entry.
 *
 * @param {Object} item - TMDB data record.
 * @param {string|null} [fallback=null] - Alternative media type.
 * @returns {string|null} `movie`, `tv`, or `null`.
 */
export function getMediaType(item, fallback = null) {
	return fallback ?? item.media_type ?? (item.title ? 'movie' : item.name ? 'tv' : null);
}

/**
 * Returns the title of an entry.
 *
 * @param {Object} item - TMDB data record.
 * @returns {string} Title or an empty string.
 */
export function getTitle(item) {
	return item.title ?? item.name ?? '';
}

/**
 * Returns the relevant date of an entry.
 *
 * @param {Object} item - TMDB data record.
 * @returns {string} Release or start date.
 */
export function getDate(item) {
	return item.release_date ?? item.first_air_date ?? '';
}

/**
 * Builds a complete image URL from a TMDB path.
 *
 * @param {string} path - Image path.
 * @param {string} [size='w500'] - TMDB image size (e.g., `w92`, `w342`, `w500`, `w780`, `w1280`).
 * @returns {string} Full image URL or an empty string.
 */
export function getImageUrl(path, size = 'w500') {
	if (!path) {
		return '';
	}

	return `${IMAGE_BASE_URL}/${size}${path}`;
}
