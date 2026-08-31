import { get } from 'svelte/store';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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

const getLocaleTextMock = vi.hoisted(() => vi.fn((locale) => ({ locale, labels: {} })));

vi.mock('$lib/stores/locale', () => ({
	locale: localeStore.store
}));

vi.mock('$lib/i18n/resolver', () => ({
	getLocaleText: getLocaleTextMock
}));

import { i18n } from '$lib/stores/i18n';

/**
 * Teststrategie: Anweisungs- und Zweigüberdeckung (Statement & Branch Coverage).
 * Der Test prüft, dass der abgeleitete Store die aktuelle Locale an den
 * Resolver weitergibt und sich bei Locale-Änderungen aktualisiert.
 */
describe('i18n store', () => {
	beforeEach(() => {
		localeStore.reset();
		getLocaleTextMock.mockClear();
		getLocaleTextMock.mockImplementation((locale) => ({ locale, labels: {} }));
	});

	// Anweisungs- und Zweigüberdeckung: Der Store liefert Texte für die aktuelle Locale und reagiert auf Änderungen.
	it('liefert für die aktuelle Locale die aufgelösten Texte und reagiert auf Änderungen', () => {
		expect(get(i18n)).toEqual({ locale: 'de-DE', labels: {} });
		expect(getLocaleTextMock).toHaveBeenCalledWith('de-DE');

		localeStore.set('en-US');

		expect(get(i18n)).toEqual({ locale: 'en-US', labels: {} });
		expect(getLocaleTextMock).toHaveBeenLastCalledWith('en-US');
	});
});
