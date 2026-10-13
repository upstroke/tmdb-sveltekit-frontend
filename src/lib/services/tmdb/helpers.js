// @ts-check

/** @typedef {import('./types.js').TmdbRawItem} TmdbRawItem */
/** @typedef {import('./types.js').ImageSize} ImageSize */

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

/**
 * Determines the media type of an entry.
 *
 * The `fallback` takes precedence over `item.media_type`. If neither is set,
 * the type is inferred from `title` (movie) or `name` (TV show).
 * TMDB may also deliver `person` as `media_type` in mixed lists.
 *
 * @param {TmdbRawItem} item - TMDB data record.
 * @param {string | null} [fallback=null] - Alternative media type.
 * @returns {string | null} `movie`, `tv`, another TMDB media type, or `null`.
 */
export function getMediaType(item, fallback = null) {
	return fallback ?? item.media_type ?? (item.title ? 'movie' : item.name ? 'tv' : null);
}

/**
 * Returns the title of an entry.
 *
 * @param {TmdbRawItem} item - TMDB data record.
 * @returns {string} Title or an empty string.
 */
export function getTitle(item) {
	return item.title ?? item.name ?? '';
}

/**
 * Returns the relevant date of an entry.
 *
 * @param {TmdbRawItem} item - TMDB data record.
 * @returns {string} Release or start date, or an empty string.
 */
export function getDate(item) {
	return item.release_date ?? item.first_air_date ?? '';
}

/**
 * Builds a complete image URL from a TMDB path.
 *
 * @param {string | null | undefined} path - Image path.
 * @param {ImageSize} [size='w500'] - TMDB image size.
 * @returns {string} Full image URL or an empty string.
 */
export function getImageUrl(path, size = 'w500') {
	if (!path) {
		return '';
	}

	return `${IMAGE_BASE_URL}/${size}${path}`;
}
