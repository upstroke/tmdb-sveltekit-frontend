import { beforeEach, describe, expect, it, vi } from 'vitest';
import { get } from 'svelte/store';
import { DEFAULT_LOCALE } from '$lib/i18n/config';

const browserState = vi.hoisted(() => ({ value: true }));

vi.mock('$app/environment', () => ({
	get browser() {
		return browserState.value;
	}
}));

/**
 * Lädt den Locale-Store neu, damit Änderungen an Browser-Status und Storage
 * pro Testfall sauber ausgewertet werden.
 *
 * @returns {Promise<import('$lib/stores/locale').locale>} Aktueller Locale-Store.
 */
async function loadLocaleStore() {
	vi.resetModules();
	const module = await import('$lib/stores/locale');

	return module.locale;
}

/**
 * Teststrategie: Anweisungs- und Zweigüberdeckung.
 * Die Tests decken SSR-Fallback, Session-Storage-Auslesen, Fallback bei
 * fehlendem Storage-Wert sowie das Speichern neuer Werte ab.
 */
describe('locale store', () => {
	beforeEach(() => {
		browserState.value = true;
		sessionStorage.clear();
		vi.restoreAllMocks();
	});

	// Anweisungsüberdeckung: Beim SSR bleibt die Standard-Locale aktiv.
	it('verwendet beim serverseitigen Rendern die Standard-Locale', async () => {
		browserState.value = false;
		const locale = await loadLocaleStore();

		expect(get(locale)).toBe(DEFAULT_LOCALE);
	});

	// Anweisungs- und Zweigüberdeckung: Die initiale Locale wird aus dem Session Storage gelesen.
	it('liest die initiale Locale aus dem Session Storage', async () => {
		sessionStorage.setItem('app-locale', 'en-US');
		const locale = await loadLocaleStore();

		expect(get(locale)).toBe('en-US');
	});

	// Zweigüberdeckung: Ohne gespeicherten Wert wird die Standard-Locale verwendet.
	it('fällt ohne gespeicherten Wert auf die Standard-Locale zurück', async () => {
		const locale = await loadLocaleStore();

		expect(get(locale)).toBe(DEFAULT_LOCALE);
	});

	// Zweigüberdeckung: Fehler beim Lesen aus dem Session Storage führen zum Fallback auf die Standard-Locale.
	it('fällt bei einem Session-Storage-Lesefehler auf die Standard-Locale zurück', async () => {
		const getItemSpy = vi
			.spyOn(window.sessionStorage.__proto__, 'getItem')
			.mockImplementation(() => {
				throw new Error('storage unavailable');
			});

		const locale = await loadLocaleStore();

		expect(get(locale)).toBe(DEFAULT_LOCALE);
		expect(getItemSpy).toHaveBeenCalledWith('app-locale');
	});

	// Zweigüberdeckung: Fehler beim Speichern werden protokolliert und blockieren die Aktualisierung des Stores nicht.
	it('aktualisiert den Store auch dann, wenn das Speichern im Session Storage fehlschlägt', async () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const setItemSpy = vi
			.spyOn(window.sessionStorage.__proto__, 'setItem')
			.mockImplementation(() => {
				throw new Error('quota exceeded');
			});
		const locale = await loadLocaleStore();

		locale.set('fr-FR');

		expect(get(locale)).toBe('fr-FR');
		expect(setItemSpy).toHaveBeenCalledWith('app-locale', 'fr-FR');
		expect(warnSpy).toHaveBeenCalledOnce();
		expect(warnSpy.mock.calls[0][0]).toContain('The locale could not be saved: Error: quota exceeded');
	});
});
