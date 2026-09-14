import { test, expect } from '@playwright/test';

/**
 * Typeahead Search Acceptance Tests
 *
 * Based on the test plan for module "Typeahead Search".
 * Uses live search data for functional flows and route interception
 * only for deterministic loading and network-error states.
 *
 * Known fixtures from tests/fixtures/tmdb/tmdb.fixtures.js:
 * - Movie: "Fight Club" (id: 550, media_type: "movie")
 * - TV: "Dark" (id: 420, media_type: "tv")
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
		// Navigate to English version (default locale)
		await page.goto('/?locale=en-US');
	});

	function getSearchInput(page) {
		return page.getByRole('combobox', { name: /search/i });
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
		await searchInput.fill('Fight Club');

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
		await searchInput.fill('Dark');

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
		await searchInput.fill('XYZNOTFOUND123');

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

		// Three characters: no results
		await searchInput.fill('Her');
		await expect(getResults(page)).not.toBeVisible();

		// Clear and enter four characters
		await searchInput.clear();
		await searchInput.fill('Hero');

		await expect(getResults(page)).toBeVisible();
	});

	// -------------------------------------------------------------------------
	// TC-TS-005: Tab moves to next result (keyboard navigation)
	// -------------------------------------------------------------------------
	test('TC-TS-005: should move focus through result links with Tab', async ({ page }) => {
		const searchInput = getSearchInput(page);
		// Use a term that returns multiple results (e.g. "Fight" -> movie + TV)
		await searchInput.fill('Fight');

		await expect(getResults(page)).toBeVisible();

		const resultItems = getResults(page).getByRole('option');
		await expect(resultItems.first()).toBeVisible();

		// Move focus from search input to first result
		await page.keyboard.press('Tab');
		await expect(resultItems.first()).toBeFocused();

		// Move to second result
		await page.keyboard.press('Tab');
		await expect(resultItems.nth(1)).toBeFocused();
	});

	// -------------------------------------------------------------------------
	// TC-TS-006: Escape closes results
	// -------------------------------------------------------------------------
	test('TC-TS-006: should close results when pressing Escape', async ({ page }) => {
		const searchInput = getSearchInput(page);
		await searchInput.fill('Fight Club');

		await expect(getResults(page)).toBeVisible();

		// Press Escape in the search field
		await searchInput.press('Escape');

		await expect(getResults(page)).not.toBeVisible();
	});

	// -------------------------------------------------------------------------
	// TC-TS-007: Loading status during pending request
	// -------------------------------------------------------------------------
	test('TC-TS-007: should display loading status while request is pending', async ({ page }) => {
		// Hold the /search request
		let releaseRequest;
		const requestHeld = new Promise((resolve) => {
			releaseRequest = resolve;
		});

		await page.route('**/search*', async (route) => {
			await requestHeld;
			await route.continue();
		});

		const searchInput = getSearchInput(page);
		await searchInput.fill('Hero');

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
	test('TC-TS-008: should display error alert when request fails', async ({ page }) => {
		// Abort /search requests
		await page.route('**/search*', async (route) => {
			await route.abort('failed');
		});

		const searchInput = getSearchInput(page);
		await searchInput.fill('Hero');

		// Status layer with alert should appear
		await expect(getStatusLayer(page)).toBeVisible();
		await expect(getStatusLayer(page).getByRole('alert')).toBeVisible();

		// Results must not be visible on error
		await expect(getResults(page)).not.toBeVisible();
	});
});
