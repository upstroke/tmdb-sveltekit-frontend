import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import { DEFAULT_LOCALE } from '$lib/i18n/config';

const STORAGE_KEY = 'app-locale';

/**
 * Ermittelt die anfängliche Locale aus dem Session Storage oder dem Fallback.
 *
 * Außerhalb des Browsers und bei Storage-Fehlern wird die Standard-Locale
 * zurückgegeben.
 *
 * @returns {string} Initiale Locale für den Store.
 */
function getInitialLocale() {
	if (!browser) {
		return DEFAULT_LOCALE;
	}

	try {
		return sessionStorage.getItem(STORAGE_KEY) ?? DEFAULT_LOCALE;
	} catch {
		return DEFAULT_LOCALE;
	}
}

/**
 * Erstellt einen beschreibbaren Locale-Store mit Session-Storage-Persistenz.
 *
 * Beim Setzen eines neuen Werts wird die Locale nach Möglichkeit zusätzlich im
 * Session Storage abgelegt.
 *
 * @returns {{
 *   subscribe: import('svelte/store').Writable<string>['subscribe'],
 *   set: (locale: string) => void
 * }} Store-API für die aktive Locale.
 */
function createLocaleStore() {
	const { subscribe, set } = writable(getInitialLocale());

	return {
		subscribe,
		set(locale) {
			if (browser) {
				try {
					sessionStorage.setItem(STORAGE_KEY, locale);
				} catch (storageError) {
					console.warn(`Locale konnte nicht gespeichert werden: ${storageError}`);
				}
			}

			set(locale);
		}
	};
}

export const locale = createLocaleStore();
