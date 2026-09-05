import { describe, expect, it } from 'vitest';
import uiText from '$lib/i18n/ui.json';
import { DEFAULT_LOCALE } from '$lib/i18n/config';
import { getLocaleText } from '$lib/i18n/resolver';

/**
 * Test strategy: statement and branch coverage.
 * The tests cover the default locale, a supported foreign locale, and
 * the fallback to default texts for unknown locales.
 */
describe('i18n resolver', () => {
	// Statement and branch coverage: without input, the default locale is resolved.
	it('returns the texts of the default locale when no input is provided', () => {
		expect(getLocaleText()).toEqual({
			locale: DEFAULT_LOCALE,
			labels: uiText.locales[DEFAULT_LOCALE].labels,
			messages: uiText.locales[DEFAULT_LOCALE].messages,
			titles: uiText.locales[DEFAULT_LOCALE].titles,
			buttons: uiText.locales[DEFAULT_LOCALE].buttons,
			formats: uiText.locales[DEFAULT_LOCALE].formats,
			fallbacks: uiText.locales[DEFAULT_LOCALE].fallbacks
		});
	});

	// Statement and branch coverage: supported locales return their own texts.
	it('returns the texts for a supported locale', () => {
		expect(getLocaleText('en-US')).toEqual({
			locale: 'en-US',
			labels: uiText.locales['en-US'].labels,
			messages: uiText.locales['en-US'].messages,
			titles: uiText.locales['en-US'].titles,
			buttons: uiText.locales['en-US'].buttons,
			formats: uiText.locales['en-US'].formats,
			fallbacks: uiText.locales['en-US'].fallbacks
		});
	});

	// Branch coverage: unknown locales fall back to default texts while keeping the requested locale.
	it('falls back to default texts for an unknown locale and retains the requested locale', () => {
		expect(getLocaleText('pt-BR')).toEqual({
			locale: 'pt-BR',
			labels: uiText.locales[DEFAULT_LOCALE].labels,
			messages: uiText.locales[DEFAULT_LOCALE].messages,
			titles: uiText.locales[DEFAULT_LOCALE].titles,
			buttons: uiText.locales[DEFAULT_LOCALE].buttons,
			formats: uiText.locales[DEFAULT_LOCALE].formats,
			fallbacks: uiText.locales[DEFAULT_LOCALE].fallbacks
		});
	});
});
