import { test, expect } from '@playwright/test';

/**
 * Test Case: TC-NAV-001 — Desktop navigation works
 * Test Case: TC-NAV-002 — Mobile navigation works
 * Test Case: TC-NAV-003 — Mobile menu closes on outside click
 */

test.describe('Main navigation', () => {
	// TC-NAV-001
	test('Desktop: All main pages are reachable', async ({ page }) => {
		// Start on Home
		await page.goto('http://localhost:5173/?locale=en-US');
		await expect(page).toHaveTitle(/Home.*TMDB/);

		// Navigate to Movies
		await page.locator('#movies a').click();
		await expect(page).toHaveTitle(/Movies.*TMDB/);
		await expect(page.locator('#movies a')).toHaveAttribute('aria-current', 'page');

		// Navigate to TV Shows
		await page.locator('#tvshows a').click();
		await expect(page).toHaveTitle(/TV.*TMDB/);
		await expect(page.locator('#tvshows a')).toHaveAttribute('aria-current', 'page');

		// Navigate back to Home
		await page.locator('#home a').click();
		await expect(page).toHaveTitle(/Home.*TMDB/);
		await expect(page.locator('#home a')).toHaveAttribute('aria-current', 'page');
	});

	// TC-NAV-002
	test('Mobile: Burger menu opens and navigation works', async ({ page }) => {
		// Mobile viewport
		await page.setViewportSize({ width: 370, height: 667 });

		// Start on Home
		await page.goto('http://localhost:5173/?locale=en-US');

		// Click burger menu button
		await page.getByRole('button', { name: 'Open or close navigation' }).click();

		// Navigate to TV Shows
		await page.getByRole('link', { name: 'TV shows' }).click();
		await expect(page).toHaveTitle(/TV.*TMDB/);

		// Click burger menu button
		await page.getByRole('button', { name: 'Open or close navigation' }).click();

		// Navigate to Home
		await page.getByRole('link', { name: 'Home' }).click();
		await expect(page).toHaveTitle(/Home.*TMDB/);
	});

	// TC-NAV-003
	test('Mobile: Menu closes when clicking outside', async ({ page }) => {
		// Mobile viewport
		await page.setViewportSize({ width: 370, height: 667 });

		// Start on Home
		await page.goto('http://localhost:5173/?locale=en-US');

		// Click burger menu button
		await page.getByRole('button', { name: 'Open or close navigation' }).click();

		// if mobile link Home is visible, burger menü navigation is visible
		await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();

		// click outside closes burger menu
		await page.locator('#root').click();

		// if link Home is not visible - burger menu is closed
		await expect(page.getByRole('link', { name: 'Home' })).toBeHidden();
	});
});
