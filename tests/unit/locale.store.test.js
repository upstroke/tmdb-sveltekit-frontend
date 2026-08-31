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
 * Teststrategie: Anweisungs- und Zweigüberdeckung (Statement & Branch Coverage).
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

	// Anweisungs- und Zweigüberdeckung: Gesetzte Werte werden im Store und im Session Storage gespeichert.
	it('speichert gesetzte Werte zusätzlich im Session Storage', async () => {
		const setItemSpy = vi.spyOn(window.sessionStorage.__proto__, 'setItem');
		const locale = await loadLocaleStore();

		locale.set('vi-VN');

		expect(get(locale)).toBe('vi-VN');
		expect(setItemSpy).toHaveBeenCalledWith('app-locale', 'vi-VN');
		expect(sessionStorage.getItem('app-locale')).toBe('vi-VN');
	});
});
