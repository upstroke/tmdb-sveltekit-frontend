import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import { DEFAULT_LOCALE } from '$lib/i18n/config';

const STORAGE_KEY = 'app-locale';

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
