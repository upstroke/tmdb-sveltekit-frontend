import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';
import { getSupportedLocales } from '$lib/i18n/helpers.js';
import { getTestLocaleText } from '$tests/setup/test-utils.js';
import { DEFAULT_LOCALE } from '$lib/i18n/config.js';

vi.mock('$app/navigation', () => ({
  goto: vi.fn().mockResolvedValue(undefined)
}));

import { goto } from '$app/navigation';

const { labels } = getTestLocaleText(DEFAULT_LOCALE);

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }

    document.documentElement.lang = DEFAULT_LOCALE;
    vi.clearAllMocks();
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders a select element with id "language-select"', () => {
    const { container } = render(LanguageSwitcher);

    const select = container.querySelector('#language-select');
    expect(select).toBeInTheDocument();
    expect(select.tagName).toBe('SELECT');
  });

  it('renders an sr-only label associated with the select', () => {
    render(LanguageSwitcher);

    const label = document.querySelector('label[for="language-select"]');
    expect(label).toBeInTheDocument();
  });

  it('renders all supported locales as options with BCP 47 values', () => {
    const { container } = render(LanguageSwitcher);

    const locales = getSupportedLocales();
    locales.forEach((locale) => {
      const option = container.querySelector(`option[value="${locale}"]`);
      expect(option).toBeInTheDocument();
    });
  });

  it('pre-selects the default locale on initial render', () => {
    const { container } = render(LanguageSwitcher);

    const select = container.querySelector('#language-select');
    expect(select.value).toBe(DEFAULT_LOCALE);
  });

  it('uses the i18n label as aria-label on the select', () => {
    render(LanguageSwitcher);

    const select = screen.getByRole('combobox', { name: labels.languageSelect });
    expect(select).toHaveAttribute('aria-label', labels.languageSelect);
  });

  it('updates locale and navigates to the current relative route', async () => {
    const user = userEvent.setup();
    render(LanguageSwitcher);

    const select = screen.getByRole('combobox', { name: labels.languageSelect });
    const targetLocale = Array.from(select.options).find(
      (option) => option.value !== select.value
    )?.value;

    expect(targetLocale).toBeDefined();

    await user.selectOptions(select, targetLocale);

    expect(select).toHaveValue(targetLocale);
    expect(goto).toHaveBeenCalledTimes(1);

    const [target, navigationOptions] = goto.mock.calls[0];
    const url = new URL(target, 'http://test.local');

    expect(url.pathname).toBe('/');
    expect(url.searchParams.get('locale')).toBe(targetLocale);
    expect(navigationOptions).toEqual({
      invalidateAll: true,
      replaceState: true,
      keepFocus: true,
      noScroll: true
    });
  });

  it('updates document.documentElement.lang immediately when locale changes', async () => {
    const user = userEvent.setup();
    render(LanguageSwitcher);

    const select = screen.getByRole('combobox', { name: labels.languageSelect });
    const targetLocale = Array.from(select.options).find(
      (option) => option.value !== select.value
    )?.value;

    expect(targetLocale).toBeDefined();
    expect(document.documentElement.lang).toBe(DEFAULT_LOCALE);

    await user.selectOptions(select, targetLocale);

    expect(document.documentElement.lang).toBe(targetLocale);
  });
});
