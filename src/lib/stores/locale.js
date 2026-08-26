import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import { DEFAULT_LOCALE } from '$lib/i18n/config';

const STORAGE_KEY = 'app-locale';

/**
 * Ermittelt die initiale Locale aus dem Session-Storage oder der Standard-Locale.
 *
 * Während des serverseitigen Renderings wird direkt die Standard-Locale verwendet.
 * Nicht verfügbare oder fehlerhafte Storage-Zugriffe fallen ebenfalls auf den
 * Standardwert zurück.
 *
 * @returns {string} Initiale Locale der Anwendung.
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
 * Erstellt einen Svelte-Store für die aktive Locale.
 *
 * Beim Setzen einer neuen Locale wird der Wert im Browser zusätzlich im
 * Session-Storage gespeichert.
 *
 * @returns {{ subscribe: import('svelte/store').Readable<string>['subscribe'], set: (locale: string) => void }} Locale-Store mit Subscribe- und Set-Funktion.
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
					console.warn(`The locale could not be saved: ${storageError}`);
				}
			}

			set(locale);
		}
	};
}

/**
 * Globaler Store für die aktuell ausgewählte Locale.
 *
 * @type {{ subscribe: Function, set: (locale: string) => void }}
 */
export const locale = createLocaleStore();
