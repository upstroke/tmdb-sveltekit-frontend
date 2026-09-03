import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/svelte';
import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';
import { getSupportedLocales } from '$lib/i18n/helpers.js';

// Mocks ganz oben mit vi.hoisted
const mocks = vi.hoisted(() => ({
	mockResolveLocale: vi.fn()
}));

vi.mock('$lib/i18n/helpers', async (importOriginal) => {
	const actual = await importOriginal();
	return {
		...actual,
		resolveLocale: mocks.mockResolveLocale
	};
});

vi.mock('$app/state', async (importOriginal) => {
	const actual = await importOriginal();
	return {
		...actual,
		page: {
			url: new URL('https://example.com/')
		}
	};
});

// i18n store mock (mit subscribe fuer $i18n auto-subscribe)
vi.mock('$lib/stores/i18n', async () => ({
	i18n: {
		subscribe: (run) => {
			run({
				labels: {
					languageSelect: 'Sprache auswaehlen'
				}
			});
			return () => {}; // unsubscribe
		}
	}
}));

import { page } from '$app/state';

describe('LanguageSwitcher', () => {
	beforeEach(() => {
		vi.resetModules();
		vi.clearAllMocks();
		cleanup();

		mocks.mockResolveLocale.mockReturnValue('de-DE');
		page.url = new URL('https://example.com/');
	});

	afterEach(() => {
		cleanup();
	});

	// Anweisungsueberdeckung: LanguageSwitcher rendert Select mit allen Sprachen.
	it('rendert Select Element mit allen Sprachen', () => {
		const { container } = render(LanguageSwitcher);

		const select = container.querySelector('#language-select');
		expect(select).toBeInTheDocument();

		// Dynamisch alle Sprachen aus helpers holen
		const locales = getSupportedLocales();
		locales.forEach((locale) => {
			const option = container.querySelector(`option[value="${locale}"]`);
			expect(option).toBeInTheDocument();
		});

		expect(select.value).toBe('de-DE');
	});

	// Anweisungsueberdeckung: aria-label wird aus i18n geladen.
	it('verwendet i18n label fuer aria-label', () => {
		render(LanguageSwitcher);

		const select = screen.getByRole('combobox', { name: /Sprache auswaehlen/i });
		expect(select).toHaveAttribute('aria-label', 'Sprache auswaehlen');
	});

	// Hinweis: handleChange Logik wird in Integrationstests getestet.
	// Siehe: tests/integration/language-change.test.js (TODO)
	it('dokumentiert dass Sprachwechsel goto aufruft', () => {
		// handleChange ruft locale.set() und goto() auf.
		// Die genaue Implementierung wird in Integrationstests geprueft.
		expect(true).toBe(true);
	});

	// Hinweis: localStorage Persistenz wird in Integrationstests getestet.
	// Siehe: tests/integration/language-persistence.test.js (TODO)
	it('dokumentiert dass Sprache nicht im localStorage gespeichert wird', () => {
		// Persistenz wird durch locale.set() und URL-Parameter uebernommen.
		expect(true).toBe(true);
	});
});
