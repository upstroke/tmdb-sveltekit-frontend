/**
 * Erstellt einen stabilen Schlüssel, um ein Media-Element eindeutig zu erkennen.
 *
 * Dafür müssen `mediaType` und `id` vorhanden sein. Fehlt einer der beiden
 * Werte, gibt die Funktion `null` zurück, damit das Element bei der
 * Deduplizierung ignoriert wird.
 *
 * @param {object} item - Zu prüfendes Media-Element.
 * @param {string|number} item.id - Eindeutige ID des Media-Elements.
 * @param {string} item.mediaType - Medientyp, zum Beispiel `movie` oder `tv`.
 * @returns {string|null} Kombinierter Schlüssel im Format `mediaType-id` oder
 * `null`, wenn kein sicherer Schlüssel gebildet werden kann.
 */
export function getMediaKey(item) {
	if (!item || item.id == null || !item.mediaType) {
		return null;
	}

	return `${item.mediaType}-${item.id}`;
}

/**
 * Entfernt doppelte Media-Elemente aus einem Array.
 *
 * Die Deduplizierung basiert auf der Kombination aus `mediaType` und `id`.
 * Der erste Eintrag mit einem eindeutigen Schlüssel bleibt erhalten, spätere
 * Duplikate werden entfernt. Elemente ohne gültigen Schlüssel werden
 * übersprungen.
 *
 * @param {Array<object>} items - Liste der Media-Elemente, die bereinigt werden sollen.
 * @returns {Array<object>} Neues Array mit nur dem ersten Vorkommen jedes eindeutigen
 * Media-Elements.
 */
export function deduplicateMedia(items = []) {
	const seen = new Set();

	return items.filter((item) => {
		const key = getMediaKey(item);

		if (!key || seen.has(key)) {
			return false;
		}

		seen.add(key);
		return true;
	});
}