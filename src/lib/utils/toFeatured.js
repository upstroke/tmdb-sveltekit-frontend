// @ts-check

/** @typedef {import('$lib/types/tmdb.js').MappedDetails} MappedDetails */
/** @typedef {import('$lib/types/tmdb.js').MappedFeatured} MappedFeatured */

/**
 * Reduces mapped movie or TV show details to the featured object shown on
 * the list pages.
 *
 * @param {MappedDetails} details - Mapped details of a movie or TV show.
 * @returns {MappedFeatured} Reduced featured object.
 */
export function toFeatured(details) {
	return {
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
}
