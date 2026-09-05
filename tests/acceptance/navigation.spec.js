// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Test Case: TC-NAV-001 — Desktop navigation works
 * Test Case: TC-NAV-002 — Mobile navigation works
 */

test.describe('Main navigation', () => {
	// TC-NAV-001
	test('Desktop: All main pages are reachable', async ({ page }) => {
		// Start on Home
		await page.goto('/');
		await expect(page).toHaveTitle(/Home.*TMDB/);

		// Navigate to Movies
		await page.locator('#movies a').click();
		await expect(page).toHaveURL('/movies');
		await expect(page).toHaveTitle(/Movies.*TMDB/);
		await expect(page.locator('#movies a')).toHaveAttribute('aria-current', 'page');

		// Navigate to TV Shows
		await page.locator('#tvshows a').click();
		await expect(page).toHaveURL('/tv-shows');
		await expect(page).toHaveTitle(/TV.*TMDB/);
		await expect(page.locator('#tvshows a')).toHaveAttribute('aria-current', 'page');

		// Back to Home
		await page.locator('#home a').click();
		await expect(page).toHaveURL('/');
		await expect(page).toHaveTitle(/Home.*TMDB/);
		await expect(page.locator('#home a')).toHaveAttribute('aria-current', 'page');
	});

	// TC-NAV-002
	test('Mobile: Burger menu opens and navigation works', async ({ page }) => {
		// Mobile viewport
		await page.setViewportSize({ width: 375, height: 667 });

		// Start on Home
		await page.goto('/');

		// Click burger to open
		await page.locator('label.burger-icon').click();

		// Navigate to Movies
		await page.locator('#movies a').click();
		await expect(page).toHaveURL('/movies');
		await expect(page).toHaveTitle(/Movies.*TMDB/);

		// Open burger again
		await page.locator('label.burger-icon').click();

		// Navigate to TV Shows
		await page.locator('#tvshows a').click();
		await expect(page).toHaveURL('/tv-shows');
		await expect(page).toHaveTitle(/TV.*TMDB/);
	});
});
