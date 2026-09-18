import { test, expect } from '@playwright/test';

/**
 * Feature: F-NAV — Main Navigation
 * Test Case: TC-NAV-001 — Desktop: all main pages are reachable
 * Test Case: TC-NAV-002 — Mobile: burger menu opens and closes correctly
 * Test Case: TC-NAV-003 — Mobile: burger menu navigation links work
 * Test Case: TC-NAV-004 — Mobile: burger menu closes when clicking outside
 */

function createBurgerMenuHelpers(page) {
	const burgerButton = page.getByRole('button', {
		name: 'Open or close navigation'
	});

	const homeLink = page.getByRole('link', {
		name: 'Home'
	});

	return {
		burgerButton,
		homeLink,

		async openBurgerMenu() {
			await expect(burgerButton).toBeVisible({ timeout: 5000 });
			await expect(burgerButton).toHaveAttribute('aria-expanded', 'false', {
				timeout: 5000
			});

			for (let attempt = 0; attempt < 3; attempt++) {
				await burgerButton.click();

				try {
					await expect(burgerButton).toHaveAttribute('aria-expanded', 'true', {
						timeout: 1000
					});
					await expect(homeLink).toBeVisible({ timeout: 1000 });
					return;
				} catch {}
			}

			await expect(burgerButton).toHaveAttribute('aria-expanded', 'true', {
				timeout: 5000
			});
			await expect(homeLink).toBeVisible({ timeout: 5000 });
		},

		async closeBurgerMenu() {
			await expect(burgerButton).toBeVisible({ timeout: 5000 });

			for (let attempt = 0; attempt < 3; attempt++) {
				if ((await burgerButton.getAttribute('aria-expanded')) === 'false') {
					await expect(homeLink).toBeHidden({ timeout: 5000 });
					return;
				}

				await burgerButton.click();
			}

			await expect(burgerButton).toHaveAttribute('aria-expanded', 'false', {
				timeout: 5000
			});
			await expect(homeLink).toBeHidden({ timeout: 5000 });
		}
	};
}

test.describe('Main navigation', () => {
	test.beforeEach(async ({ page }) => {
		await page.setViewportSize({ width: 1920, height: 1080 });
	});

	// -------------------------------------------------------------------------
	// TC-NAV-001
	// -------------------------------------------------------------------------
	test(
		'[TC-NAV-001] Desktop: All main pages are reachable',
		{
			tag: ['@navigation', '@desktop', '@black-box', '@regression', '@a11y']
		},
		async ({ page }) => {
			await page.goto('/?locale=en-US');
			await expect(page).toHaveTitle(/Home.*TMDB/);

			await page.locator('#movies a').click();
			await expect(page).toHaveTitle(/Movies.*TMDB/);
			await expect(page.locator('#movies a')).toHaveAttribute('aria-current', 'page');

			await page.locator('#tvshows a').click();
			await expect(page).toHaveTitle(/TV.*TMDB/);
			await expect(page.locator('#tvshows a')).toHaveAttribute('aria-current', 'page');

			await page.locator('#home a').click();
			await expect(page).toHaveTitle(/Home.*TMDB/);
			await expect(page.locator('#home a')).toHaveAttribute('aria-current', 'page');
		}
	);

	// -------------------------------------------------------------------------
	// TC-NAV-002
	// -------------------------------------------------------------------------
	test(
		'[TC-NAV-002] Mobile: Burger menu opens and closes correctly',
		{
			tag: ['@navigation', '@mobile', '@burger-menu', '@black-box', '@regression', '@a11y']
		},
		async ({ page }) => {
			await page.setViewportSize({ width: 370, height: 667 });

			await page.goto('/?locale=en-US');
			await expect(page).toHaveTitle(/Home.*TMDB/);

			const { burgerButton, homeLink, openBurgerMenu, closeBurgerMenu } =
				createBurgerMenuHelpers(page);

			await expect(burgerButton).toBeVisible();
			await expect(burgerButton).toHaveAttribute('aria-expanded', 'false');
			await expect(homeLink).toBeHidden();

			await openBurgerMenu();
			await closeBurgerMenu();
		}
	);

	// -------------------------------------------------------------------------
	// TC-NAV-003
	// -------------------------------------------------------------------------
	test(
		'[TC-NAV-003] Mobile: Burger menu navigation links work',
		{
			tag: ['@navigation', '@mobile', '@burger-menu', '@black-box', '@regression', '@a11y'],
			retries: 2
		},
		async ({ page }) => {
			await page.setViewportSize({ width: 370, height: 667 });

			await page.goto('/?locale=en-US');
			await expect(page).toHaveTitle(/Home.*TMDB/);

			const { burgerButton, homeLink, openBurgerMenu, closeBurgerMenu } =
				createBurgerMenuHelpers(page);
			const tvShowsLink = page.getByRole('link', { name: 'TV shows' });
			const moviesLink = page.getByRole('link', { name: 'Movies' });

			await closeBurgerMenu();

			await expect(burgerButton).toBeVisible();
			await expect(burgerButton).toHaveAttribute('aria-expanded', 'false');
			await expect(homeLink).toBeHidden();

			await openBurgerMenu();
			await expect(tvShowsLink).toBeVisible({ timeout: 5000 });

			await tvShowsLink.click();
			await expect(page).toHaveTitle(/TV.*TMDB/);

			await closeBurgerMenu();
			await expect(burgerButton).toBeVisible();
			await expect(burgerButton).toHaveAttribute('aria-expanded', 'false');
			await expect(homeLink).toBeHidden();

			await openBurgerMenu();
			await expect(homeLink).toBeVisible({ timeout: 5000 });

			await homeLink.click();
			await expect(page).toHaveTitle(/Home.*TMDB/);

			await closeBurgerMenu();
			await expect(burgerButton).toBeVisible();
			await expect(burgerButton).toHaveAttribute('aria-expanded', 'false');
			await expect(homeLink).toBeHidden();

			await openBurgerMenu();
			await expect(moviesLink).toBeVisible({ timeout: 5000 });

			await moviesLink.click();
			await expect(page).toHaveTitle(/Movies.*TMDB/);
		}
	);

	// -------------------------------------------------------------------------
	// TC-NAV-004
	// -------------------------------------------------------------------------
	test(
		'[TC-NAV-004] Mobile: Burger menu closes when clicking outside',
		{
			tag: ['@navigation', '@mobile', '@burger-menu', '@black-box', '@regression', '@a11y']
		},
		async ({ page }) => {
			await page.setViewportSize({ width: 370, height: 667 });

			await page.goto('/?locale=en-US');
			await expect(page).toHaveTitle(/Home.*TMDB/);

			const { burgerButton, homeLink, openBurgerMenu, closeBurgerMenu } =
				createBurgerMenuHelpers(page);

			await closeBurgerMenu();

			await expect(burgerButton).toBeVisible();
			await expect(burgerButton).toHaveAttribute('aria-expanded', 'false');
			await expect(homeLink).toBeHidden();

			await openBurgerMenu();

			await page.mouse.click(340, 500);

			await expect(burgerButton).toHaveAttribute('aria-expanded', 'false');
			await expect(homeLink).toBeHidden();
		}
	);
});
