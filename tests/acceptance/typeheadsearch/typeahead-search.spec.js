import { test, expect } from '@playwright/test';

/**
 * Typeahead Search Acceptance Tests
 *
 * Based on the test plan for module "Typeahead Search".
 * Uses LIVE search data for functional flows.
 * Route interception is used ONLY for deterministic loading and network-error states.
 *
 * All tests navigate to the English version of the site (default locale).
 *
 * i18n texts (en-US):
 * - messages.searchLoading: "Searching …"
 * - messages.searchNoResults: "No results found."
 * - messages.searchError: "Search could not be loaded."
 */

test.describe('Typeahead Search', () => {
	test.beforeEach(async ({ page }) => {
		// Full page reload to ensure clean state
		await page.goto('/?locale=en-US', { waitUntil: 'networkidle' });
	});

	function getSearchInput(page) {
		return page.locator('#typeahead-search-input');
	}

	function getResults(page) {
		return page.locator('#typeahead-search-results');
	}

	function getStatusLayer(page) {
		return page.locator('#status-messages-layer');
	}

	// -------------------------------------------------------------------------
	// TC-TS-001: Result opens matching details page (Movie)
	// -------------------------------------------------------------------------
	test('TC-TS-001: should display movie results and open matching details page', async ({ page }) => {
		const searchInput = getSearchInput(page);

		const searchResponsePromise = page.waitForResponse(
			(response) => {
				const url = new URL(response.url());
				return (
					response.request().method() === 'GET' &&
					url.pathname === '/search' &&
					url.searchParams.get('q')?.toLowerCase().includes('fight')
				);
			}
		);

		await searchInput.click();
		await searchInput.pressSequentially('Fight Club', { delay: 50 });

		const response = await searchResponsePromise;
		expect(response.ok()).toBe(true);

		await expect(getResults(page)).toBeVisible();

		const resultItems = getResults(page).getByRole('option');
		const firstResult = resultItems.first();
		await expect(firstResult).toBeVisible();

		const firstResultText = await firstResult.textContent();
		expect(firstResultText).toContain('Fight Club');

		await firstResult.click();

		// Expect navigation to a movie or TV details route
		await expect(page).toHaveURL(/\/(movies|tv-shows)\/\d+/);

		const heroTitle = page.locator('#details-hero-title');
		await expect(heroTitle).toBeVisible();

		const heroTitleText = await heroTitle.textContent();
		expect(heroTitleText).toContain('Fight Club');
	});

	// -------------------------------------------------------------------------
	// TC-TS-002: TV-show result opens TV details page
	// -------------------------------------------------------------------------
	test('TC-TS-002: should display tv show results and open tv details page', async ({ page }) => {
		const searchInput = getSearchInput(page);

		const searchResponsePromise = page.waitForResponse(
			(response) => {
				const url = new URL(response.url());
				return (
					response.request().method() === 'GET' &&
					url.pathname === '/search' &&
					url.searchParams.get('q')?.toLowerCase().includes('dark')
				);
			}
		);

		await searchInput.click();
		await searchInput.pressSequentially('Dark', { delay: 50 });

		const response = await searchResponsePromise;
		expect(response.ok()).toBe(true);

		await expect(getResults(page)).toBeVisible();

		const resultItems = getResults(page).getByRole('option');
		await expect(resultItems.first()).toBeVisible();

		// Find first TV result by href pattern
		const tvResultLink = page.locator('a.result[data-result-link="true"][href^="/tv-shows/"]').first();
		await expect(tvResultLink).toBeVisible();

		const tvResultText = await tvResultLink.textContent();
		expect(tvResultText).toContain('Dark');

		await tvResultLink.click();

		await expect(page).toHaveURL(/\/tv-shows\/\d+/);

		const heroTitle = page.locator('#details-hero-title');
		await expect(heroTitle).toBeVisible();

		const heroTitleText = await heroTitle.textContent();
		expect(heroTitleText).toContain('Dark');
	});

	// -------------------------------------------------------------------------
	// TC-TS-003: No-results status
	// -------------------------------------------------------------------------
	test('TC-TS-003: should display no results message when no results are found', async ({ page }) => {
		const searchInput = getSearchInput(page);

		const searchResponsePromise = page.waitForResponse(
			(response) => {
				const url = new URL(response.url());
				return (
					response.request().method() === 'GET' &&
					url.pathname === '/search' &&
					url.searchParams.get('q')?.includes('XYZNOTFOUND123')
				);
			}
		);

		await searchInput.click();
		await searchInput.pressSequentially('XYZNOTFOUND123', { delay: 50 });

		const response = await searchResponsePromise;
		expect(response.ok()).toBe(true);

		// Wait for status layer to appear
		await expect(getStatusLayer(page)).toBeVisible();

		const statusMessage = getStatusLayer(page).getByRole('status');
		// Exact match for en-US: "No results found."
		await expect(statusMessage).toContainText('No results found.');

		await expect(getResults(page)).not.toBeVisible();
	});

	// -------------------------------------------------------------------------
	// TC-TS-004: Results start at four characters (boundary)
	// -------------------------------------------------------------------------
	test('TC-TS-004: should not show results for three characters but for four', async ({ page }) => {
		const searchInput = getSearchInput(page);

		// Three characters: no results (component threshold)
		await searchInput.click();
		await searchInput.pressSequentially('Her', { delay: 50 });
		await expect(getResults(page)).not.toBeVisible();

		// Clear and enter four characters
		await searchInput.clear();

		const searchResponsePromise = page.waitForResponse(
			(response) => {
				const url = new URL(response.url());
				return (
					response.request().method() === 'GET' &&
					url.pathname === '/search' &&
					url.searchParams.get('q')?.includes('Hero')
				);
			}
		);

		await searchInput.pressSequentially('Hero', { delay: 50 });

		const response = await searchResponsePromise;
		expect(response.ok()).toBe(true);

		await expect(getResults(page)).toBeVisible();
	});

	// -------------------------------------------------------------------------
	// TC-TS-006: Click outside header closes results
	// -------------------------------------------------------------------------
	test('TC-TS-005: should close results when clicking outside in header', async ({ page }) => {
		const searchInput = getSearchInput(page);

		const searchResponsePromise = page.waitForResponse(
			(response) => {
				const url = new URL(response.url());
				return (
					response.request().method() === 'GET' &&
					url.pathname === '/search' &&
					url.searchParams.get('q')?.toLowerCase().includes('fight')
				);
			}
		);

		await searchInput.click();
		await searchInput.pressSequentially('Fight Club', { delay: 50 });

		const response = await searchResponsePromise;
		expect(response.ok()).toBe(true);

		await expect(getResults(page)).toBeVisible();

		// Click outside the search area (e.g., on the page body or another element)
		await page.mouse.click(100, 100);

		await expect(getResults(page)).not.toBeVisible();
	});

	// -------------------------------------------------------------------------
	// TC-TS-007: Loading status during pending request
	// -------------------------------------------------------------------------
	test('TC-TS-006: should display loading status while request is pending', async ({ page }) => {
		// Hold the /search request
		let releaseRequest;
		const requestHeld = new Promise((resolve) => {
			releaseRequest = resolve;
		});

		await page.route('**/search**', async (route) => {
			await requestHeld;
			await route.continue();
		});

		const searchInput = getSearchInput(page);
		await searchInput.click();
		await searchInput.pressSequentially('Hero', { delay: 50 });

		// Status layer with "Searching …" should appear
		await expect(getStatusLayer(page)).toBeVisible();
		// Exact match for en-US: "Searching …"
		await expect(getStatusLayer(page).getByRole('status')).toContainText('Searching …');

		// Results must not be visible while loading
		await expect(getResults(page)).not.toBeVisible();

		// Release the request so the test can finish
		releaseRequest();
	});

	// -------------------------------------------------------------------------
	// TC-TS-008: Network-error status
	// -------------------------------------------------------------------------
	test('TC-TS-007: should display error alert when request fails', async ({ page }) => {
		// Abort /search requests
		await page.route('**/search**', async (route) => {
			await route.abort('failed');
		});

		const searchInput = getSearchInput(page);
		await searchInput.click();
		await searchInput.pressSequentially('Hero', { delay: 50 });

		// Status layer with alert should appear
		await expect(getStatusLayer(page)).toBeVisible();
		await expect(getStatusLayer(page).getByRole('alert')).toBeVisible();

		// Results must not be visible on error
		await expect(getResults(page)).not.toBeVisible();
	});
});
