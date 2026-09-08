import { test, expect } from '@playwright/test';

/**
 * Feature: F-NAV — Main Navigation
 * Test Case: TC-NAV-001 — Desktop navigation works
 * Test Case: TC-NAV-002 — Mobile navigation works
 * Test Case: TC-NAV-003 — Mobile menu closes on outside click
 */

test.describe('Main navigation', () => {
	// TC-NAV-001
	test('Desktop: All main pages are reachable', {
		tag: ['@navigation', '@desktop', '@black-box', '@regression']
	}, async ({ page }) => {
		// Start on Home (localized en-US)
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
	test('Mobile: Burger menu opens and navigation works', {
		tag: ['@navigation', '@mobile', '@black-box', '@regression']
	}, async ({ page }) => {
		// Mobile viewport
		await page.setViewportSize({ width: 370, height: 667 });

		// Start on Home (localized en-US)
		await page.goto('http://localhost:5173/?locale=en-US');
		await expect(page).toHaveTitle(/Home.*TMDB/);

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
	test('Mobile: Menu closes when clicking outside', {
		tag: ['@navigation', '@mobile', '@black-box', '@regression']
	}, async ({ page }) => {
		// Set the mobile viewport before loading the application
		await page.setViewportSize({ width: 370, height: 667 });

		// Start on Home with a deterministic locale
		await page.goto('http://localhost:5173/?locale=en-US');
		await expect(page).toHaveTitle(/Home.*TMDB/);

		const burgerButton = page.getByRole('button', {
			name: 'Open or close navigation'
		});

		const homeLink = page.getByRole('link', {
			name: 'Home'
		});

		// Verify the initial closed state
		await expect(burgerButton).toBeVisible();
		await expect(burgerButton).toHaveAttribute('aria-expanded', 'false');
		await expect(homeLink).toBeHidden();

		// Open the burger menu
		await burgerButton.click();
		await expect(burgerButton).toHaveAttribute('aria-expanded', 'true');
		await expect(homeLink).toBeVisible();

		// Click a guaranteed point outside the fixed header and navigation panel
		await page.mouse.click(340, 500);

		// Verify that the menu was closed by the window pointerdown handler
		await expect(burgerButton).toHaveAttribute('aria-expanded', 'false');
		await expect(homeLink).toBeHidden();
	});
});