import { labels } from '$lib/i18n/ui.json';
import { locales } from '$lib/i18n/ui.json';

/**
 * Fixture: i18n-Daten aus ui.json
 *
 * Verwendet in:
 * - tests/mocks/i18n.mocks.js
 */
export const i18nData = {
	labels,
	locales
};

/**
 * Hilfsfunktion: Labels direkt verwenden
 */
export const getLabels = () => labels;

/**
 * Hilfsfunktion: Locales direkt verwenden
 */
export const getLocales = () => locales;
