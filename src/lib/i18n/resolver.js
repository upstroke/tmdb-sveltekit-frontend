import uiText from '$lib/i18n/ui.json';
import { DEFAULT_LOCALE } from '$lib/i18n/config';

/**
 * Liefert den aufgelösten UI-Textsatz für eine Locale.
 *
 * Falls für die angefragte Locale keine Übersetzungen vorhanden sind, werden
 * die Texte der Standard-Locale zurückgegeben.
 *
 * @param {string} [locale=DEFAULT_LOCALE] - Gewünschte Locale für UI-Texte.
 * @returns {{
 *   locale: string,
 *   labels: Record<string, string>,
 *   messages: Record<string, string>,
 *   titles: Record<string, string>,
 *   buttons: Record<string, string>,
 *   formats: Record<string, string>,
 *   fallbacks: Record<string, string>
 * }} Aufgelöste Texte für die Oberfläche.
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
