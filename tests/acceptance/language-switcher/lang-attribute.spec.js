import { test, expect } from '@playwright/test';

/**
 * Feature: F-LS — Dynamic HTML lang Attribute
 * Test Case: TC-LS-001 — Default locale sets correct lang attribute
 * Test Case: TC-LS-002 — Switching language updates lang attribute
 * Test Case: TC-LS-003 — lang attribute is present on a non-home route
 */

test.describe('Dynamic HTML lang attribute', () => {
	test.beforeEach(async ({ page }) => {
		await page.setViewportSize({ width: 1920, height: 1080 });
	});

	// -------------------------------------------------------------------------
	// TC-LS-001
	// -------------------------------------------------------------------------
	test(
		'[TC-LS-001] Default locale sets correct lang attribute',
		{
			tag: ['@lang', '@language-switcher', '@a11y', '@e2e', '@black-box', '@regression']
		},
		async ({ page }) => {
			await page.goto('/?locale=en-US');
			await expect(page).toHaveTitle(/Home.*TMDB/);

			const lang = await page.locator('html').getAttribute('lang');
			expect(lang).toBeTruthy();
			expect(lang?.startsWith('en')).toBe(true);
		}
	);

	// -------------------------------------------------------------------------
	// TC-LS-002
	// -------------------------------------------------------------------------
	test(
		'[TC-LS-002] Switching to German updates the lang attribute',
		{
			tag: ['@lang', '@language-switcher', '@a11y', '@e2e', '@black-box', '@regression']
		},
		async ({ page }) => {
			await page.goto('/?locale=en-US');
			await expect(page).toHaveTitle(/Home.*TMDB/);

			const langBefore = await page.locator('html').getAttribute('lang');
			expect(langBefore?.startsWith('en')).toBe(true);

			// Switch to German via the language-switcher in the global header.
			await page.getByRole('button', { name: /Deutsch|DE|German/i }).click();
			await page.waitForURL('**/?locale=de*', { timeout: 5000 });

			const langAfter = await page.locator('html').getAttribute('lang');
			expect(langAfter).toBeTruthy();
			expect(langAfter?.startsWith('de')).toBe(true);
		}
	);

	// -------------------------------------------------------------------------
	// TC-LS-003
	// -------------------------------------------------------------------------
	test(
		'[TC-LS-003] lang attribute is present on a non-home route',
		{
			tag: ['@lang', '@language-switcher', '@a11y', '@e2e', '@black-box', '@regression']
		},
		async ({ page }) => {
			await page.goto('/movies?locale=en-US');
			await expect(page).toHaveTitle(/Movies.*TMDB/);

			const lang = await page.locator('html').getAttribute('lang');
			expect(lang).toBeTruthy();
		}
	);
});
