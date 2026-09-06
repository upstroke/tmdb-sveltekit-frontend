import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import { DEFAULT_LOCALE } from '$lib/i18n/config';

const STORAGE_KEY = 'app-locale';

/**
 * Determines the initial locale from session storage or the default locale.
 *
 * During server-side rendering, the default locale is used directly.
 * Unavailable or erroneous storage accesses also fall back to the
 * default value.
 *
 * @returns {string} Initial locale of the application.
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
 * Creates a Svelte store for the active locale.
 *
 * When setting a new locale, the value is additionally stored in
 * session storage in the browser.
 *
 * @returns {{ subscribe: import('svelte/store').Readable<string>['subscribe'], set: (locale: string) => void }} Locale store with subscribe and set functions.
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
 * Global store for the currently selected locale.
 *
 * @type {{ subscribe: Function, set: (locale: string) => void }}
 */
export const locale = createLocaleStore();
