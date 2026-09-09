import { test, expect } from '@playwright/test';

/**
 * Feature: F-LM — Load More Trending Cards
 * Test Case: TC-LM-005 — Load More button loads additional cards (TV Shows)
 * Test Case: TC-LM-006 — Load More handles empty results (TV Shows)
 */

test.describe('Load More - TV Shows (F-LM)', () => {
	// TC-LM-005
	test('[TC-LM-005] loads more cards on tv shows page', {
		tag: ['@loadmore', '@tvshows', '@black-box', '@regression']
	}, async ({ page }) => {
		await page.goto('http://localhost:5173/tv-shows?locale=en-US');
		await expect(page).toHaveTitle(/TV.*TMDB/);

		const cardItems = page.locator('ul.media-card-list > li');
		await expect(cardItems.first()).toBeVisible({ timeout: 10000 });

		const initialCount = await cardItems.count();
		const loadMoreButton = page.getByRole('button', { name: 'More results' });

		// Wait for the next tv-shows request before clicking the button
		await Promise.all([
			page.waitForResponse(
				(resp) =>
					resp.url().includes('/tv-shows') &&
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

	// TC-LM-006
	test('[TC-LM-006] handles empty results', {
		tag: ['@loadmore', '@tvshows', '@black-box', '@regression']
	}, async ({ page }) => {
		await page.goto('http://localhost:5173/tv-shows?locale=en-US');
		await expect(page).toHaveTitle(/TV.*TMDB/);

		const cardItems = page.locator('ul.media-card-list > li');
		await expect(cardItems.first()).toBeVisible({ timeout: 10000 });

		const initialCount = await cardItems.count();
		const loadMoreButton = page.getByRole('button', { name: 'More results' });

		// Wait for button to be enabled (initial load complete and hasMore is true)
		await expect(loadMoreButton).toBeEnabled({ timeout: 10000 });

		// Mock the tv-shows API to return empty results (page 2)
		// Match any URL that contains /tv-shows and page=2
		await page.route(/\/tv-shows\?.*page=2/, (route) => {
			route.fulfill({
				status: 200,
				body: JSON.stringify({
					cards: [],
					page: 2,
					hasMore: false
				})
			});
		});

		// Click the Load More button
		await loadMoreButton.click();

		// Wait for the API response with empty results
		await page.waitForResponse(
			(resp) =>
				resp.url().includes('/tv-shows') &&
				resp.url().includes('page=2') &&
				resp.status() === 200
		);

		// Wait for loading to complete (button is no longer in loading state)
		// The button will be disabled because hasMore is now false
		await expect(loadMoreButton).toHaveAttribute('aria-busy', 'false', { timeout: 10000 });

		// Verify card count unchanged (no new cards loaded)
		const finalCount = await cardItems.count();
		expect(finalCount).toBe(initialCount);

		// Verify button is disabled (no more results available)
		// Button should NOT have the loading class
		await expect(loadMoreButton).toBeDisabled();
		await expect(loadMoreButton).not.toHaveClass(/loading/);
	});
});