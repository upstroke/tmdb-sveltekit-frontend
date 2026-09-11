import { test, expect } from '@playwright/test';

/**
 * Feature: F-BURGER — Burger Menu
 * Test Case: TC-BURGER-001 — Burger menu opens and closes correctly
 * Test Case: TC-BURGER-002 — Burger menu navigation links work
 * Test Case: TC-BURGER-003 — Burger menu closes when clicking outside
 */

test.describe('Burger menu', () => {
	// Set mobile viewport for all burger menu tests
	test.beforeEach(async ({ page }) => {
		await page.setViewportSize({ width: 370, height: 667 });
	});

	// TC-BURGER-001
	test(
		'[TC-BURGER-001] Burger menu opens and closes correctly',
		{
			tag: ['@navigation', '@mobile', '@burger-menu', '@black-box', '@regression', '@a11y']
		},
		async ({ page }) => {
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

			// Close the burger menu by clicking the button again
			await burgerButton.click();
			await expect(burgerButton).toHaveAttribute('aria-expanded', 'false');
			await expect(homeLink).toBeHidden();
		}
	);

	// TC-BURGER-002
	test(
		'[TC-BURGER-002] Burger menu navigation links work',
		{
			tag: ['@navigation', '@mobile', '@burger-menu', '@black-box', '@regression', '@a11y']
		},
		async ({ page }) => {
			// Start on Home (localized en-US)
			await page.goto('http://localhost:5173/?locale=en-US');
			await expect(page).toHaveTitle(/Home.*TMDB/);

			const burgerButton = page.getByRole('button', {
				name: 'Open or close navigation'
			});
			const tvShowsLink = page.getByRole('link', { name: 'TV shows' });
			const homeLink = page.getByRole('link', { name: 'Home' });
			const moviesLink = page.getByRole('link', { name: 'Movies' });

			async function openBurgerMenu() {
				await expect(burgerButton).toBeVisible({ timeout: 5000 });
				await expect(burgerButton).toHaveAttribute('aria-expanded', 'false', {
					timeout: 5000
				});

				await burgerButton.click();

				await expect(burgerButton).toHaveAttribute('aria-expanded', 'true', {
					timeout: 5000
				});
			}

			// Open menu and navigate to TV shows
			await openBurgerMenu();
			await expect(tvShowsLink).toBeVisible({ timeout: 5000 });
			await tvShowsLink.click();
			await expect(page).toHaveTitle(/TV.*TMDB/);

			// Open menu on the TV shows page and return Home
			await openBurgerMenu();
			await expect(homeLink).toBeVisible({ timeout: 5000 });
			await homeLink.click();
			await expect(page).toHaveTitle(/Home.*TMDB/);

			// Open menu on Home and navigate to Movies
			await openBurgerMenu();
			await expect(moviesLink).toBeVisible({ timeout: 5000 });
			await moviesLink.click();
			await expect(page).toHaveTitle(/Movies.*TMDB/);
		}
	);

	// TC-BURGER-003
	test(
		'[TC-BURGER-003] Burger menu closes when clicking outside',
		{
			tag: ['@navigation', '@mobile', '@burger-menu', '@black-box', '@regression', '@a11y']
		},
		async ({ page }) => {
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
		}
	);
});
