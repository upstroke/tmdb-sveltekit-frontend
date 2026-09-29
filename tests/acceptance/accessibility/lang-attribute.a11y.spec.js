// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Accessibility tests for the dynamic html[lang] attribute (WCAG 2.1 SC 3.1.1).
 *
 * Test plan: tests/acceptance/accessibility/lang-attribute-a11y-testplan.md
 *
 * Test cases:
 * - A11Y-LANG-001: Default locale (en-US) sets html[lang] on SSR
 * - A11Y-LANG-002: Language switch to de-DE updates html[lang]
 * - A11Y-LANG-003: Language switch back to en-US updates html[lang]
 * - A11Y-LANG-004: html[lang] is retained after client-side navigation
 * - A11Y-LANG-005: Direct URL call with locale=de-DE sets html[lang] on SSR
 */

test.describe('Accessibility - html[lang] attribute', () => {
	// -------------------------------------------------------------------------
	// A11Y-LANG-001: Default locale sets html[lang] on SSR
	// -------------------------------------------------------------------------
	test(
		'Default locale en-US: html[lang] is "en-US" on initial load',
		{
			tag: ['@accessibility', '@a11y', '@lang-attribute', '@ssr']
		},
		async ({ page }) => {
			await page.goto('/?locale=en-US');
			await page.waitForLoadState('networkidle');

			await expect(page.locator('html')).toHaveAttribute('lang', 'en-US');
		}
	);

	// -------------------------------------------------------------------------
	// A11Y-LANG-002: Language switch to de-DE updates html[lang]
	// -------------------------------------------------------------------------
	test(
		'After language switch to de-DE: html[lang] is "de-DE"',
		{
			tag: ['@accessibility', '@a11y', '@lang-attribute', '@language-switch']
		},
		async ({ page }) => {
			await page.goto('/?locale=en-US');
			await page.waitForLoadState('networkidle');

			// Switch language via the language switcher in the header
			const langSwitcher = page.getByRole('combobox', { name: /language|sprache/i });
			await langSwitcher.selectOption('de-DE');
			await page.waitForLoadState('networkidle');

			await expect(page.locator('html')).toHaveAttribute('lang', 'de-DE');
		}
	);

	// -------------------------------------------------------------------------
	// A11Y-LANG-003: Language switch back to en-US updates html[lang]
	// -------------------------------------------------------------------------
	test(
		'After switching back to en-US: html[lang] is "en-US"',
		{
			tag: ['@accessibility', '@a11y', '@lang-attribute', '@language-switch']
		},
		async ({ page }) => {
			await page.goto('/?locale=de-DE');
			await page.waitForLoadState('networkidle');

			// Verify we start with de-DE
			await expect(page.locator('html')).toHaveAttribute('lang', 'de-DE');

			// Switch back to en-US
			const langSwitcher = page.getByRole('combobox', { name: /language|sprache/i });
			await langSwitcher.selectOption('en-US');
			await page.waitForLoadState('networkidle');

			await expect(page.locator('html')).toHaveAttribute('lang', 'en-US');
		}
	);

	// -------------------------------------------------------------------------
	// A11Y-LANG-004: html[lang] is retained after client-side navigation
	// -------------------------------------------------------------------------
	test(
		'After language switch to de-DE: html[lang] is retained on navigation to /movies',
		{
			tag: ['@accessibility', '@a11y', '@lang-attribute', '@navigation']
		},
		async ({ page }) => {
			await page.goto('/?locale=en-US');
			await page.waitForLoadState('networkidle');

			// Switch to de-DE
			const langSwitcher = page.getByRole('combobox', { name: /language|sprache/i });
			await langSwitcher.selectOption('de-DE');
			await page.waitForLoadState('networkidle');

			// Navigate to movies page via header link
			const moviesLink = page.getByRole('link', { name: /filme|movies/i }).first();
			await moviesLink.click();
			await page.waitForLoadState('networkidle');

			await expect(page.locator('html')).toHaveAttribute('lang', 'de-DE');
		}
	);

	// -------------------------------------------------------------------------
	// A11Y-LANG-005: Direct URL with locale=de-DE sets html[lang] on SSR
	// -------------------------------------------------------------------------
	test(
		'Direct URL call with locale=de-DE: html[lang] is "de-DE" on SSR',
		{
			tag: ['@accessibility', '@a11y', '@lang-attribute', '@ssr']
		},
		async ({ page }) => {
			await page.goto('/movies?locale=de-DE');
			await page.waitForLoadState('networkidle');

			await expect(page.locator('html')).toHaveAttribute('lang', 'de-DE');
		}
	);
});
