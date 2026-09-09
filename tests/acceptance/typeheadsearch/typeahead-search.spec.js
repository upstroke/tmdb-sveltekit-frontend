import { test, expect } from '@playwright/test';

/**
 * Feature: F-TS — Typeahead Search
 * Test cases:
 * - TC-TS-001: Search, select a result, and verify the details title
 * - TC-TS-002: Search for a TV show and open its details page
 * - TC-TS-003: No-results feedback is displayed for an unknown term
 * - TC-TS-004: Results are displayed only after four characters
 * - TC-TS-005: Tab moves focus from the first to the second search result
 * - TC-TS-006: Escape closes the search results
 * - TC-TS-007: Loading state is shown during search
 * - TC-TS-008: Error state is shown when search fails
 */

test.describe('Typeahead Search', () => {
	test.beforeEach(async ({ page }) => {
		await page.setViewportSize({ width: 1920, height: 1080 });
		await page.goto('http://localhost:5173/?locale=en-US');
		await expect(page).toHaveTitle(/Home.*TMDB/);
	});

	// TC-TS-001
	test(
		'[TC-TS-001] Search result link opens its details page with the matching title',
		{
			tag: ['@search', '@typeahead', '@e2e', '@black-box', '@regression']
		},
		async ({ page }) => {
			const searchInput = page.getByRole('searchbox');
			await searchInput.click();
			await searchInput.clear();
			await searchInput.fill('Hero');

			const resultsContainer = page.locator('#typeahead-search-results');
			await resultsContainer.waitFor({ state: 'visible', timeout: 5000 });

			const firstResultLink = resultsContainer.locator('a.result[data-result-link="true"]').first();
			const searchResultTitle = await firstResultLink
				.locator('.result-header .title')
				.textContent();

			await firstResultLink.click();

			const detailPageTitle = page.locator('#details-hero-title');
			await expect(detailPageTitle).toBeVisible({ timeout: 5000 });
			await expect(page).toHaveURL(/\/(movies|tv-shows)\/\d+/);
			await expect(detailPageTitle).toHaveText(searchResultTitle ?? '');
		}
	);

	// TC-TS-002
	test(
		'[TC-TS-002] TV show search result opens a TV show details page',
		{
			tag: ['@search', '@typeahead', '@e2e', '@black-box', '@regression']
		},
		async ({ page }) => {
			const searchInput = page.getByRole('searchbox');
			await searchInput.click();
			await searchInput.clear();
			await searchInput.fill('Breaking Bad');

			const resultsContainer = page.locator('#typeahead-search-results');
			await resultsContainer.waitFor({ state: 'visible', timeout: 5000 });

			// Find first TV show result and wait for it to be visible
			const firstTvShowLink = resultsContainer.locator('a.result[href^="/tv-shows/"]').first();
			await expect(firstTvShowLink).toBeVisible({ timeout: 5000 });

			const searchResultTitle = await firstTvShowLink
				.locator('.result-header .title')
				.textContent();
			await firstTvShowLink.click();

			const detailPageTitle = page.locator('#details-hero-title');
			await expect(detailPageTitle).toBeVisible({ timeout: 5000 });
			await expect(page).toHaveURL(/\/tv-shows\/\d+/);
			await expect(detailPageTitle).toHaveText(searchResultTitle ?? '');
		}
	);

	// TC-TS-003
	test(
		'[TC-TS-003] No-results feedback is displayed for an unknown search term',
		{
			tag: ['@search', '@typeahead', '@e2e', '@black-box', '@negative', '@regression']
		},
		async ({ page }) => {
			const searchInput = page.getByRole('searchbox');
			await searchInput.click();
			await searchInput.clear();
			await searchInput.fill('XYZNOTFOUND123');

			// Wait for status messages layer (shown when no results)
			const statusMessagesLayer = page.locator('#status-messages-layer');
			await statusMessagesLayer.waitFor({ state: 'visible', timeout: 5000 });

			// Verify "No results found." message is shown with role="status"
			await expect(statusMessagesLayer.getByRole('status')).toContainText('No results found.');

			// Verify results container is NOT rendered (since there are no results)
			await expect(page.locator('#typeahead-search-results')).toHaveCount(0);
		}
	);

	// TC-TS-004
	test(
		'[TC-TS-004] Search results are displayed only after four characters',
		{
			tag: ['@search', '@typeahead', '@e2e', '@black-box', '@boundary', '@regression']
		},
		async ({ page }) => {
			const searchInput = page.getByRole('searchbox');
			await searchInput.click();
			await searchInput.clear();

			const resultsContainer = page.locator('#typeahead-search-results');

			await searchInput.fill('Her');
			await expect(resultsContainer).toBeHidden();

			await searchInput.fill('Hero');
			await resultsContainer.waitFor({ state: 'visible', timeout: 5000 });
		}
	);

	// TC-TS-005
	test(
		'[TC-TS-005] Tab moves focus from the first to the second search result',
		{
			tag: ['@search', '@typeahead', '@e2e', '@accessibility', '@black-box', '@regression']
		},
		async ({ page }) => {
			const searchInput = page.getByRole('searchbox');
			await searchInput.click();
			await searchInput.clear();
			await searchInput.fill('Hero');

			// Wait for results container
			const resultsContainer = page.locator('#typeahead-search-results');
			await resultsContainer.waitFor({ state: 'visible', timeout: 5000 });

			// Verify at least 2 results exist
			const resultLinks = resultsContainer.locator('a.result[data-result-link="true"]');
			await expect(resultLinks.count()).resolves.toBeGreaterThanOrEqual(2);

			const firstResult = resultLinks.first();
			const secondResult = resultLinks.nth(1);

			await expect(firstResult).toBeVisible();
			await expect(secondResult).toBeVisible();

			await page.keyboard.press('Tab');
			await expect(firstResult).toBeFocused();

			await page.keyboard.press('Tab');
			await expect(secondResult).toBeFocused();
		}
	);

	// TC-TS-006
	test(
		'[TC-TS-006] Escape closes the search results',
		{
			tag: ['@search', '@typeahead', '@e2e', '@accessibility', '@black-box', '@regression']
		},
		async ({ page }) => {
			const searchInput = page.getByRole('searchbox');
			await searchInput.click();
			await searchInput.clear();
			await searchInput.fill('Hero');

			const resultsContainer = page.locator('#typeahead-search-results');
			await resultsContainer.waitFor({ state: 'visible', timeout: 5000 });

			await page.keyboard.press('Escape');
			await expect(resultsContainer).toBeHidden({ timeout: 2000 });
		}
	);

	// TC-TS-007
	test(
		'[TC-TS-007] Searching message is displayed while a search is pending',
		{
			tag: ['@search', '@typeahead', '@e2e', '@black-box', '@regression']
		},
		async ({ page }) => {
			// Block the search API initially, then release after we've verified the loading state
			let releaseRequest;
			const requestHeld = new Promise((resolve) => {
				releaseRequest = resolve;
			});

			await page.route('**/search?*', async (route) => {
				// Hold the request until we release it
				await requestHeld;
				await route.continue();
			});

			const searchInput = page.getByRole('searchbox');
			await searchInput.click();
			await searchInput.clear();
			await searchInput.fill('Hero');

			const statusMessagesLayer = page.locator('#status-messages-layer');
			await expect(statusMessagesLayer).toBeVisible({ timeout: 5000 });

			// Verify "Searching …" is shown (request is still held)
			await expect(statusMessagesLayer.getByRole('status')).toContainText('Searching …');

			// Verify results container is NOT rendered while loading
			await expect(page.locator('#typeahead-search-results')).toHaveCount(0);

			// Release the blocked request so the search can complete
			releaseRequest();

			// Wait for results to appear after the request completes
			const resultsContainer = page.locator('#typeahead-search-results');
			await resultsContainer.waitFor({ state: 'visible', timeout: 5000 });
		}
	);

	// TC-TS-008
	test(
		'[TC-TS-008] Failed-to-fetch message is displayed when the search request fails',
		{
			tag: ['@search', '@typeahead', '@e2e', '@black-box', '@negative', '@regression']
		},
		async ({ page }) => {
			// Mock the search API to fail
			await page.route('**/search?*', async (route) => {
				await route.abort('failed');
			});

			const searchInput = page.getByRole('searchbox');
			await searchInput.click();
			await searchInput.clear();
			await searchInput.fill('Hero');

			const statusMessagesLayer = page.locator('#status-messages-layer');
			await statusMessagesLayer.waitFor({ state: 'visible', timeout: 5000 });

			// Verify error message is shown with role="alert" (browser-specific text)
			await expect(statusMessagesLayer.getByRole('alert')).toBeVisible({ timeout: 5000 });

			// Verify results container is NOT rendered (since search failed)
			await expect(page.locator('#typeahead-search-results')).toHaveCount(0);
		}
	);
});
