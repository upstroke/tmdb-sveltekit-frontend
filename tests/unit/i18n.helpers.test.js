import { describe, expect, it } from 'vitest';
import uiText from '$lib/i18n/ui.json';
import { DEFAULT_LOCALE } from '$lib/i18n/config';
import { getSupportedLocales, resolveLocale } from '$lib/i18n/helpers';

/**
 * Teststrategie: Anweisungs- und Zweigüberdeckung (Statement & Branch Coverage).
 * Die Tests decken gültige, leere und ungültige Locale-Werte sowie die
 * Ermittlung aller unterstützten Sprachcodes ab.
 */
describe('i18n helpers', () => {
	describe('resolveLocale', () => {
		// Anweisungs- und Zweigüberdeckung: Unterstützte Locales bleiben unverändert.
		it('gibt eine unterstützte Locale unverändert zurück', () => {
			expect(resolveLocale('en-US')).toBe('en-US');
			expect(resolveLocale('fr-FR')).toBe('fr-FR');
		});

		// Anweisungs- und Zweigüberdeckung: Leere Werte fallen auf die Standard-Locale zurück.
		it('fällt bei leerem Wert auf die Standard-Locale zurück', () => {
			expect(resolveLocale()).toBe(DEFAULT_LOCALE);
			expect(resolveLocale(null)).toBe(DEFAULT_LOCALE);
			expect(resolveLocale('')).toBe(DEFAULT_LOCALE);
		});

		// Zweigüberdeckung: Unbekannte Locales fallen ebenfalls auf die Standard-Locale zurück.
		it('fällt bei unbekannten Locales auf die Standard-Locale zurück', () => {
			expect(resolveLocale('pt-BR')).toBe(DEFAULT_LOCALE);
		});
	});

	describe('getSupportedLocales', () => {
		// Anweisungsüberdeckung: Die unterstützten Sprachcodes werden aus dem UI-Katalog abgeleitet.
		it('liefert die unterstützten Sprachcodes aus dem UI-Katalog', () => {
			const expectedLocales = Object.values(uiText.locales)
				.map(({ languageCode }) => languageCode)
				.filter(Boolean);

			expect(getSupportedLocales()).toEqual(expectedLocales);
		});
	});
});
