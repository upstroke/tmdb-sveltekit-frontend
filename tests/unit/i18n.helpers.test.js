import { describe, expect, it } from 'vitest';
import uiText from '$lib/i18n/ui.json';
import { DEFAULT_LOCALE } from '$lib/i18n/config';
import { getSupportedLocales, resolveLocale } from '$lib/i18n/helpers';

/**
 * Test strategy: statement and branch coverage.
 * The tests cover valid, empty, and invalid locale values as well as
 * the retrieval of all supported language codes.
 */
describe('i18n helpers', () => {
	describe('resolveLocale', () => {
		// Statement and branch coverage: supported locales remain unchanged.
		it('returns a supported locale unchanged', () => {
			expect(resolveLocale('en-US')).toBe('en-US');
			expect(resolveLocale('fr-FR')).toBe('fr-FR');
		});

		// Statement and branch coverage: empty values fall back to the default locale.
		it('falls back to the default locale for an empty value', () => {
			expect(resolveLocale()).toBe(DEFAULT_LOCALE);
			expect(resolveLocale(null)).toBe(DEFAULT_LOCALE);
			expect(resolveLocale('')).toBe(DEFAULT_LOCALE);
		});

		// Branch coverage: unknown locales also fall back to the default locale.
		it('falls back to the default locale for unknown locales', () => {
			expect(resolveLocale('pt-BR')).toBe(DEFAULT_LOCALE);
		});
	});

	describe('getSupportedLocales', () => {
		// Statement coverage: supported language codes are derived from the UI catalog.
		it('returns the supported language codes from the UI catalog', () => {
			const expectedLocales = Object.values(uiText.locales)
				.map(({ languageCode }) => languageCode)
				.filter(Boolean);

			expect(getSupportedLocales()).toEqual(expectedLocales);
		});
	});
});
