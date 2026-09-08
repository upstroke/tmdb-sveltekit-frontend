import { test, expect } from '@playwright/test';

/**
 * Feature: F-LM — Load More Trending Cards
 * Test Case: TC-LM-001 — Load More button loads additional cards (Home)
 * Test Case: TC-LM-002 — Load More button shows loading state during fetch (Home)
 */

test.describe('Load More - Home (F-LM)', () => {
	// TC-LM-001
	test('loads more cards on home page', {
		tag: ['@loadmore', '@home', '@black-box', '@regression']
	}, async ({ page }) => {
		await page.goto('http://localhost:5173/?locale=en-US');
		await expect(page).toHaveTitle(/Home.*TMDB/);

		const cardItems = page.locator('ul.media-card-list > li');
		await expect(cardItems.first()).toBeVisible({ timeout: 10000 });

		const initialCount = await cardItems.count();
		const loadMoreButton = page.getByRole('button', { name: 'More results' });

		// Wait for the next trending request before clicking the button
		await Promise.all([
			page.waitForResponse(
				(resp) =>
					resp.url().includes('/trending') &&
					resp.url().includes('page=') &&
					resp.status() === 200
			),
			loadMoreButton.click()
		]);

		// Wait for card count to increase
		await expect.poll(() => cardItems.count(), { timeout: 10000 }).toBeGreaterThan(initialCount);

		// Verify final count
		const finalCount = await cardItems.count();
		expect(finalCount).toBeGreaterThan(initialCount);
	});

	// TC-LM-002
	test('shows loading state during fetch', {
		tag: ['@loadmore', '@home', '@black-box', '@regression']
	}, async ({ page }) => {
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

		const loadMoreButton = page.getByRole('button', { name: 'More results' });

		// Start waiting for the next trending request before clicking the button
		const responsePromise = page.waitForResponse(
			(resp) =>
				resp.url().includes('/trending') &&
				resp.url().includes('page=') &&
				resp.status() === 200
		);

		// Click the Load More button
		await loadMoreButton.click();

		// Verify button shows loading state (disabled + aria-busy)
		await expect(loadMoreButton).toBeDisabled();
		await expect(loadMoreButton).toHaveAttribute('aria-busy', 'true');

		// Wait for the API response to complete
		await responsePromise;

		// Verify button is enabled again after loading completes
		await expect(loadMoreButton).toBeEnabled({ timeout: 10000 });
		await expect(loadMoreButton).toHaveAttribute('aria-busy', 'false');
	});
});