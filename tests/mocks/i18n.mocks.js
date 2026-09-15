import { DEFAULT_LOCALE } from '$lib/i18n/config.js';
import { getTestLocaleText } from '$tests/setup/test-utils.js';

const localeData = getTestLocaleText(DEFAULT_LOCALE);

// Central mock data for i18n
export const i18nMockDefault = {
	i18n: {
		subscribe(run) {
			run(localeData);
			return () => {};
		}
	}
};

// Helper for test assertions
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
