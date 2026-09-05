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
 * Reloads the locale store so that changes to browser state and storage
 * are cleanly evaluated per test case.
 *
 * @returns {Promise<import('$lib/stores/locale').locale>} Current locale store.
 */
async function loadLocaleStore() {
	vi.resetModules();
	const module = await import('$lib/stores/locale');

	return module.locale;
}

/**
 * Test strategy: statement and branch coverage.
 * The tests cover SSR fallback, session storage reading, fallback for
 * missing storage values, and saving new values.
 */
describe('locale store', () => {
	beforeEach(() => {
		browserState.value = true;
		sessionStorage.clear();
		vi.restoreAllMocks();
	});

	// Statement coverage: the default locale is used during server-side rendering.
	it('uses the default locale during server-side rendering', async () => {
		browserState.value = false;
		const locale = await loadLocaleStore();

		expect(get(locale)).toBe(DEFAULT_LOCALE);
	});

	// Statement and branch coverage: the initial locale is read from session storage.
	it('reads the initial locale from session storage', async () => {
		sessionStorage.setItem('app-locale', 'en-US');
		const locale = await loadLocaleStore();

		expect(get(locale)).toBe('en-US');
	});

	// Branch coverage: the default locale is used when no stored value exists.
	it('falls back to the default locale when no stored value exists', async () => {
		const locale = await loadLocaleStore();

		expect(get(locale)).toBe(DEFAULT_LOCALE);
	});

	// Branch coverage: session storage read errors fall back to the default locale.
	it('falls back to the default locale on a session storage read error', async () => {
		const getItemSpy = vi
			.spyOn(window.sessionStorage.__proto__, 'getItem')
			.mockImplementation(() => {
				throw new Error('storage unavailable');
			});

		const locale = await loadLocaleStore();

		expect(get(locale)).toBe(DEFAULT_LOCALE);
		expect(getItemSpy).toHaveBeenCalledWith('app-locale');
	});

	// Branch coverage: storage errors are logged and do not block store updates.
	it('updates the store even when saving to session storage fails', async () => {
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
		expect(warnSpy.mock.calls[0][0]).toContain(
			'The locale could not be saved: Error: quota exceeded'
		);
	});
});
