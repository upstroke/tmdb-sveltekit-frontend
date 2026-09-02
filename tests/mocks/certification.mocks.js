import ratingsData from '$lib/i18n/ratings.json';
import { DEFAULT_LOCALE } from '$lib/i18n/config';

/**
 * Extrahiert die Region aus einer Locale (z.B. "de-DE" -> "DE").
 *
 * @param {string} locale - Locale-String.
 * @returns {string} Region-Code.
 */
function getRegionFromLocale(locale) {
	return locale.split('-')[1] ?? 'DE';
}

/**
 * Liefert das Rating-System für eine gegebene Locale.
 *
 * @param {string} [locale=DEFAULT_LOCALE] - Locale (z.B. "de-DE").
 * @returns {Object} Rating-System mit name und ratings.
 */
export function getRatingsForLocale(locale = DEFAULT_LOCALE) {
	const region = getRegionFromLocale(locale);
	return ratingsData.ratingSystems[region] ?? ratingsData.ratingSystems.DE;
}

/**
 * Mock für getCertificationMeta mit echten ratings.json-Daten.
 *
 * Simuliert die Logik von $lib/utils/certificationMeta für Tests.
 *
 * @param {string|null} certification - Zertifizierung (z.B. "FSK 12").
 * @param {string} [locale=DEFAULT_LOCALE] - Locale für die Region.
 * @returns {{label: string, color: string, textColor: string}|null}
 */
export function createCertificationMetaMock(locale = DEFAULT_LOCALE) {
	const ratings = getRatingsForLocale(locale);

	return vi.fn((certification) => {
		if (!certification) {
			return null;
		}

		// Suche im Rating-System nach der Certification
		const rating = ratings.ratings[certification];

		if (rating) {
			return {
				label: rating.label,
				color: rating.color,
				textColor: rating.textColor
			};
		}

		// Fallback: Certification als Label verwenden
		return {
			label: certification,
			color: '#757575',
			textColor: '#ffffff'
		};
	});
}

/**
 * Vorgefertigte Mock-Daten für häufige Zertifizierungen.
 */
export const commonCertifications = {
	FSK_0: { label: 'FSK 0', color: '#ffffff', textColor: '#000000' },
	FSK_6: { label: 'FSK 6', color: '#ffd500', textColor: '#000000' },
	FSK_12: { label: 'FSK 12', color: '#4caf50', textColor: '#000000' },
	FSK_16: { label: 'FSK 16', color: '#1976d2', textColor: '#ffffff' },
	FSK_18: { label: 'FSK 18', color: '#d32f2f', textColor: '#ffffff' },
	PG_13: { label: 'PG-13', color: '#ef6c00', textColor: '#ffffff' },
	R: { label: 'R', color: '#c62828', textColor: '#ffffff' }
};
