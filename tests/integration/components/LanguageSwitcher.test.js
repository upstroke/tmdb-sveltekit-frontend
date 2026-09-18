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

    vi.clearAllMocks();
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

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

  it('uses i18n label for aria-label', () => {
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
});