import { describe, expect, it } from 'vitest';
import uiText from '$lib/i18n/ui.json';

/**
 * Test strategy: consistency check of translation catalogs.
 * The test ensures that all locales provide the same UI sections and
 * key sets as the default locale.
 */
describe('i18n translations', () => {
	// Statement coverage: test case for the following it block.
	it('contains the same UI sections and translation keys in all locales', () => {
		const locales = Object.entries(uiText.locales);
		const [, defaultCatalog] = locales[0];
		const sections = ['fallbacks', 'labels', 'messages', 'formats', 'titles', 'buttons'];

		for (const [locale, catalog] of locales) {
			expect(catalog.languageCode).toBe(locale);
			expect(typeof catalog.languageShortCode).toBe('string');
			expect(catalog.languageShortCode.length).toBeGreaterThan(0);

			for (const section of sections) {
				expect(Object.keys(catalog[section]).sort()).toEqual(
					Object.keys(defaultCatalog[section]).sort()
				);
			}
		}
	});
});
