import { DEFAULT_LOCALE } from '$lib/i18n/config';

const SUPPORTED_LOCALES = new Set(['de-DE', 'en-US', 'vi-VN']);

/**
 * Normalisiert eine Locale auf eine im Projekt unterstützte Sprache.
 *
 * Leere oder unbekannte Werte fallen auf die Standard-Locale zurück.
 *
 * @param {string|null|undefined} value - Angefragte Locale, z. B. aus URL, Store oder Browser-Kontext.
 * @returns {string} Unterstützte Locale oder die Standard-Locale als Fallback.
 */
export function resolveLocale(value) {
	if (!value) {
		return DEFAULT_LOCALE;
	}

	return SUPPORTED_LOCALES.has(value) ? value : DEFAULT_LOCALE;
}
