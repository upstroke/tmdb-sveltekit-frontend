import uiText from '$lib/i18n/ui.json';
import { DEFAULT_LOCALE } from '$lib/i18n/config';

/**
 * @typedef {Object} LocaleFallbacks
 * @property {string} notAvailable
 * @property {string} dateFallback
 */

/**
 * @typedef {Object} LocaleLabels
 * @property {string} rating
 * @property {string} genre
 * @property {string} genres
 * @property {string} releaseDate
 * @property {string} productionCompanies
 * @property {string} moreInfo
 * @property {string} officialWebsite
 * @property {string} firstAirDate
 * @property {string} mediaType
 * @property {string} overview
 * @property {string} homepage
 * @property {string} trailer
 * @property {string} production
 * @property {string} runtime
 * @property {string} cast
 * @property {string} actor
 * @property {string} role
 * @property {string} crew
 * @property {string} job
 * @property {string} certification
 * @property {string} searchInput
 * @property {string} languageSelect
 * @property {string} navigationToggle
 * @property {string} mainNavigation
 * @property {string} movie
 * @property {string} tvShow
 * @property {string} streamingProviders
 * @property {string} streamingDataProvidedBy
 * @property {string} providerTypeFlatrate
 * @property {string} providerTypeRent
 * @property {string} providerTypeBuy
 * @property {string} seasons
 * @property {string} season
 */

/**
 * @typedef {Object} LocaleMessages
 * @property {string} loading
 * @property {string} loadMoreError
 * @property {string} unknownError
 * @property {string} pageSaveWarning
 * @property {string} loadTimeout
 * @property {string} noTvShows
 * @property {string} noGenres
 * @property {string} noRole
 * @property {string} noCast
 * @property {string} noCrew
 * @property {string} noJob
 * @property {string} searchLoading
 * @property {string} searchError
 * @property {string} searchNoResults
 * @property {string} noContent
 * @property {string} noMoviesFound
 * @property {string} apiKeyMissing
 * @property {string} contentLoadError
 * @property {string} moviesLoadError
 * @property {string} movieLoadError
 * @property {string} moreMoviesLoadError
 * @property {string} tvShowsLoadError
 * @property {string} tvShowLoadError
 * @property {string} moreTvShowsLoadError
 * @property {string} searchHint
 * @property {string} searchResults
 * @property {string} loadMore
 * @property {string} dialogErrorTitle
 * @property {string} dialogOk
 * @property {string} loadMoreLoading
 * @property {string} searchResultsCount
 */

/**
 * @typedef {Object} LocaleFormats
 * @property {string} outOfTen
 * @property {string} minutes
 * @property {string} detailsSuffix
 */

/**
 * @typedef {Object} LocaleTitles
 * @property {string} home
 * @property {string} movies
 * @property {string} movieDetails
 * @property {string} tvShowDetails
 * @property {string} tvShows
 * @property {string} topRatedProductions
 * @property {string} featuredToday
 * @property {string} trendingToday
 */

/**
 * @typedef {Object} LocaleButtons
 * @property {string} watchTrailer
 */

/**
 * @typedef {Object} LocaleData
 * @property {string} languageCode
 * @property {string} languageShortCode
 * @property {LocaleFallbacks} fallbacks
 * @property {LocaleLabels} labels
 * @property {LocaleMessages} messages
 * @property {LocaleFormats} formats
 * @property {LocaleTitles} titles
 * @property {LocaleButtons} buttons
 */

const SUPPORTED_LOCALES = new Set(
	Object.values(uiText.locales)
		.map(({ languageCode }) => languageCode)
		.filter(Boolean)
);

/**
 * Collects all leaf-level keys of an object as dot-notation paths.
 *
 * @param {Record<string, unknown>} obj
 * @param {string} [prefix]
 * @returns {string[]}
 */
function collectKeys(obj, prefix = '') {
	return Object.entries(obj).flatMap(([key, value]) => {
		const path = prefix ? `${prefix}.${key}` : key;
		return value !== null && typeof value === 'object'
			? collectKeys(/** @type {Record<string, unknown>} */ (value), path)
			: [path];
	});
}

/**
 * Validates that all locales in ui.json contain the same keys as the
 * reference locale (en-US). Missing or extra keys are reported via
 * console.warn so developers notice gaps immediately during development.
 *
 * Call this once at app startup (e.g. in +layout.svelte) in dev mode.
 *
 * @returns {void}
 */
export function validateLocales() {
	const locales = uiText.locales;
	const referenceLocale = 'en-US';
	const reference = locales[referenceLocale];

	if (!reference) {
		console.warn(`[i18n] Reference locale "${referenceLocale}" not found in ui.json.`);
		return;
	}

	const referenceKeys = new Set(collectKeys(reference));

	for (const [localeCode, localeData] of Object.entries(locales)) {
		if (localeCode === referenceLocale) continue;

		const localeKeys = new Set(collectKeys(/** @type {Record<string, unknown>} */ (localeData)));

		for (const key of referenceKeys) {
			if (!localeKeys.has(key)) {
				console.warn(`[i18n] Locale "${localeCode}" is missing key: "${key}"`);
			}
		}

		for (const key of localeKeys) {
			if (!referenceKeys.has(key)) {
				console.warn(`[i18n] Locale "${localeCode}" has unexpected key: "${key}"`);
			}
		}
	}
}

/**
 * Normalizes a locale to a language supported in the project.
 *
 * Empty or unknown values fall back to the default locale.
 *
 * @param {string|null|undefined} value - Requested locale, e.g. from URL, store, or browser context.
 * @returns {string} Supported locale or the default locale as fallback.
 */
export function resolveLocale(value) {
	if (!value) {
		return DEFAULT_LOCALE;
	}

	return SUPPORTED_LOCALES.has(value) ? value : DEFAULT_LOCALE;
}

/**
 * Returns the list of all supported locale codes.
 *
 * @returns {string[]}
 */
export function getSupportedLocales() {
	return [...SUPPORTED_LOCALES];
}
