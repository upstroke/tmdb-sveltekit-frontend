import { describe, expect, it } from 'vitest';
import { DEFAULT_LOCALE } from '$lib/i18n/config';
import { getSupportedLocales, resolveLocale } from '$lib/i18n/helpers';

/**
 * Teststrategie: Anweisungsüberdeckung (Statement Coverage).
 * Die Tests decken gültige, leere und ungültige Locale-Werte sowie die
 * Ermittlung aller unterstützten Sprachcodes ab.
 */
describe('i18n helpers', () => {
	describe('resolveLocale', () => {
		it('gibt eine unterstützte Locale unverändert zurück', () => {
			expect(resolveLocale('en-US')).toBe('en-US');
			expect(resolveLocale('fr-FR')).toBe('fr-FR');
		});

		it('fällt bei leerem Wert auf die Standard-Locale zurück', () => {
			expect(resolveLocale()).toBe(DEFAULT_LOCALE);
			expect(resolveLocale(null)).toBe(DEFAULT_LOCALE);
			expect(resolveLocale('')).toBe(DEFAULT_LOCALE);
		});

		it('fällt bei unbekannten Locales auf die Standard-Locale zurück', () => {
			expect(resolveLocale('pt-BR')).toBe(DEFAULT_LOCALE);
		});
	});

	describe('getSupportedLocales', () => {
		it('liefert die unterstützten Sprachcodes aus dem UI-Katalog', () => {
			expect(getSupportedLocales()).toEqual(['de-DE', 'en-US', 'es-ES', 'fr-FR', 'vi-VN']);
		});
	});
});
