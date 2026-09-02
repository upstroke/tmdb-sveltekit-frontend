// tests/mocks/i18n.mocks.js
import uiJson from '$lib/i18n/ui.json';
import { DEFAULT_LOCALE } from '$lib/i18n/config';

// Labels aus der echten ui.json holen
const labels = uiJson.locales[DEFAULT_LOCALE].labels;

// Zentraler i18n-Mock für alle Tests
export const i18nMockDefault = {
	i18n: {
		subscribe(run) {
			run({ labels });
			return () => {};
		}
	}
};

// Helper für Test-Assertions
export function getI18nLabels() {
	return labels;
}
