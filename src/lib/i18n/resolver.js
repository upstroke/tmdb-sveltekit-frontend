import uiText from '$lib/i18n/ui.json';
import { DEFAULT_LOCALE } from '$lib/i18n/config';

/**
 * Returns the resolved UI text set for a locale.
 *
 * If no translations are available for the requested locale, the texts
 * of the default locale are returned.
 *
 * @param {string} [locale=DEFAULT_LOCALE] - Desired locale for UI texts.
 * @returns {{
 *   locale: string,
 *   labels: Record<string, string>,
 *   messages: Record<string, string>,
 *   titles: Record<string, string>,
 *   buttons: Record<string, string>,
 *   formats: Record<string, string>,
 *   fallbacks: Record<string, string>
 * }} Resolved texts for the user interface.
 */

export function getLocaleText(locale = DEFAULT_LOCALE) {
	const current = uiText.locales[locale] ?? uiText.locales[DEFAULT_LOCALE];

	return {
		locale,
		labels: current.labels,
		messages: current.messages,
		titles: current.titles,
		buttons: current.buttons,
		formats: current.formats,
		fallbacks: current.fallbacks
	};
}
