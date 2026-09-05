import ratingsData from '$lib/i18n/ratings.json';
import { resolveLocale } from '$lib/i18n/helpers.js';
import { DEFAULT_LOCALE } from '$lib/i18n/config';

/**
 * Extracts the region from a resolved locale (e.g. "en-US" -> "US").
 *
 * @param {string} locale - Locale string.
 * @returns {string} Region code.
 */
function getRegionFromLocale(locale) {
	return locale.split('-')[1] ?? 'US';
}

/**
 * Returns the rating system for a given locale.
 *
 * @param {string} [locale=DEFAULT_LOCALE] - Locale (e.g. "en-US").
 * @returns {Object} Rating system with name and ratings.
 */
export function getRatingsForLocale(locale = DEFAULT_LOCALE) {
	const resolvedLocale = resolveLocale(locale);
	const region = getRegionFromLocale(resolvedLocale);
	return ratingsData.ratingSystems[region] ?? ratingsData.ratingSystems.DE;
}

/**
 * Mock for getCertificationMeta using real ratings.json data.
 *
 * Simulates the logic of $lib/utils/certificationMeta for tests.
 *
 * @param {string|null} certification - Certification (e.g. "PG").
 * @param {string} [locale=DEFAULT_LOCALE] - Locale for the region.
 * @returns {{label: string, color: string, textColor: string}|null}
 */
export function createCertificationMetaMock(locale = DEFAULT_LOCALE) {
	const ratings = getRatingsForLocale(locale);

	return vi.fn((certification) => {
		if (!certification) {
			return null;
		}

		// Look up the certification in the rating system
		const rating = ratings.ratings[certification];

		if (rating) {
			return {
				label: rating.label,
				color: rating.color,
				textColor: rating.textColor
			};
		}

		// Fallback: use the certification itself as the label
		return {
			label: certification,
			color: '#757575',
			textColor: '#ffffff'
		};
	});
}

/**
 * Predefined mock data for common certifications.
 */
export const commonCertifications = {
	'G': { label: 'G', description: 'General Audiences', color: '#2e7d32', textColor: '#ffffff' },
	'PG': { label: 'PG', description: 'Parental Guidance Suggested', color: '#f9a825', textColor: '#000000' },
	'PG-13': { label: 'PG-13', description: 'Parents Strongly Cautioned', color: '#ef6c00', textColor: '#ffffff' },
	'R': { label: 'R', description: 'Restricted', color: '#c62828', textColor: '#ffffff' },
	'NC-17': { label: 'NC-17', description: 'Adults Only', color: '#6a1b9a', textColor: '#ffffff' },
	'NR': { label: 'NR', description: 'Not Rated / Unrated', color: '#757575', textColor: '#ffffff' },
	'TV-Y': { label: 'TV-Y', description: 'All Children', color: '#4caf50', textColor: '#ffffff' },
	'TV-Y7': { label: 'TV-Y7', description: 'Directed to Older Children', color: '#8bc34a', textColor: '#ffffff' },
	'TV-G': { label: 'TV-G', description: 'General Audience (TV)', color: '#2e7d32', textColor: '#ffffff' },
	'TV-PG': { label: 'TV-PG', description: 'Parental Guidance Suggested (TV)', color: '#f9a825', textColor: '#000000' },
	'TV-14': { label: 'TV-14', description: 'Parents Strongly Cautioned (TV)', color: '#ef6c00', textColor: '#ffffff' },
	'TV-MA': { label: 'TV-MA', description: 'Mature Audience Only', color: '#c62828', textColor: '#ffffff' }
};
