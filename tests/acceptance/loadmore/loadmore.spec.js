import { test, expect } from '@playwright/test';

/**
 * Test Case: TC-LM-001 — Click Load More Link to load more cards
 * Test Case: TC-LM-002 — Load More button shows loading state during fetch
 */


test.describe('Main navigation', () => {
	// TC-NAV-001
	test('Click Load More Button loads more Cards', async ({ page }) => {
		// Start on Home (localized en-US)
		await page.goto('http://localhost:5173/?locale=en-US');
		await expect(page).toHaveTitle(/Home.*TMDB/);

		// Get initial count of cards
		const cardItems = page.locator('ul.media-card-list > li');
		await expect(cardItems.first()).toBeVisible({ timeout: 10000 });

		const initialCount = await cardItems.count();

		// Wait for the trending API response
		const responsePromise = page.waitForResponse(
			(resp) =>
				resp.url().includes('/trending') && resp.url().includes('page=') && resp.status() === 200
		);

		// Click the Load More button
		await page.getByRole('button', { name: 'More results' }).click();

		// Wait for the API response to complete
		await responsePromise;

		// Click the Load More button
		await page.getByRole('button', { name: 'More results' }).click();

		// Wait for card count to increase (auto-retry until timeout)
		await expect.poll(() => cardItems.count(), { timeout: 10000 }).toBeGreaterThan(initialCount);

		// Verify final count
		const finalCount = await cardItems.count();
		expect(finalCount).toBeGreaterThan(initialCount);
	});

	// TC-LM-002
	test('Load More button shows loading state during fetch', async ({ page }) => {
		await page.goto('http://localhost:5173/?locale=en-US');
		await expect(page).toHaveTitle(/Home.*TMDB/);

		const cardItems = page.locator('ul.media-card-list > li');
		await expect(cardItems.first()).toBeVisible({ timeout: 10000 });

		// Mock the trending API with artificial delay to test loading state
		await page.route('**/trending?page=*', async (route) => {
			// Add 2-second delay to simulate slow network
			await new Promise((resolve) => setTimeout(resolve, 2000));
			await route.continue();
		});

		// Click the Load More button
		const loadMoreButton = page.getByRole('button', { name: 'More results' });
		await loadMoreButton.click();

		// Verify button shows loading state (disabled + aria-busy)
		await expect(loadMoreButton).toBeDisabled();
		await expect(loadMoreButton).toHaveAttribute('aria-busy', 'true');

		// Wait for the API response to complete
		await page.waitForResponse(
			(resp) =>
				resp.url().includes('/trending') && resp.url().includes('page=') && resp.status() === 200
		);

		// Verify button is enabled again after loading completes
		await expect(loadMoreButton).toBeEnabled({ timeout: 10000 });
		await expect(loadMoreButton).toHaveAttribute('aria-busy', 'false');
	});
});
