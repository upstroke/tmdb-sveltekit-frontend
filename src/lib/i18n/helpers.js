// @ts-check

import uiText from '$lib/i18n/ui.json';
import { DEFAULT_LOCALE } from '$lib/i18n/config';

/** @typedef {import('../types/i18n.js').LocaleFallbacks} LocaleFallbacks */
/** @typedef {import('../types/i18n.js').LocaleLabels} LocaleLabels */
/** @typedef {import('../types/i18n.js').LocaleMessages} LocaleMessages */
/** @typedef {import('../types/i18n.js').LocaleFormats} LocaleFormats */
/** @typedef {import('../types/i18n.js').LocaleTitles} LocaleTitles */
/** @typedef {import('../types/i18n.js').LocaleButtons} LocaleButtons */
/** @typedef {import('../types/i18n.js').LocaleData} LocaleData */
/** @typedef {import('../types/i18n.js').LocaleCatalog} LocaleCatalog */

const SUPPORTED_LOCALES = new Set(
	Object.values(uiText.locales)
		.map(({ languageCode }) => languageCode)
		.filter(Boolean)
);

/**
 * Collects all leaf-level keys of an object as dot-notation paths.
 *
 * @param {LocaleCatalog} obj
 * @param {string} [prefix]
 * @returns {string[]}
 */
function collectKeys(obj, prefix = '') {
	return Object.entries(obj).flatMap(([key, value]) => {
		const path = prefix ? `${prefix}.${key}` : key;
		return value !== null && typeof value === 'object' ? collectKeys(value, path) : [path];
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

		const localeKeys = new Set(collectKeys(localeData));

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
