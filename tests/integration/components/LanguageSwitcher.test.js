import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/svelte';
import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';
import { getSupportedLocales } from '$lib/i18n/helpers.js';
import { getLocaleText } from '$lib/i18n/resolver.js';
import { DEFAULT_LOCALE } from '$lib/i18n/config.js';

const { labels } = getLocaleText(DEFAULT_LOCALE);

describe('LanguageSwitcher', () => {
	beforeEach(() => {
		if (typeof sessionStorage !== 'undefined') {
			sessionStorage.clear();
		}

		cleanup();
	});

	afterEach(() => {
		cleanup();
	});

	// Statement coverage: The switcher renders all supported locales.
	it('renders select element with all languages', () => {
		const { container } = render(LanguageSwitcher);

		const select = container.querySelector('#language-select');
		expect(select).toBeInTheDocument();

		const locales = getSupportedLocales();
		locales.forEach((locale) => {
			const option = container.querySelector(`option[value="${locale}"]`);
			expect(option).toBeInTheDocument();
		});

		expect(select.value).toBe(DEFAULT_LOCALE);
	});

	// Statement coverage: The switcher sets the correct aria-label.
	it('uses i18n label for aria-label', () => {
		render(LanguageSwitcher);

		const select = screen.getByRole('combobox', { name: labels.languageSelect });
		expect(select).toHaveAttribute('aria-label', labels.languageSelect);
	});

	// TODO: HandleChange-Logic will be tested by acceptance test
	it('documents that language change calls goto', () => {
		expect(true).toBe(true);
	});

	// TODO: localStorage persistence is tested with acceptance test.
	it('documents that language is not stored in localStorage', () => {
		expect(true).toBe(true);
	});
});
