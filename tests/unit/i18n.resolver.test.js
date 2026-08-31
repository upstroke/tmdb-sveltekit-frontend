import { describe, expect, it } from 'vitest';
import uiText from '$lib/i18n/ui.json';
import { DEFAULT_LOCALE } from '$lib/i18n/config';
import { getLocaleText } from '$lib/i18n/resolver';

/**
 * Teststrategie: Anweisungs- und Zweigüberdeckung (Statement & Branch Coverage).
 * Die Tests decken die Standard-Locale, eine unterstützte Fremd-Locale und
 * den Fallback auf die Standardtexte bei unbekannten Locales ab.
 */
describe('i18n resolver', () => {
	// Anweisungs- und Zweigüberdeckung: Ohne Eingabe wird die Standard-Locale aufgelöst.
	it('liefert ohne Eingabe die Texte der Standard-Locale', () => {
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

	// Anweisungs- und Zweigüberdeckung: Unterstützte Locales liefern ihre eigenen Texte.
	it('liefert die Texte für eine unterstützte Locale', () => {
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

	// Zweigüberdeckung: Unbekannte Locales fallen auf Standardtexte zurück, die angefragte Locale bleibt erhalten.
	it('fällt bei unbekannter Locale auf die Standardtexte zurück und behält die angefragte Locale bei', () => {
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
