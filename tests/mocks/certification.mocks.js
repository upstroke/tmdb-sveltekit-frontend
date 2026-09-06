import { vi } from 'vitest';
import ratingsData from '$lib/i18n/ratings.json';
import { resolveLocale } from '$lib/i18n/helpers.js';
import { DEFAULT_LOCALE } from '$lib/i18n/config.js';

/**
 * Extracts the region code from a locale string.
 *
 * @param {string} locale - Locale string, for example 'en-US'.
 * @returns {string} Region code, for example 'US'.
 */
function getRegionFromLocale(locale) {
	return resolveLocale(locale).split('-')[1] ?? 'US';
}

/**
 * Returns the ratings configuration for a region code or a full locale.
 *
 * @param {string} [regionOrLocale=DEFAULT_LOCALE] - Region code such as 'US' or locale such as 'en-US'.
 * @returns {Object} Rating-system configuration.
 */
export function getRatingsForRegion(regionOrLocale = DEFAULT_LOCALE) {
	const region = regionOrLocale.includes('-')
		? getRegionFromLocale(regionOrLocale)
		: regionOrLocale || getRegionFromLocale(DEFAULT_LOCALE);

	return ratingsData.ratingSystems[region] ?? ratingsData.ratingSystems.DE;
}

/**
 * Creates a getCertificationMeta mock based on the real ratings configuration.
 *
 * The component under test passes a region code as the second argument.
 * When no region is passed, the configured default locale is used.
 *
 * @returns {import('vitest').Mock} Mocked getCertificationMeta function.
 */
export function createCertificationMetaMock() {
	return vi.fn((certification, region) => {
		if (!certification) {
			return null;
		}

		const ratings = getRatingsForRegion(region);
		const rating = ratings.ratings[certification];

		if (rating) {
			return {
				label: rating.label,
				color: rating.color,
				textColor: rating.textColor
			};
		}

		return {
			label: certification,
			color: '#757575',
			textColor: '#ffffff'
		};
	});
}

/**
 * Common certification metadata for focused component tests.
 */
export const commonCertifications = {
	G: { label: 'G', description: 'General Audiences', color: '#2e7d32', textColor: '#ffffff' },
	PG: {
		label: 'PG',
		description: 'Parental Guidance Suggested',
		color: '#f9a825',
		textColor: '#000000'
	},
	'PG-13': {
		label: 'PG-13',
		description: 'Parents Strongly Cautioned',
		color: '#ef6c00',
		textColor: '#ffffff'
	},
	R: { label: 'R', description: 'Restricted', color: '#c62828', textColor: '#ffffff' },
	'NC-17': {
		label: 'NC-17',
		description: 'Adults Only',
		color: '#6a1b9a',
		textColor: '#ffffff'
	},
	NR: {
		label: 'NR',
		description: 'Not Rated / Unrated',
		color: '#757575',
		textColor: '#ffffff'
	}
};