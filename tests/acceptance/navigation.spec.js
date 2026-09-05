// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Test Case: TC-NAV-001 — Desktop-Navigation funktioniert
 * Test Case: TC-NAV-002 — Mobile-Navigation funktioniert
 */

test.describe('Hauptnavigation', () => {
	// TC-NAV-001
	test('Desktop: Alle Hauptseiten sind erreichbar', async ({ page }) => {
		// Start auf Home
		await page.goto('/');
		await expect(page).toHaveTitle(/Home.*TMDB/);

		// Navigation zu Movies
		await page.locator('#movies a').click();
		await expect(page).toHaveURL('/movies');
		await expect(page).toHaveTitle(/Movies.*TMDB/);
		await expect(page.locator('#movies a')).toHaveAttribute('aria-current', 'page');

		// Navigation zu TV Shows
		await page.locator('#tvshows a').click();
		await expect(page).toHaveURL('/tv-shows');
		await expect(page).toHaveTitle(/TV.*TMDB/);
		await expect(page.locator('#tvshows a')).toHaveAttribute('aria-current', 'page');

		// Zurueck zu Home
		await page.locator('#home a').click();
		await expect(page).toHaveURL('/');
		await expect(page).toHaveTitle(/Home.*TMDB/);
		await expect(page.locator('#home a')).toHaveAttribute('aria-current', 'page');
	});

	// TC-NAV-002
	test('Mobile: Burger-Menue oeffnet und Navigation funktioniert', async ({ page }) => {
		// Mobile Viewport
		await page.setViewportSize({ width: 375, height: 667 });

		// Start auf Home
		await page.goto('/');

		// Burger klicken zum Oeffnen
		await page.locator('label.burger-icon').click();

		// Navigation zu Movies
		await page.locator('#movies a').click();
		await expect(page).toHaveURL('/movies');
		await expect(page).toHaveTitle(/Movies.*TMDB/);

		// Burger wieder oeffnen
		await page.locator('label.burger-icon').click();

		// Navigation zu TV Shows
		await page.locator('#tvshows a').click();
		await expect(page).toHaveURL('/tv-shows');
		await expect(page).toHaveTitle(/TV.*TMDB/);
	});
});
