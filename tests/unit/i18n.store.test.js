import { get } from 'svelte/store';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Mock implementation of the locale store for testing purposes.
 *
 * This mock simulates a Svelte store that holds the current locale value.
 * It supports subscription-based reactivity and manual value updates.
 *
 * @type {{
 *   store: {
 *     subscribe: (run: (value: string) => void) => () => void
 *   },
 *   set: (nextLocale: string) => void,
 *   reset: () => void
 * }}
 *
 * @property store - A Svelte-readable store containing the current locale
 * @property set - Updates the locale value and notifies all subscribers
 * @property reset - Resets the locale to 'de-DE' and clears all subscribers
 */
const localeStore = vi.hoisted(() => {
	const subscribers = new Set();
	let value = 'de-DE';

	return {
		store: {
			subscribe(run) {
				run(value);
				subscribers.add(run);

				return () => subscribers.delete(run);
			}
		},
		set(nextLocale) {
			value = nextLocale;
			for (const run of subscribers) {
				run(value);
			}
		},
		reset() {
			value = 'de-DE';
			subscribers.clear();
		}
	};
});

/**
 * Mock function for getLocaleText that simulates the i18n resolver.
 *
 * This mock returns a minimal text catalog object for any given locale.
 * It is used to verify that the i18n store correctly calls the resolver
 * with the current locale value.
 *
 * @type {import('vitest').Mock<(locale: string) => { locale: string, labels: Object }>}
 */
const getLocaleTextMock = vi.hoisted(() => vi.fn((locale) => ({ locale, labels: {} })));

vi.mock('$lib/stores/locale', () => ({
	locale: localeStore.store
}));

vi.mock('$lib/i18n/resolver', () => ({
	getLocaleText: getLocaleTextMock
}));

import { i18n } from '$lib/stores/i18n';

/**
 * Teststrategie: Anweisungs- und Zweigüberdeckung.
 * Der Test prüft, dass der abgeleitete Store die aktuelle Locale an den
 * Resolver weitergibt und sich bei Locale-Änderungen aktualisiert.
 */
describe('i18n store', () => {
	beforeEach(() => {
		localeStore.reset();
		getLocaleTextMock.mockClear();
		getLocaleTextMock.mockImplementation((locale) => ({ locale, labels: {} }));
	});

	// Statement coverage: the store returns texts for the current locale and reacts to changes.
	it('liefert für die aktuelle Locale die aufgelösten Texte und reagiert auf Änderungen', () => {
		expect(get(i18n)).toEqual({ locale: 'de-DE', labels: {} });
		expect(getLocaleTextMock).toHaveBeenCalledWith('de-DE');

		localeStore.set('en-US');

		expect(get(i18n)).toEqual({ locale: 'en-US', labels: {} });
		expect(getLocaleTextMock).toHaveBeenLastCalledWith('en-US');
	});
});
