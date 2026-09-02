import { getLocaleText } from '$lib/i18n/resolver.js';
import { DEFAULT_LOCALE } from '$lib/i18n/config';

// Hole die echten i18n-Daten aus der ui.json
const localeData = getLocaleText(DEFAULT_LOCALE);

// Zentrale Mock-Daten für i18n
export const i18nMockDefault = {
	i18n: {
		subscribe(run) {
			run(localeData);
			return () => {};
		}
	}
};

// Helper für Test-Assertions
export function getI18nLabels() {
	return {
		...localeData.labels,
		...localeData.messages,
		...localeData.titles,
		...localeData.buttons,
		...localeData.formats,
		...localeData.fallbacks
	};
}
