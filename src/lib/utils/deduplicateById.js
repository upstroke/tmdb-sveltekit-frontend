/**
 * Entfernt Einträge ohne gültige ID und doppelte IDs aus einer Liste.
 *
 * Der erste Eintrag mit einer bestimmten ID bleibt erhalten.
 * Weitere Einträge mit derselben ID werden entfernt.
 * Die ursprüngliche Reihenfolge bleibt bestehen.
 *
 * @param {Array<{id: string|number}>} items Liste von Objekten mit IDs.
 * @returns {Array<{id: string|number}>} Bereinigte Liste ohne doppelte IDs.
 */

export function deduplicateById(items = []) {
	const seen = new Set();

	return items.filter((item) => {
		if (item?.id == null || seen.has(item.id)) {
			return false;
		}

		seen.add(item.id);
		return true;
	});
}
