import { describe, expect, it } from 'vitest';
import uiText from '$lib/i18n/ui.json';

/**
 * Teststrategie: Konsistenzprüfung der Übersetzungskataloge.
 * Der Test stellt sicher, dass alle Locales dieselben UI-Sektionen und
 * Schlüsselmengen wie die Standard-Locale bereitstellen.
 */
describe('i18n translations', () => {
	// Anweisungsüberdeckung: Testfall für den folgenden it-Block.
	it('enthält in allen Locales dieselben UI-Bereiche und Übersetzungsschlüssel', () => {
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
