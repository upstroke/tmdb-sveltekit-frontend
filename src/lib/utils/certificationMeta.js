import ratings from '$lib/i18n/ratings.json';

const DEFAULT_RATING_SYSTEM = 'DE';

/**
 * Normalisiert ein Rating-System und verwendet bei fehlenden oder ungültigen
 * Angaben das standardmäßig konfigurierte System.
 *
 * @param {string|number|null|undefined} value - Rohwert des Rating-Systems.
 * @returns {string} Normalisierter Rating-System-Code.
 */
function normalizeRatingSystem(value) {
	const normalized = String(value ?? '')
		.trim()
		.toUpperCase();
	return normalized || DEFAULT_RATING_SYSTEM;
}

/**
 * Liefert Anzeigeinformationen für eine landesspezifische Altersfreigabe.
 *
 * @param {string|number|null|undefined} value - Rohwert aus TMDB oder IMDb.
 * @param {string} [country=DEFAULT_RATING_SYSTEM] - Rating-System, z. B. DE oder US.
 * @returns {{value: string, label: string, color: string, textColor: string, description?: string}|null}
 */
export function getCertificationMeta(value, country = DEFAULT_RATING_SYSTEM) {
	const normalizedValue = String(value ?? '').trim();

	if (!normalizedValue) {
		return null;
	}

	const ratingSystem = ratings.ratingSystems[normalizeRatingSystem(country)];
	const rating = ratingSystem?.ratings?.[normalizedValue];

	if (!rating) {
		return {
			value: normalizedValue,
			label: normalizedValue,
			color: 'transparent',
			textColor: 'inherit'
		};
	}

	return {
		value: normalizedValue,
		...rating
	};
}
