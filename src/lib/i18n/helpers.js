import uiText from '$lib/i18n/ui.json';
import { DEFAULT_LOCALE } from '$lib/i18n/config';

const SUPPORTED_LOCALES = new Set(
	Object.values(uiText.locales)
		.map(({ languageCode }) => languageCode)
		.filter(Boolean)
);

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

export function getSupportedLocales() {
	return [...SUPPORTED_LOCALES];
}
