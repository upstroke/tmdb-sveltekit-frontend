import { test, expect } from '@playwright/test';

/**
 * Feature: F-LM — Load More Trending Cards
 * Test Case: TC-LM-003 — Load More button loads additional cards (Movies)
 * Test Case: TC-LM-004 — Load More handles error response (Movies)
 * Test Case: TC-LM-008 — Load More handles empty results (Movies)
 */

test.describe('Load More - Movies (F-LM)', () => {
	// TC-LM-003
	test('[TC-LM-003] loads more cards on movies page', {
		tag: ['@loadmore', '@movies', '@black-box', '@regression']
	}, async ({ page }) => {
		await page.goto('http://localhost:5173/movies?locale=en-US');
		await expect(page).toHaveTitle(/Movies.*TMDB/);

		const cardItems = page.locator('ul.media-card-list > li');
		await expect(cardItems.first()).toBeVisible({ timeout: 10000 });

		const initialCount = await cardItems.count();
		const loadMoreButton = page.getByRole('button', { name: 'More results' });

		// Wait for the next movies request before clicking the button
		await Promise.all([
			page.waitForResponse(
				(resp) =>
					resp.url().includes('/movies') &&
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

	// TC-LM-004
	test('[TC-LM-004] handles error response', {
		tag: ['@loadmore', '@movies', '@black-box', '@regression']
	}, async ({ page }) => {
		await page.goto('http://localhost:5173/movies?locale=en-US');
		await expect(page).toHaveTitle(/Movies.*TMDB/);

		const cardItems = page.locator('ul.media-card-list > li');
		await expect(cardItems.first()).toBeVisible({ timeout: 10000 });

		const initialCount = await cardItems.count();

		// Mock the movies API to return 500 error
		await page.route('**/movies?page=*', (route) => {
			route.fulfill({
				status: 500,
				body: JSON.stringify({ error: 'Internal Server Error' })
			});
		});

		const loadMoreButton = page.getByRole('button', { name: 'More results' });

		// Click the Load More button
		await loadMoreButton.click();

		// Wait for error response
		await page.waitForResponse(
			(resp) =>
				resp.url().includes('/movies') &&
				resp.url().includes('page=') &&
				resp.status() === 500
		);

		// Verify button is enabled again after error
		await expect(loadMoreButton).toBeEnabled({ timeout: 10000 });
		await expect(loadMoreButton).toHaveAttribute('aria-busy', 'false');
		await expect(loadMoreButton).not.toHaveClass(/loading/);

		// Verify card count unchanged (no new cards loaded)
		const finalCount = await cardItems.count();
		expect(finalCount).toBe(initialCount);
	});

	// TC-LM-008
	test('[TC-LM-008] handles empty results', {
		tag: ['@loadmore', '@movies', '@black-box', '@regression']
	}, async ({ page }) => {
		await page.goto('http://localhost:5173/movies?locale=en-US');
		await expect(page).toHaveTitle(/Movies.*TMDB/);

		const cardItems = page.locator('ul.media-card-list > li');
		await expect(cardItems.first()).toBeVisible({ timeout: 10000 });

		const initialCount = await cardItems.count();
		const loadMoreButton = page.getByRole('button', { name: 'More results' });

		// Wait for button to be enabled (initial load complete and hasMore is true)
		await expect(loadMoreButton).toBeEnabled({ timeout: 10000 });

		// Mock the movies API to return empty results (page 2)
		// Match any URL that contains /movies and page=2
		await page.route(/\/movies\?.*page=2/, (route) => {
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
				resp.url().includes('/movies') &&
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