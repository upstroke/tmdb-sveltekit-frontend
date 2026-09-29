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
 * Writes the locale to the session cookie so the server can read it
 * on subsequent requests (e.g. to set <html lang="...">).
 *
 * No expiry date is set intentionally: the cookie behaves as a session
 * cookie and is deleted when the browser session ends, matching the
 * lifetime of the sessionStorage entry.
 *
 * @param {string} locale - BCP 47 language tag to persist.
 */
function setCookieLocale(locale) {
	document.cookie = `${STORAGE_KEY}=${locale}; path=/; SameSite=Strict`;
}

/**
 * Creates a Svelte store for the active locale.
 *
 * When setting a new locale, the value is additionally stored in
 * session storage and in a session cookie in the browser.
 * The <html lang="..."> attribute is also updated immediately so that
 * screen readers and assistive technologies reflect the new language
 * without waiting for the next server-rendered response.
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

				try {
					setCookieLocale(locale);
				} catch (cookieError) {
					console.warn(`The locale cookie could not be set: ${cookieError}`);
				}

				// Update <html lang="..."> immediately so that screen readers and
				// assistive technologies reflect the new language without waiting
				// for the next server-rendered response.
				try {
					document.documentElement.lang = locale;
				} catch (domError) {
					console.warn(`The lang attribute could not be updated: ${domError}`);
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
