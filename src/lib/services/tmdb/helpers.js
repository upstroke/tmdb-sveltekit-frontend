const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

/**
 * Ermittelt den Medientyp eines Eintrags.
 *
 * @param {Object} item - TMDB-Datensatz.
 * @param {string|null} [fallback=null] - Alternativer Medientyp.
 * @returns {string|null} `movie`, `tv` oder `null`.
 */
export function getMediaType(item, fallback = null) {
	return fallback ?? item.media_type ?? (item.title ? 'movie' : item.name ? 'tv' : null);
}

/**
 * Gibt den Titel eines Eintrags zurück.
 *
 * @param {Object} item - TMDB-Datensatz.
 * @returns {string} Titel oder leerer String.
 */
export function getTitle(item) {
	return item.title ?? item.name ?? '';
}

/**
 * Gibt das relevante Datum eines Eintrags zurück.
 *
 * @param {Object} item - TMDB-Datensatz.
 * @returns {string} Veröffentlichungs- oder Startdatum.
 */
export function getDate(item) {
	return item.release_date ?? item.first_air_date ?? '';
}

/**
 * Baut eine vollständige Bild-URL aus einem TMDB-Pfad.
 *
 * @param {string} path - Bildpfad.
 * @param {string} [size='w500'] - TMDB-Bildgröße (z. B. `w92`, `w342`, `w500`, `w780`, `w1280`).
 * @returns {string} Vollständige Bild-URL oder leerer String.
 */
export function getImageUrl(path, size = 'w500') {
	if (!path) {
		return '';
	}

	return `${IMAGE_BASE_URL}/${size}${path}`;
}
