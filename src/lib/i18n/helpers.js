import { DEFAULT_LOCALE } from '$lib/i18n/config';

const SUPPORTED_LOCALES = new Set(['de-DE', 'en-US', 'vi-VN']);

export function resolveLocale(value) {
	if (!value) {
		return DEFAULT_LOCALE;
	}

	return SUPPORTED_LOCALES.has(value) ? value : DEFAULT_LOCALE;
}
